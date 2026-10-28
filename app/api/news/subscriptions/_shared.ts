import { NextResponse } from 'next/server';
import { SIGNAL_SITE_URL } from '@/app/lib/signal-subscriptions/config';
import { SubscriptionError } from '@/app/lib/signal-subscriptions/types';

export const subscriptionHeaders = { 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer', 'X-Content-Type-Options': 'nosniff' };

export function subscriptionResponse(value: unknown, status = 200) { return NextResponse.json(value, { status, headers: subscriptionHeaders }); }
export function subscriptionFailure(error: unknown) {
  return subscriptionResponse({ ok: false, error: error instanceof SubscriptionError ? error.message : 'Signal subscriptions are temporarily unavailable. Please try again later.' }, error instanceof SubscriptionError ? error.status : 503);
}
export function assertSubscriptionOrigin(request: Request): void {
  const origin = request.headers.get('origin');
  if (!origin) {
    if (request.headers.get('sec-fetch-site') === 'cross-site') throw new SubscriptionError('Open this form on the OfRoot site to continue.', 403);
    return;
  }
  const allowed = new Set([new URL(SIGNAL_SITE_URL).origin]);
  if (process.env.VERCEL_URL && /^[a-z0-9.-]+\.vercel\.app$/i.test(process.env.VERCEL_URL)) allowed.add(`https://${process.env.VERCEL_URL}`);
  if (process.env.NODE_ENV !== 'production') {
    const current = new URL(request.url);
    if (['localhost', '127.0.0.1'].includes(current.hostname)) allowed.add(current.origin);
  }
  if (!allowed.has(origin)) throw new SubscriptionError('Open this form on the OfRoot site to continue.', 403);
}
export function subscriptionIp(request: Request): string {
  return (request.headers.get('x-vercel-forwarded-for') || request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown').split(',')[0].trim().slice(0, 200);
}

export async function readSubscriptionText(request: Request, limit = 8_192): Promise<string> {
  if (Number(request.headers.get('content-length') || 0) > limit) throw new SubscriptionError('This request is too large.', 413);
  if (!request.body) throw new SubscriptionError('A request body is required.', 400);
  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let size = 0; let output = '';
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) throw new SubscriptionError('This request is too large.', 413);
      output += decoder.decode(value, { stream: true });
    }
    return output + decoder.decode();
  } finally { await reader.cancel().catch(() => undefined); }
}
export async function readSubscriptionJson(request: Request): Promise<Record<string, unknown>> {
  const text = await readSubscriptionText(request);
  try {
    const value: unknown = JSON.parse(text);
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid object');
    return value as Record<string, unknown>;
  } catch { throw new SubscriptionError('Enter valid subscription details.', 400); }
}
export function subscriptionToken(value: unknown): string {
  if (typeof value !== 'string' || !value || value.length > 1500) throw new SubscriptionError('This email link is invalid or expired. Request a fresh link.', 400);
  return value;
}
