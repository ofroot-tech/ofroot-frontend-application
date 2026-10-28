import { createHmac, timingSafeEqual } from 'node:crypto';
import { SubscriptionError } from './types';
import { applyDigestSuppression, ensureDigestSchema } from './digest';
import { getSubscriptionDatabase } from './store';

export const MAX_SIGNAL_WEBHOOK_BYTES = 65_536;
type WebhookHeaders = { id: string | null; timestamp: string | null; signature: string | null };
const SUPPRESSION_EVENTS = new Set(['email.bounced', 'email.complained', 'email.suppressed']);

/** Verify the raw byte-equivalent UTF-8 body before parsing it. This implements
 * Svix's signed id.timestamp.payload contract with replay age and length bounds. */
export function verifySignalWebhook(raw: string, headers: WebhookHeaders, secret = process.env.RESEND_WEBHOOK_SECRET, now = new Date()): { type: string; providerId: string | null; eventId: string } {
  if (!secret) throw new SubscriptionError('Email event verification is not configured.', 503);
  const invalid = () => new SubscriptionError('Invalid email event.', 400);
  if (Buffer.byteLength(raw, 'utf8') > MAX_SIGNAL_WEBHOOK_BYTES || !headers.id || headers.id.length > 200 || !/^[A-Za-z0-9_-]+$/.test(headers.id)
    || !headers.timestamp || !/^\d{10}$/.test(headers.timestamp) || !headers.signature || headers.signature.length > 2048) throw invalid();
  const timestamp = Number(headers.timestamp);
  if (Math.abs(now.getTime() / 1000 - timestamp) > 300) throw invalid();
  const encoded = secret.startsWith('whsec_') ? secret.slice(6) : '';
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(encoded)) throw invalid();
  const key = Buffer.from(encoded, 'base64');
  if (key.length < 16) throw invalid();
  const expected = createHmac('sha256', key).update(`${headers.id}.${headers.timestamp}.${raw}`).digest();
  const verified = headers.signature.split(/\s+/).some(part => {
    const [version, signature, extra] = part.split(',');
    if (version !== 'v1' || !signature || extra || !/^[A-Za-z0-9+/]+={0,2}$/.test(signature)) return false;
    const received = Buffer.from(signature, 'base64');
    return received.length === expected.length && timingSafeEqual(received, expected);
  });
  if (!verified) throw invalid();
  let payload: unknown;
  try { payload = JSON.parse(raw); } catch { throw invalid(); }
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) throw invalid();
  const event = payload as { type?: unknown; data?: { email_id?: unknown } };
  if (typeof event.type !== 'string' || event.type.length > 100) throw invalid();
  const providerId = typeof event.data?.email_id === 'string' && /^[A-Za-z0-9_-]{1,128}$/.test(event.data.email_id) ? event.data.email_id : null;
  if (SUPPRESSION_EVENTS.has(event.type) && !providerId) throw invalid();
  return { type: event.type, providerId, eventId: headers.id };
}

export async function processSignalWebhook(raw: string, headers: WebhookHeaders): Promise<{ ok: true; ignored: boolean }> {
  const event = verifySignalWebhook(raw, headers);
  if (!SUPPRESSION_EVENTS.has(event.type) || !event.providerId) return { ok: true, ignored: true };
  await ensureDigestSchema();
  await getSubscriptionDatabase().query(`INSERT INTO ofroot_signal_email_events (id,event_type,provider_id)
    VALUES ($1,$2,$3) ON CONFLICT (id) DO NOTHING`, [event.eventId, event.type, event.providerId]);
  await applyDigestSuppression(event.providerId);
  return { ok: true, ignored: false };
}
