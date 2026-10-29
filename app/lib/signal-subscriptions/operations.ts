import { getNewsSnapshot } from '@/app/lib/news';
import type { NewsSnapshot } from '@/app/lib/news/types';
import { supportsBrief } from '@/app/lib/signal-briefs/evidence';
import { briefFingerprint } from '@/app/lib/signal-briefs/compose';
import { getSubscriptionDatabase } from './store';

export type SignalOperations = {
  checkedAt: string;
  news: { status: string; checkedAt: string; lastSuccessfulAt: string | null; articles: number; feeds: { id: string; name: string; status: string; checkedAt: string | null; lastSuccessfulAt: string | null }[] };
  delivery: { available: boolean; active: number | null; due: number | null; accepted7d: number | null; empty7d: number | null; uncertain: number | null; preparingExpired: number | null; sendingExpired: number | null; attemptsToday: number | null; remainingToday: number | null; suppressed7d: number | null; message?: string };
  briefs: { available: boolean; ready: number; unsupported: number; unavailable: number; unchecked: number; review: { id: string; title: string; reason: string }[] };
  limits: { batch: number; daily: number; transactionalDaily: number };
  configured: { database: boolean; provider: boolean; signing: boolean; webhook: boolean; postalAddress: boolean };
};

/** These read-only figures mirror the dispatcher's existing bounds. They never
 * modify delivery, grant a larger budget, or include mailbox/provider IDs. */
export function signalDeliveryLimits(settings: Record<string, string | undefined> = process.env): SignalOperations['limits'] {
  const bounded = (value: unknown, fallback: number) => { const n = Number(value); return Number.isInteger(n) && n > 0 ? Math.min(n, 50) : fallback; };
  const transactional = Number(settings.SIGNAL_TRANSACTIONAL_DAILY_LIMIT ?? 40);
  return { batch: bounded(settings.SIGNAL_DIGEST_BATCH_SIZE, 25), daily: bounded(settings.SIGNAL_DIGEST_MAX_PER_DAY, 50), transactionalDaily: Number.isSafeInteger(transactional) && transactional >= 0 && transactional <= 10_000 ? transactional : 40 };
}

export function summarizeBriefCoverage(snapshot: NewsSnapshot, cached: { article_id: string; fingerprint?: string; status: string; current: boolean }[] = []): SignalOperations['briefs'] {
  const byId = new Map(cached.map(row => [row.article_id, row]));
  const result: SignalOperations['briefs'] = { available: true, ready: 0, unsupported: 0, unavailable: 0, unchecked: 0, review: [] };
  for (const article of snapshot.articles) {
    const record = byId.get(article.id);
    const status = !supportsBrief(article) ? 'unsupported' : record?.current && record.fingerprint === briefFingerprint(article) && ['ready', 'unavailable', 'unsupported'].includes(record.status) ? record.status : 'unchecked';
    result[status as 'ready' | 'unsupported' | 'unavailable' | 'unchecked']++;
    if (status !== 'ready' && result.review.length < 12) result.review.push({ id: article.id, title: article.title,
      reason: status === 'unsupported' ? 'No approved primary-record adapter. Source reference only.' : status === 'unavailable' ? 'Primary evidence could not support a brief at the last check.' : 'Primary evidence has not been checked or its cache expired.' });
  }
  return result;
}

