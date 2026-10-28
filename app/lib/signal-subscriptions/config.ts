import { CANONICAL_SITE_URL } from '@/app/config/site';
import { SubscriptionError } from './types';

export const SIGNAL_SITE_URL = CANONICAL_SITE_URL;
export const SIGNAL_CONSENT_VERSION = 'signal-email-2026-10-28';
export const SIGNAL_SEND_HOUR_UTC = 14;
export function subscriptionSecret(): string {
  const secret = process.env.SIGNAL_SUBSCRIPTION_SECRET || process.env.NEXTAUTH_SECRET || process.env.CRON_SECRET;
  if (!secret || secret.length < 24) throw new SubscriptionError('Signal subscriptions are temporarily unavailable. Please try again later.', 503);
  return secret;
}
export function signalDatabaseUrl(): string {
  const value = process.env.NEWS_DATABASE_URL || process.env.DATABASE_URL || process.env.DIRECT_URL || process.env.POSTGRES_URL;
  if (!value) throw new SubscriptionError('Signal subscriptions are temporarily unavailable. Please try again later.', 503);
  return value;
}
export function signalSender(): string {
  return process.env.SIGNAL_EMAIL_FROM || `${process.env.RESEND_FROM_NAME || 'OfRoot Signal'} <${process.env.RESEND_FROM || 'no-reply@ofroot.technology'}>`;
}
export function assertSubscriptionConfiguration(): void {
  signalDatabaseUrl(); subscriptionSecret();
  if (!process.env.RESEND_API_KEY) throw new SubscriptionError('Signal subscriptions are temporarily unavailable. Please try again later.', 503);
}
export function escapeEmailHtml(value: string): string {
  return value.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]!));
}

/** One documented morning UTC slot, with weekly editions on Mondays. The host
 * may execute within its scheduling window; the UI never promises an exact time. */
export function nextSignalSend(frequency: 'weekly' | 'daily', after = new Date()): string {
  const next = new Date(after);
  next.setUTCHours(SIGNAL_SEND_HOUR_UTC, 0, 0, 0);
  if (next.getTime() <= after.getTime()) next.setUTCDate(next.getUTCDate() + 1);
  if (frequency === 'weekly') while (next.getUTCDay() !== 1) next.setUTCDate(next.getUTCDate() + 1);
  return next.toISOString();
}
