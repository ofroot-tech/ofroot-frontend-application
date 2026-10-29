import { getNewsSnapshot, publicSnapshot } from '../news';
import type { NewsArticle } from '../news/types';
import { briefFingerprint, composeSignalBrief } from './compose';
import { fetchBriefEvidence, supportsBrief } from './evidence';
import { readArchivedBriefArticle, readStoredBrief, readStoredBriefAvailability, writeStoredBrief } from './store';
import type { SignalBrief } from './types';
import { initialBriefAvailability, type BriefAvailability } from './availability';

type BriefState = { cache: Map<string, { value: SignalBrief; until: number }>; inflight: Map<string, Promise<SignalBrief>> };
declare global { var __ofrootBriefState: BriefState | undefined; }
const state = () => global.__ofrootBriefState ||= { cache: new Map(), inflight: new Map() };

/** Resolve against the public index every time: paused sources and suppressed
 * references cannot become accessible through a previously cached permalink. */
export async function getBriefArticle(id: string): Promise<NewsArticle | null> {
  if (!/^[a-f0-9]{20}$/.test(id)) return null;
  const snapshot = await getNewsSnapshot();
  const current = snapshot.articles.find(article => article.id === id);
  if (current) return current;
  const archived = await readArchivedBriefArticle(id);
  return archived ? publicSnapshot({ ...snapshot, articles: [archived] }).articles[0] || null : null;
}

export async function getBriefForArticle(article: NewsArticle): Promise<SignalBrief> {
  const key = briefFingerprint(article);
  const current = state();
  const hit = current.cache.get(key);
  if (hit && hit.until > Date.now()) return hit.value;
  const existing = current.inflight.get(key);
  if (existing) return existing;
  const pending = (async () => {
    const stored = await readStoredBrief(article.id, key);
    const brief = stored || composeSignalBrief(article, await fetchBriefEvidence(article));
    const ttl = brief.status === 'ready' ? 3_600 : 900;
    if (!stored) await writeStoredBrief(brief, ttl);
    // Keep the short process cache bounded. Database expiry retains provenance
    // while evidence is checked again on the next request after an hour.
    if (current.cache.size >= 200) current.cache.delete(current.cache.keys().next().value!);
    current.cache.set(key, { value: brief, until: Date.now() + 60_000 });
    return brief;
  })();
  current.inflight.set(key, pending);
  try { return await pending; } finally { current.inflight.delete(key); }
}

/** A logo is a promise about the destination. Only evidence already checked in
 * the current cache earns Ready; adapter support by itself remains Unchecked. */
export async function getBriefAvailability(articles: NewsArticle[]): Promise<Record<string, BriefAvailability>> {
  const output: Record<string, BriefAvailability> = {};
  const missing: { id: string; fingerprint: string }[] = [];
  const current = state();
  for (const article of articles.slice(0, 500)) {
    output[article.id] = initialBriefAvailability(article);
    if (output[article.id] === 'unsupported') continue;
    const fingerprint = briefFingerprint(article);
    const cached = current.cache.get(fingerprint);
    if (cached && cached.until > Date.now()) output[article.id] = cached.value.status;
    else missing.push({ id: article.id, fingerprint });
  }
  const stored = await readStoredBriefAvailability(missing);
  return { ...output, ...stored };
}

/** Three workers bound primary-source traffic on a cold collection page. */
export async function getBriefCollection(articles: NewsArticle[], limit = 9): Promise<{ article: NewsArticle; brief: SignalBrief }[]> {
  const candidates = articles.filter(supportsBrief).slice(0, Math.min(limit, 12));
  const output: { article: NewsArticle; brief: SignalBrief }[] = [];
  let cursor = 0;
  await Promise.all(Array.from({ length: Math.min(3, candidates.length) }, async () => {
    while (cursor < candidates.length) {
      const article = candidates[cursor++];
      const brief = await getBriefForArticle(article);
      if (brief.status === 'ready') output.push({ article, brief });
    }
  }));
  return output.sort((a, b) => articles.indexOf(a.article) - articles.indexOf(b.article));
}
