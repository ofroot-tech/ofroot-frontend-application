import { NEWS_CATEGORIES, NEWS_SOURCES } from './sources';
import { deduplicateArticles } from './normalize';
import { parseSourceBody, readSourceBody, relevantPolicyTitle, routeTechCrunchCategory } from './ingest';
import { acquireNewsRefreshLease, hasNewsDatabase, loadStoredNews, releaseNewsRefreshLease, saveStoredNews } from './store';
import type { NewsSnapshot, NewsSourceHealth } from './types';

export { NEWS_CATEGORIES, NEWS_SOURCES };
export { ensureNewsSchema } from './store';
export type { NewsArticle, NewsCategory, NewsKind, NewsSnapshot, NewsSource, NewsSourceHealth } from './types';

export const NEWS_REFRESH_INTERVAL_MS = 15 * 60_000;
const SHARED_SNAPSHOT_CHECK_MS = 60_000;

type NewsState = {
  snapshot?: NewsSnapshot;
  inflight?: Promise<NewsSnapshot>;
  sharedRead?: Promise<void>;
  lastSharedReadAt?: number;
};
declare global { var __ofrootNewsState: NewsState | undefined; }
function state(): NewsState { return global.__ofrootNewsState ||= {}; }

export function publicSnapshot(snapshot: NewsSnapshot): NewsSnapshot {
  const active = new Set(NEWS_SOURCES.filter(source => source.enabled && source.rights.status === 'approved').map(source => source.id));
  const blocked = new Set((process.env.NEWS_BLOCKED_ARTICLE_IDS || '').split(',').map(value => value.trim()).filter(value => /^[a-f0-9]{20}$/.test(value)));
  const articles = deduplicateArticles(snapshot.articles
    .filter(article => active.has(article.sourceId) && !blocked.has(article.id) && (article.sourceId !== 'federal-register' || relevantPolicyTitle(article.title)))
    .map(article => {
      if (!article.sourceId.startsWith('techcrunch')) return article;
      const category = routeTechCrunchCategory(article.sourceId, article.title);
      if (category === 'ai' || (article.category === 'cybersecurity' && category === 'integrations')) return article;
      return { ...article, category };
    }));
  const tooOld = !Number.isFinite(Date.parse(snapshot.checkedAt)) || Date.now() - Date.parse(snapshot.checkedAt) > 30 * 60_000;
  return { ...snapshot, sources: NEWS_SOURCES, articles, status: tooOld ? articles.length ? 'stale' : 'unavailable' : snapshot.status };
}

function emptySnapshot(): NewsSnapshot {
  const checkedAt = new Date().toISOString();
  return {
    articles: [], sources: NEWS_SOURCES, checkedAt, lastSuccessfulAt: null,
    status: 'unavailable', storage: 'memory',
    sourceHealth: NEWS_SOURCES.map(source => ({ sourceId: source.id, status: source.enabled ? 'error' : 'pending', checkedAt, message: source.enabled ? 'No successful refresh recorded.' : source.rights.basis })),
  };
}

function failedPersistenceSnapshot(previous: NewsSnapshot | undefined): NewsSnapshot {
  return publicSnapshot({
    ...(previous || emptySnapshot()), status: previous?.articles.length ? 'stale' : 'unavailable',
    storage: 'memory', refreshState: 'failed',
    storageMessage: 'Persistent storage is unavailable; the last available index is retained and this refresh was not completed.',
  });
}

async function readSharedSnapshot(force = false): Promise<void> {
  const current = state();
  if (!hasNewsDatabase()) return;
  if (current.sharedRead) return current.sharedRead;
  if (!force && current.lastSharedReadAt && Date.now() - current.lastSharedReadAt < SHARED_SNAPSHOT_CHECK_MS) return;
  current.lastSharedReadAt = Date.now();
  current.sharedRead = (async () => {
    try {
      const stored = await loadStoredNews();
      if (stored && (!current.snapshot || Date.parse(stored.checkedAt) >= Date.parse(current.snapshot.checkedAt))) current.snapshot = publicSnapshot(stored);
    } catch { /* A refresh reports configured database failures without exposing credentials. */ }
  })();
  try { await current.sharedRead; } finally { current.sharedRead = undefined; }
}

