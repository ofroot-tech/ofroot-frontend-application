import { createHmac, timingSafeEqual } from 'node:crypto';
import { z } from 'zod';
import { subscriptionSecret } from './config';
import { SubscriptionError, type SignalSubscriber } from './types';

const payloadSchema = z.object({ sid: z.uuid(), version: z.number().int().positive(), purpose: z.enum(['manage', 'unsubscribe']), issued: z.number().int(), expires: z.number().int() }).strict();
export type SubscriptionToken = z.infer<typeof payloadSchema>;

/** Tokens carry a scoped subscriber identity, never an email address. The
 * unsubscribe purpose cannot be used to read or alter delivery preferences. */
export function createSubscriptionToken(subscriber: Pick<SignalSubscriber, 'id' | 'tokenVersion'>, purpose: SubscriptionToken['purpose'], issuedAt = new Date()): string {
  const issued = Math.floor(issuedAt.getTime() / 1000);
  const payload = Buffer.from(JSON.stringify({ sid: subscriber.id, version: subscriber.tokenVersion, purpose, issued, expires: issued + (purpose === 'manage' ? 90 : 365) * 86400 })).toString('base64url');
  const signature = createHmac('sha256', subscriptionSecret()).update(`signal-subscription:v1:${payload}`).digest('base64url');
  return `${payload}.${signature}`;
}

export function verifySubscriptionToken(token: string, purposes: SubscriptionToken['purpose'][] = ['manage'], now = new Date()): SubscriptionToken {
  const invalid = () => new SubscriptionError('This email link is invalid or expired. Request a fresh link.', 400);
  if (typeof token !== 'string' || token.length > 1500) throw invalid();
  const [payload, signature, extra] = token.split('.');
  if (!payload || !signature || extra || !/^[A-Za-z0-9_-]+$/.test(payload) || !/^[A-Za-z0-9_-]{43}$/.test(signature)) throw invalid();
  const expected = createHmac('sha256', subscriptionSecret()).update(`signal-subscription:v1:${payload}`).digest('base64url');
  if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) throw invalid();
  let decoded: unknown;
  try { decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')); } catch { throw invalid(); }
  const parsed = payloadSchema.safeParse(decoded);
  const timestamp = Math.floor(now.getTime() / 1000);
  if (!parsed.success || !purposes.includes(parsed.data.purpose) || parsed.data.issued > timestamp + 60 || parsed.data.expires <= timestamp || parsed.data.expires <= parsed.data.issued) throw invalid();
  return parsed.data;
}