export async function getSignalOperations(): Promise<SignalOperations> {
  const snapshot = await getNewsSnapshot();
  const now = new Date();
  const limits = signalDeliveryLimits();
  const secret = process.env.SIGNAL_SUBSCRIPTION_SECRET || process.env.NEXTAUTH_SECRET || process.env.CRON_SECRET || '';
  const result: SignalOperations = {
    checkedAt: now.toISOString(),
    news: { status: snapshot.status, checkedAt: snapshot.checkedAt, lastSuccessfulAt: snapshot.lastSuccessfulAt, articles: snapshot.articles.length,
      feeds: snapshot.sources.filter(source => source.enabled).map(source => { const health = snapshot.sourceHealth.find(item => item.sourceId === source.id); return { id: source.id, name: source.name, status: health?.status || 'pending', checkedAt: health?.checkedAt || null, lastSuccessfulAt: health?.lastSuccessfulAt || null }; }) },
    delivery: { available: false, active: null, due: null, accepted7d: null, empty7d: null, uncertain: null, preparingExpired: null, sendingExpired: null, attemptsToday: null, remainingToday: null, suppressed7d: null },
    briefs: { ...summarizeBriefCoverage(snapshot), available: false }, limits,
    configured: { database: !!(process.env.NEWS_DATABASE_URL || process.env.DATABASE_URL || process.env.DIRECT_URL || process.env.POSTGRES_URL), provider: !!process.env.RESEND_API_KEY, signing: secret.length >= 24, webhook: !!process.env.RESEND_WEBHOOK_SECRET?.startsWith('whsec_'), postalAddress: !!process.env.SIGNAL_POSTAL_ADDRESS?.trim() },
  };
  try {
    const db = getSubscriptionDatabase();
    // Read only existing schemas. Opening an operations screen does not create
    // subscriber records, bootstrap tables, or trigger an email job.
    const tables = (await db.query(`SELECT to_regclass('public.ofroot_signal_subscribers') IS NOT NULL AS subscribers,
      to_regclass('public.ofroot_signal_digest_issues') IS NOT NULL AS issues,
      to_regclass('public.ofroot_signal_email_events') IS NOT NULL AS events,
      to_regclass('public.ofroot_signal_briefs') IS NOT NULL AS briefs`)).rows[0];
    const count = (value: unknown) => Number.isFinite(Number(value)) ? Number(value) : 0;
    if (tables?.briefs) {
      const cached = await db.query("SELECT article_id,fingerprint,brief->>'status' AS status,expires_at>NOW() AS current FROM ofroot_signal_briefs WHERE article_id=ANY($1::text[])", [snapshot.articles.map(article => article.id)]);
      result.briefs = summarizeBriefCoverage(snapshot, cached.rows);
    }
    if (tables?.subscribers && tables?.issues && tables?.events) {
      const [readers, issues, events] = await Promise.all([
        db.query(`SELECT COUNT(*) FILTER (WHERE status='active' AND confirmed_at IS NOT NULL)::int AS active,
          COUNT(*) FILTER (WHERE status='active' AND confirmed_at IS NOT NULL AND next_send_at<=$1)::int AS due FROM ofroot_signal_subscribers`, [now.toISOString()]),
        db.query(`SELECT COUNT(*) FILTER (WHERE status='sent' AND sent_at>=NOW()-INTERVAL '7 days')::int AS accepted,
          COUNT(*) FILTER (WHERE status='empty' AND created_at>=NOW()-INTERVAL '7 days')::int AS empty,
          COUNT(*) FILTER (WHERE status='uncertain')::int AS uncertain,
          COUNT(*) FILTER (WHERE status='preparing' AND lease_until<NOW())::int AS preparing_expired,
          COUNT(*) FILTER (WHERE status='sending' AND lease_until<NOW())::int AS sending_expired,
          COUNT(*) FILTER (WHERE attempted_at>=(DATE_TRUNC('day',NOW() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC') AND attempted_at<=NOW())::int AS attempted_today
          FROM ofroot_signal_digest_issues`),
        db.query("SELECT COUNT(*)::int AS suppressed FROM ofroot_signal_email_events WHERE applied_at>=NOW()-INTERVAL '7 days'"),
      ]);
      const i = issues.rows[0] || {}; const r = readers.rows[0] || {};
      result.delivery = { available: true, active: count(r.active), due: count(r.due), accepted7d: count(i.accepted), empty7d: count(i.empty), uncertain: count(i.uncertain), preparingExpired: count(i.preparing_expired), sendingExpired: count(i.sending_expired), attemptsToday: count(i.attempted_today), remainingToday: Math.max(0, limits.daily - count(i.attempted_today)), suppressed7d: count(events.rows[0]?.suppressed) };
    } else result.delivery.message = 'Delivery tables are not initialized. No delivery counts are assumed.';
  } catch {
    result.delivery.message = 'Delivery metrics are temporarily unavailable. No email action was taken.';
  }
  return result;
}