export async function refreshNews(options: { force?: boolean } = {}): Promise<NewsSnapshot> {
  const current = state();
  if (current.inflight) return current.inflight;
  current.inflight = (async () => {
    await readSharedSnapshot(true);
    const persistent = hasNewsDatabase();
    let lease: string | null = null;
    if (persistent) {
      try { lease = await acquireNewsRefreshLease(); }
      catch {
        const failed = failedPersistenceSnapshot(current.snapshot);
        current.snapshot = failed;
        return failed;
      }
      if (!lease) {
        await readSharedSnapshot(true);
        return publicSnapshot({ ...(current.snapshot || emptySnapshot()), refreshState: 'in_progress' });
      }
    }
    try {
      // Another process may publish between the first read and lease acquisition.
      if (persistent) await readSharedSnapshot(true);
      if (options.force === false && current.snapshot && Date.now() - Date.parse(current.snapshot.checkedAt) < NEWS_REFRESH_INTERVAL_MS) return publicSnapshot(current.snapshot);
      const checkedAt = new Date().toISOString();
      const previous = current.snapshot;
      const results = await Promise.all(NEWS_SOURCES.map(async source => {
        const oldHealth = previous?.sourceHealth.find(health => health.sourceId === source.id);
        if (!source.enabled || source.rights.status !== 'approved') return { articles: [], health: { sourceId: source.id, status: 'pending', checkedAt, message: source.rights.basis } satisfies NewsSourceHealth };
        try {
          const articles = parseSourceBody(source, await readSourceBody(source));
          return { articles, health: { sourceId: source.id, status: 'ok', checkedAt, lastSuccessfulAt: checkedAt } satisfies NewsSourceHealth };
        } catch (error) {
          const message = error instanceof Error && /^(Source returned HTTP \d+|Source response exceeds size limit|Source returned no valid metadata|Unexpected .+ format|Unsupported XML declaration)$/.test(error.message)
            ? error.message : 'Source could not be refreshed; previously indexed items are retained.';
          return { articles: [], health: { sourceId: source.id, status: 'error', checkedAt, ...(oldHealth?.lastSuccessfulAt ? { lastSuccessfulAt: oldHealth.lastSuccessfulAt } : {}), message } satisfies NewsSourceHealth };
        }
      }));
      const successCount = results.filter(result => result.health.status === 'ok').length;
      const enabledCount = NEWS_SOURCES.filter(source => source.enabled && source.rights.status === 'approved').length;
      const newlyFetched = deduplicateArticles(results.flatMap(result => result.articles));
      const articles = deduplicateArticles([...(previous?.articles || []), ...newlyFetched]).slice(0, 500);
      let snapshot: NewsSnapshot = {
        articles, sources: NEWS_SOURCES, checkedAt,
        lastSuccessfulAt: successCount ? checkedAt : previous?.lastSuccessfulAt || null,
        status: successCount === enabledCount ? 'live' : successCount ? 'partial' : articles.length ? 'stale' : 'unavailable',
        sourceHealth: results.map(result => result.health), storage: 'memory', refreshState: successCount ? 'completed' : 'failed',
      };
      if (persistent) {
        try {
          const archived = await saveStoredNews(snapshot, newlyFetched);
          if (archived) snapshot = { ...snapshot, articles: archived, storage: 'postgres' };
        } catch {
          snapshot = { ...snapshot, refreshState: 'failed', storageMessage: 'Persistent storage is unavailable; this instance is serving its memory cache.' };
        }
      }
      snapshot = publicSnapshot(snapshot);
      current.snapshot = snapshot;
      return snapshot;
    } finally {
      if (lease) await releaseNewsRefreshLease(lease).catch(() => undefined);
    }
  })();
  try { return await current.inflight; } finally { current.inflight = undefined; }
}

export async function getNewsSnapshot(): Promise<NewsSnapshot> {
  const current = state();
  await readSharedSnapshot();
  if (current.snapshot && Date.now() - Date.parse(current.snapshot.checkedAt) < NEWS_REFRESH_INTERVAL_MS) return publicSnapshot(current.snapshot);
  return refreshNews({ force: false });
}
