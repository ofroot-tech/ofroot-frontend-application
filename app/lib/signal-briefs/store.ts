import { Pool } from 'pg';
import { z } from 'zod';
import type { SignalBrief } from './types';
import type { NewsArticle } from '../news/types';
import type { BriefAvailability } from './availability';

const archivedArticle = z.object({
  id: z.string().regex(/^[a-f0-9]{20}$/), title: z.string().min(1).max(5000), url: z.url().max(3000),
  sourceId: z.string().max(100), category: z.enum(['ai', 'integrations', 'healthcare', 'policy', 'cybersecurity']),
  publishedAt: z.string().nullable(), kind: z.enum(['reporting', 'research', 'release', 'policy', 'advisory']), author: z.string().max(150).optional(),
});

const storedBrief = z.object({
  version: z.string(), articleId: z.string(), fingerprint: z.string(), generatedAt: z.iso.datetime(),
  status: z.enum(['ready', 'unsupported', 'unavailable']), reason: z.string().optional(),
  introduction: z.string(), digest: z.string(), context: z.string(),
  perspective: z.object({ changed: z.string(), audience: z.string(), relevance: z.string(), nextStep: z.string(), basis: z.string() }).optional(),
  evidence: z.object({
    url: z.url(), retrievalUrl: z.url(), publisher: z.string(), title: z.string(), publishedAt: z.string().nullable(), fetchedAt: z.iso.datetime(),
    license: z.string(), scope: z.string(), abstract: z.string(), facts: z.array(z.object({ label: z.string(), value: z.string() })),
    caveats: z.array(z.string()), contentHash: z.string(),
  }).optional(),
});

declare global {
  var __ofrootBriefPool: Pool | undefined;
  var __ofrootBriefSchema: Promise<void> | undefined;
}

/** Brief storage is additive and independent of the already deployed feed job. */
function database(): Pool | null {
  const url = process.env.NEWS_DATABASE_URL || process.env.DATABASE_URL || process.env.DIRECT_URL || process.env.POSTGRES_URL;
  if (!url) return null;
  if (!global.__ofrootBriefPool) {
    const pool = new Pool({ connectionString: url, max: 1, connectionTimeoutMillis: 3_000, query_timeout: 4_000, idleTimeoutMillis: 10_000 });
    pool.on('error', () => console.warn('Signal brief cache connection unavailable.'));
    global.__ofrootBriefPool = pool;
  }
  return global.__ofrootBriefPool;
}

async function schema(db: Pool): Promise<void> {
  if (!global.__ofrootBriefSchema) {
    global.__ofrootBriefSchema = (async () => {
      const client = await db.connect();
      try {
        await client.query('BEGIN');
        await client.query("SET LOCAL lock_timeout = '3s'");
        await client.query('SELECT pg_advisory_xact_lock($1)', [741908328]);
        await client.query(`CREATE TABLE IF NOT EXISTS ofroot_signal_briefs (
          article_id TEXT PRIMARY KEY, fingerprint TEXT NOT NULL, brief JSONB NOT NULL,
          expires_at TIMESTAMPTZ NOT NULL, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )`);
        await client.query('COMMIT');
      } catch (error) { await client.query('ROLLBACK').catch(() => undefined); throw error; }
      finally { client.release(); }
    })();
    global.__ofrootBriefSchema.catch(() => { global.__ofrootBriefSchema = undefined; });
  }
  await global.__ofrootBriefSchema;
}

export async function readStoredBrief(articleId: string, fingerprint: string): Promise<SignalBrief | null> {
  const db = database();
  if (!db) return null;
  try {
    await schema(db);
    const result = await db.query('SELECT brief FROM ofroot_signal_briefs WHERE article_id = $1 AND fingerprint = $2 AND expires_at > NOW()', [articleId, fingerprint]);
    const parsed = storedBrief.safeParse(result.rows[0]?.brief);
    if (!parsed.success || parsed.data.articleId !== articleId || parsed.data.fingerprint !== fingerprint) return null;
    const value = parsed.data;
    if (value.status === 'ready' && (!value.evidence || !value.evidence.url.startsWith('https://'))) return null;
    return value;
  } catch { return null; }
}

/** The board needs status, not every evidence body. A single bounded lookup
 * avoids one cache query per card and never fetches new primary records. */
export async function readStoredBriefAvailability(references: { id: string; fingerprint: string }[]): Promise<Record<string, BriefAvailability>> {
  const db = database();
  if (!db || !references.length) return {};
  const expected = new Map(references.slice(0, 500).map(item => [item.id, item.fingerprint]));
  try {
    await schema(db);
    const result = await db.query('SELECT article_id, fingerprint, brief FROM ofroot_signal_briefs WHERE article_id = ANY($1::text[]) AND expires_at > NOW()', [Array.from(expected.keys())]);
    const output: Record<string, BriefAvailability> = {};
    for (const row of result.rows) {
      if (expected.get(row.article_id) !== row.fingerprint) continue;
      const parsed = storedBrief.safeParse(row.brief);
      if (!parsed.success || parsed.data.articleId !== row.article_id || parsed.data.fingerprint !== row.fingerprint) continue;
      if (parsed.data.status === 'ready' && !parsed.data.evidence?.url.startsWith('https://')) continue;
      output[row.article_id] = parsed.data.status;
    }
    return output;
  } catch { return {}; }
}

/** Standalone permalinks outlive the bounded latest-news window. The caller
 * must still apply the live public source/suppression policy before serving it. */
export async function readArchivedBriefArticle(id: string): Promise<NewsArticle | null> {
  const db = database();
  if (!db) return null;
  try {
    const result = await db.query('SELECT item FROM ofroot_news_items WHERE id = $1', [id]);
    const parsed = archivedArticle.safeParse(result.rows[0]?.item);
    return parsed.success && parsed.data.id === id ? parsed.data : null;
  } catch { return null; }
}

export async function writeStoredBrief(brief: SignalBrief, ttlSeconds: number): Promise<void> {
  const db = database();
  if (!db) return;
  try {
    await schema(db);
    await db.query(`INSERT INTO ofroot_signal_briefs (article_id, fingerprint, brief, expires_at)
      VALUES ($1,$2,$3::jsonb,NOW() + $4 * INTERVAL '1 second')
      ON CONFLICT (article_id) DO UPDATE SET fingerprint=EXCLUDED.fingerprint,
      brief=EXCLUDED.brief, expires_at=EXCLUDED.expires_at, updated_at=NOW()`, [brief.articleId, brief.fingerprint, JSON.stringify(brief), ttlSeconds]);
  } catch { /* A cache failure never replaces evidence with invented content. */ }
}
