import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import type { NewsArticle, NewsSnapshot } from './types';

declare global {
  var __ofrootNewsPool: Pool | undefined;
  var __ofrootNewsSchemaReady: Promise<void> | undefined;
}

function databaseUrl(): string | undefined {
  return process.env.NEWS_DATABASE_URL || process.env.DATABASE_URL || process.env.DIRECT_URL || process.env.POSTGRES_URL;
}

function pool(): Pool | null {
  const url = databaseUrl();
  if (!url) return null;
  if (!global.__ofrootNewsPool) global.__ofrootNewsPool = new Pool({ connectionString: url, max: 2, connectionTimeoutMillis: 3_000, query_timeout: 4_000 });
  return global.__ofrootNewsPool;
}

export function hasNewsDatabase(): boolean { return !!databaseUrl(); }

/** Additive, news-owned schema only. A failed initialization can be retried. */
export async function ensureNewsSchema(): Promise<void> {
  const db = pool();
  if (!db) throw new Error('News database is not configured');
  if (!global.__ofrootNewsSchemaReady) {
    global.__ofrootNewsSchemaReady = (async () => {
      const client = await db.connect();
      try {
        await client.query('BEGIN');
        await client.query("SET LOCAL lock_timeout = '3s'");
        // Serializes first-run DDL across instances, including Postgres catalog rows.
        await client.query('SELECT pg_advisory_xact_lock($1)', [741908327]);
        await client.query(`CREATE TABLE IF NOT EXISTS ofroot_news_items (
          id TEXT PRIMARY KEY, item JSONB NOT NULL, first_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )`);
        await client.query(`CREATE TABLE IF NOT EXISTS ofroot_news_snapshot (
          id TEXT PRIMARY KEY, snapshot JSONB NOT NULL, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )`);
        await client.query(`CREATE TABLE IF NOT EXISTS ofroot_news_refresh_leases (
          id TEXT PRIMARY KEY, owner TEXT NOT NULL, expires_at TIMESTAMPTZ NOT NULL
        )`);
        await client.query(`CREATE INDEX IF NOT EXISTS ofroot_news_items_published_idx
          ON ofroot_news_items ((COALESCE(item->>'publishedAt', '')) DESC, id)`);
        await client.query('COMMIT');
      } catch (error) {
        await client.query('ROLLBACK').catch(() => undefined);
        throw error;
      } finally { client.release(); }
    })();
    global.__ofrootNewsSchemaReady.catch(() => { global.__ofrootNewsSchemaReady = undefined; });
  }
  await global.__ofrootNewsSchemaReady;
}

export async function loadStoredNews(): Promise<NewsSnapshot | null> {
  const db = pool();
  if (!db) return null;
  // Reads do not create or migrate tables. Initialization happens on refresh.
  const result = await db.query<{ snapshot: NewsSnapshot }>("SELECT snapshot FROM ofroot_news_snapshot WHERE id = 'latest'");
  const snapshot = result.rows[0]?.snapshot;
  return snapshot && Array.isArray(snapshot.articles) && Array.isArray(snapshot.sourceHealth) && typeof snapshot.checkedAt === 'string'
    ? { ...snapshot, storage: 'postgres' } : null;
}

/** An expiring row lease works with pooled connections and crash recovery. */
export async function acquireNewsRefreshLease(): Promise<string | null> {
  await ensureNewsSchema();
  const db = pool()!;
  const owner = randomUUID();
  const result = await db.query<{ owner: string }>(`INSERT INTO ofroot_news_refresh_leases (id, owner, expires_at)
    VALUES ('latest', $1, NOW() + INTERVAL '90 seconds')
    ON CONFLICT (id) DO UPDATE SET owner = EXCLUDED.owner, expires_at = EXCLUDED.expires_at
    WHERE ofroot_news_refresh_leases.expires_at <= NOW()
    RETURNING owner`, [owner]);
  return result.rows[0]?.owner === owner ? owner : null;
}

export async function releaseNewsRefreshLease(owner: string): Promise<void> {
  const db = pool();
  if (db) await db.query("DELETE FROM ofroot_news_refresh_leases WHERE id = 'latest' AND owner = $1", [owner]);
}

export async function saveStoredNews(snapshot: NewsSnapshot, newlyFetched: NewsArticle[] = snapshot.articles): Promise<NewsArticle[] | null> {
  const db = pool();
  if (!db) return null;
  await ensureNewsSchema();
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    if (newlyFetched.length) {
      await client.query(`INSERT INTO ofroot_news_items (id, item)
        SELECT value->>'id', value FROM jsonb_array_elements($1::jsonb)
        ON CONFLICT (id) DO UPDATE SET item = EXCLUDED.item, last_seen_at = NOW()`, [JSON.stringify(newlyFetched)]);
    }
    // The reading index is bounded; archived metadata is retained without a purge.
    const archive = await client.query<{ item: NewsArticle }>(`SELECT item FROM ofroot_news_items
      ORDER BY COALESCE(item->>'publishedAt', '') DESC, id LIMIT 500`);
    const withStorage = { ...snapshot, storage: 'postgres', articles: archive.rows.map(row => row.item) };
    await client.query(`INSERT INTO ofroot_news_snapshot (id, snapshot) VALUES ('latest', $1::jsonb)
      ON CONFLICT (id) DO UPDATE SET snapshot = EXCLUDED.snapshot, updated_at = NOW()`, [JSON.stringify(withStorage)]);
    await client.query('COMMIT');
    return withStorage.articles;
  } catch (error) {
    await client.query('ROLLBACK').catch(() => undefined);
    throw error;
  } finally { client.release(); }
}
