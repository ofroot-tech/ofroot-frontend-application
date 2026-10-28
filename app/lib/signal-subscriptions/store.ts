import { createHmac } from 'node:crypto';
import { Pool, type PoolClient } from 'pg';
import { z } from 'zod';
import { signalDatabaseUrl, subscriptionSecret } from './config';
import { SubscriptionError, type SignalSubscriber } from './types';

declare global {
  var __ofrootSignalSubscriptionPool: Pool | undefined;
  var __ofrootSignalSubscriptionSchema: Promise<void> | undefined;
}

/** Subscription state must survive deployments. Unlike a reading cache, it
 * never falls back to process memory when durable storage is unavailable. */
export function getSubscriptionDatabase(): Pool {
  if (!global.__ofrootSignalSubscriptionPool) {
    const pool = new Pool({ connectionString: signalDatabaseUrl(), max: 2, connectionTimeoutMillis: 3_000, query_timeout: 5_000, idleTimeoutMillis: 10_000 });
    pool.on('error', () => console.warn('Signal subscription database connection unavailable.'));
    global.__ofrootSignalSubscriptionPool = pool;
  }
  return global.__ofrootSignalSubscriptionPool;
}

export async function ensureSubscriptionSchema(): Promise<void> {
  if (!global.__ofrootSignalSubscriptionSchema) {
    global.__ofrootSignalSubscriptionSchema = (async () => {
      const client = await getSubscriptionDatabase().connect();
      try {
        await client.query('BEGIN');
        await client.query("SET LOCAL lock_timeout = '3s'");
        await client.query('SELECT pg_advisory_xact_lock($1)', [741908329]);
        await client.query(`CREATE TABLE IF NOT EXISTS ofroot_signal_subscribers (
          id UUID PRIMARY KEY, email TEXT NOT NULL UNIQUE,
          status TEXT NOT NULL DEFAULT 'pending', topics JSONB NOT NULL,
          content TEXT NOT NULL, frequency TEXT NOT NULL,
          confirmed_at TIMESTAMPTZ, next_send_at TIMESTAMPTZ, last_sent_at TIMESTAMPTZ,
          token_version INTEGER NOT NULL DEFAULT 1,
          pending_preferences JSONB, confirmation_hash TEXT, confirmation_expires_at TIMESTAMPTZ,
          consent_version TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )`);
        await client.query(`CREATE INDEX IF NOT EXISTS ofroot_signal_subscribers_due_idx
          ON ofroot_signal_subscribers (next_send_at) WHERE status = 'active'`);
        await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS ofroot_signal_subscribers_confirmation_idx
          ON ofroot_signal_subscribers (confirmation_hash) WHERE confirmation_hash IS NOT NULL`);
        await client.query(`CREATE TABLE IF NOT EXISTS ofroot_signal_subscription_limits (
          bucket TEXT PRIMARY KEY, window_start TIMESTAMPTZ NOT NULL,
          request_count INTEGER NOT NULL, last_request_at TIMESTAMPTZ NOT NULL
        )`);
        await client.query('CREATE INDEX IF NOT EXISTS ofroot_signal_subscription_limits_age_idx ON ofroot_signal_subscription_limits (window_start)');
        await client.query("CREATE INDEX IF NOT EXISTS ofroot_signal_subscribers_pending_age_idx ON ofroot_signal_subscribers (created_at) WHERE status='pending' AND confirmed_at IS NULL");
        await client.query('COMMIT');
      } catch (error) { await client.query('ROLLBACK').catch(() => undefined); throw error; }
      finally { client.release(); }
    })();
    global.__ofrootSignalSubscriptionSchema.catch(() => { global.__ofrootSignalSubscriptionSchema = undefined; });
  }
  await global.__ofrootSignalSubscriptionSchema;
}

export async function withSubscriptionTransaction<T>(action: (client: PoolClient) => Promise<T>): Promise<T> {
  await ensureSubscriptionSchema();
  const client = await getSubscriptionDatabase().connect();
  try {
    await client.query('BEGIN');
    await client.query("SET LOCAL lock_timeout = '3s'");
    const result = await action(client);
    await client.query('COMMIT');
    return result;
  } catch (error) { await client.query('ROLLBACK').catch(() => undefined); throw error; }
  finally { client.release(); }
}

const subscriberSchema = z.object({
  id: z.uuid(), email: z.email(), status: z.enum(['pending', 'active', 'paused', 'unsubscribed', 'suppressed']),
  topics: z.array(z.enum(['ai', 'integrations', 'healthcare', 'policy', 'cybersecurity'])).min(1).max(5),
  content: z.enum(['briefs', 'insights', 'both']), frequency: z.enum(['weekly', 'daily']),
  confirmedAt: z.string().nullable(), nextSendAt: z.string().nullable(), lastSentAt: z.string().nullable(), tokenVersion: z.number().int().min(1),
});
function timestamp(value: unknown): string | null {
  const parsed = value instanceof Date ? value.getTime() : typeof value === 'string' ? Date.parse(value) : NaN;
  return Number.isFinite(parsed) ? new Date(parsed).toISOString() : null;
}
export function mapSubscriberRow(row: Record<string, unknown>): SignalSubscriber {
  const parsed = subscriberSchema.safeParse({
    id: row.id, email: row.email, status: row.status, topics: row.topics, content: row.content, frequency: row.frequency,
    confirmedAt: timestamp(row.confirmed_at), nextSendAt: timestamp(row.next_send_at), lastSentAt: timestamp(row.last_sent_at), tokenVersion: row.token_version,
  });
  if (!parsed.success) throw new SubscriptionError('This subscription is temporarily unavailable.', 503);
  return parsed.data;
}

export type RateWindow = { windowStart: number; count: number; lastAt: number };
/** Cooldown responses are intentionally indistinguishable from acceptance.
 * The hard limit is separate so repeated requests cannot consume unlimited mail. */
export function subscriptionRateDecision(email: RateWindow, ip: RateWindow, now: number, globalBudget = { count: 0, limit: 40 }): 'allow' | 'cooldown' | 'limited' {
  const emailCurrent = now - email.windowStart < 3_600_000;
  const ipCurrent = now - ip.windowStart < 3_600_000;
  if ((emailCurrent && email.count >= 3) || (ipCurrent && ip.count >= 5) || globalBudget.count >= globalBudget.limit) return 'limited';
  if (email.count > 0 && now - email.lastAt < 60_000) return 'cooldown';
  return 'allow';
}

export async function consumeSubscriptionRate(email: string, address: string): Promise<boolean> {
  const hash = (label: string, value: string) => createHmac('sha256', subscriptionSecret()).update(`signal-subscription-rate:${label}:${value}`).digest('hex');
  const now = Date.now();
  const configured = Number(process.env.SIGNAL_TRANSACTIONAL_DAILY_LIMIT ?? 40);
  const dailyLimit = Number.isSafeInteger(configured) && configured >= 0 && configured <= 10_000 ? configured : 40;
  const buckets = [`email:${hash('email', email)}`, `ip:${hash('ip', address.slice(0, 200) || 'unknown')}`, `global:transactional:${new Date(now).toISOString().slice(0, 10)}`];
  return withSubscriptionTransaction(async client => {
    // Every request locks email, IP, then the shared UTC-day budget. The budget
    // protects delivery capacity even when a bot distributes requests across IPs.
    const rows: RateWindow[] = [];
    for (const bucket of buckets) {
      await client.query(`INSERT INTO ofroot_signal_subscription_limits (bucket,window_start,request_count,last_request_at)
        VALUES ($1,NOW(),0,TO_TIMESTAMP(0)) ON CONFLICT (bucket) DO NOTHING`, [bucket]);
      const result = await client.query('SELECT window_start,request_count,last_request_at,NOW() AS db_now FROM ofroot_signal_subscription_limits WHERE bucket=$1 FOR UPDATE', [bucket]);
      const row = result.rows[0];
      rows.push({ windowStart: Date.parse(row.window_start), count: row.request_count, lastAt: Date.parse(row.last_request_at) });
    }
    const decision = subscriptionRateDecision(rows[0], rows[1], now, { count: rows[2].count, limit: dailyLimit });
    if (decision === 'limited') throw new SubscriptionError('Too many email requests. Please try again later.', 429);
    if (decision === 'cooldown') return false;
    for (const bucket of buckets.slice(0, 2)) await client.query(`UPDATE ofroot_signal_subscription_limits
      SET request_count=CASE WHEN window_start <= NOW()-INTERVAL '1 hour' THEN 1 ELSE request_count+1 END,
      window_start=CASE WHEN window_start <= NOW()-INTERVAL '1 hour' THEN NOW() ELSE window_start END,last_request_at=NOW() WHERE bucket=$1`, [bucket]);
    await client.query('UPDATE ofroot_signal_subscription_limits SET request_count=request_count+1,last_request_at=NOW() WHERE bucket=$1', [buckets[2]]);
    if (rows[2].count === 0) {
      // Only the first accepted request of the UTC day performs housekeeping.
      // Freshly re-requested confirmations and every confirmed/opted-out record
      // are excluded from pending cleanup; opt-out history remains authoritative.
      await client.query("DELETE FROM ofroot_signal_subscription_limits WHERE window_start < NOW()-INTERVAL '2 days'");
      await client.query(`DELETE FROM ofroot_signal_subscribers WHERE status='pending' AND confirmed_at IS NULL
        AND created_at<NOW()-INTERVAL '7 days' AND updated_at<NOW()-INTERVAL '7 days'
        AND (confirmation_expires_at IS NULL OR confirmation_expires_at<NOW())`);
    }
    return true;
  });
}
