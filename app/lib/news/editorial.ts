import type { NewsArticle, NewsSource } from './types';

/** Editorial ordering is a reading aid, not an automated credibility score.
 * Keep every publisher's fields intact; omit overt ticket sales and promotions
 * before selection, including records retained by an earlier deployment. */
const PROMOTION = /\b(?:save (?:up to )?\$\d+|(?:buy|get|grab|book|secure) (?:your |a )?(?:tickets?|passes?)|early.bird (?:tickets?|pricing)|last chance to (?:save|register)|discount code|sponsored (?:post|content)|paid partnership)\b/i;
const COUNTDOWN = /\b\d+ days? (?:left\b|until\b)/i;
const EVENT_PROMOTION = /\b(?:summit|conference|webinar|tickets?|passes?|early.bird|discount|registration)\b/i;

export function isRelevantArticle(article: NewsArticle): boolean {
  // A countdown can describe a genuine remediation or regulatory deadline.
  // It is promotional only when explicit event/ticket context accompanies it.
  const eventCountdown = COUNTDOWN.test(article.title) && EVENT_PROMOTION.test(article.title);
  return !PROMOTION.test(article.title) && !eventCountdown && !/\/news-events\/events\//i.test(article.url);
}

/** Several feeds from one organization count as one publisher. This avoids
 * treating three category feeds as three independent editorial perspectives. */
export function publisherKey(article: NewsArticle, sources: NewsSource[]): string {
  const homepage = sources.find(source => source.id === article.sourceId)?.homepage || article.url;
  try { return new URL(homepage).hostname.toLowerCase().replace(/^www\./, ''); }
  catch { return article.sourceId; }
}

export function selectionReason(article: NewsArticle): string {
  if (article.kind === 'advisory') return 'Primary security record · check affected products';
  if (article.kind === 'policy') return 'Official policy record · check its status and dates';
  if (article.kind === 'research') return 'Research record · explore methods and limitations';
  if (article.kind === 'release') return 'Primary announcement · review the original scope';
  return 'Recent reporting · read the publisher’s account';
}

/** Select up to four recent references, then reward topic and publisher variety.
 * A fourteen-day ceiling prevents old primary records being promoted as today's
 * news. At most two slots go to one publisher even when coverage is sparse. */
export function selectHighlights(articles: NewsArticle[], sources: NewsSource[], now = Date.now()): NewsArticle[] {
  const candidates = articles.filter(article => {
    const published = Date.parse(article.publishedAt || '');
    return isRelevantArticle(article) && Number.isFinite(published) && published <= now + 300_000 && now - published <= 14 * 86_400_000;
  });
  const selected: NewsArticle[] = [];
  const publisherCounts = new Map<string, number>();
  const categories = new Set<string>();
  const baseScore = (article: NewsArticle) => {
    const age = Math.max(0, (now - Date.parse(article.publishedAt!)) / 86_400_000);
    return Math.max(0, 42 - age * 3) + (article.kind === 'reporting' ? 0 : 5) + (/\b(?:API|MCP|interoperability|privacy|security|AI|artificial intelligence)\b/i.test(article.title) ? 3 : 0);
  };
  while (selected.length < 4) {
    const remaining = candidates.filter(article => !selected.some(item => item.id === article.id) && (publisherCounts.get(publisherKey(article, sources)) || 0) < 2);
    remaining.sort((a, b) => {
      const score = (article: NewsArticle) => baseScore(article) + (categories.has(article.category) ? 0 : 18) + (publisherCounts.has(publisherKey(article, sources)) ? 0 : 28);
      return score(b) - score(a) || (b.publishedAt || '').localeCompare(a.publishedAt || '') || a.id.localeCompare(b.id);
    });
    const next = remaining[0];
    if (!next) break;
    selected.push(next);
    categories.add(next.category);
    const publisher = publisherKey(next, sources);
    publisherCounts.set(publisher, (publisherCounts.get(publisher) || 0) + 1);
  }
  return selected;
}

export type StoryCluster = { id: string; title: string; articles: NewsArticle[]; updatedAt: string | null; sourceCount: number };
const STOP_WORDS = new Set('a an and are as at be been but by for from has have how in into is it its just new of on or says that the their this to was what when will with you your'.split(' '));
const tokens = (title: string) => new Set(title.toLowerCase().replace(/[^a-z0-9 -]/g, ' ').split(/\s+/).filter(word => word.length > 2 && !STOP_WORDS.has(word)));

function sameDevelopment(first: NewsArticle, second: NewsArticle): boolean {
  if (first.category !== second.category) return false;
  const firstDate = Date.parse(first.publishedAt || '');
  const secondDate = Date.parse(second.publishedAt || '');
  if (!Number.isFinite(firstDate) || !Number.isFinite(secondDate) || Math.abs(firstDate - secondDate) > 7 * 86_400_000) return false;
  const firstCves = first.title.match(/CVE-\d{4}-\d{4,}/gi)?.map(value => value.toUpperCase()).sort().join(',');
  const secondCves = second.title.match(/CVE-\d{4}-\d{4,}/gi)?.map(value => value.toUpperCase()).sort().join(',');
  if (firstCves || secondCves) return !!firstCves && firstCves === secondCves;
  const a = tokens(first.title);
  const b = tokens(second.title);
  const intersection = [...a].filter(word => b.has(word)).length;
  const union = new Set([...a, ...b]).size;
  // Require substantial matching language, not merely a company/topic name.
  return intersection >= 5 && intersection / union >= 0.68;
}

/** Cluster only strong headline matches or exact CVE identifiers. Every member
 * must match the original anchor, preventing transitive chains from joining
 * unrelated events. Multiple references never imply independent confirmation. */
export function groupStories(articles: NewsArticle[], sources: NewsSource[]): StoryCluster[] {
  const ordered = articles.filter(isRelevantArticle).slice().sort((a, b) => (a.publishedAt || '').localeCompare(b.publishedAt || '') || a.id.localeCompare(b.id));
  const groups: NewsArticle[][] = [];
  for (const article of ordered) {
    const existing = groups.find(group => sameDevelopment(group[0], article));
    if (existing) { if (!existing.some(item => item.id === article.id)) existing.push(article); }
    else groups.push([article]);
  }
  return groups.filter(group => group.length > 1).map(group => {
    const anchor = group[0];
    const references = group.slice().sort((a, b) => (b.publishedAt || '').localeCompare(a.publishedAt || '') || a.id.localeCompare(b.id));
    return { id: anchor.id, title: anchor.title, articles: references, updatedAt: references[0].publishedAt, sourceCount: new Set(group.map(article => publisherKey(article, sources))).size };
  }).sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || '') || a.id.localeCompare(b.id));
}
