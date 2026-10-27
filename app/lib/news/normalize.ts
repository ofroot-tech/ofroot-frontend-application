import { createHash } from 'node:crypto';
import type { NewsArticle, NewsCategory, NewsKind, NewsSource } from './types';

const TRACKING = /^(utm_.+|fbclid|gclid|mc_cid|mc_eid|ref_src)$/i;

export function plainText(value: unknown, limit = 500): string {
  if (typeof value !== 'string') return '';
  const text = value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos);/gi, (_, entity: string) => {
      const named: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };
      if (!entity.startsWith('#')) return named[entity.toLowerCase()] || '';
      const code = entity.toLowerCase().startsWith('#x') ? parseInt(entity.slice(2), 16) : parseInt(entity.slice(1), 10);
      return code > 0 && code <= 0x10ffff && !(code >= 0xd800 && code <= 0xdfff) ? String.fromCodePoint(code) : '';
    })
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/\s+/g, ' ').trim();
  return text.slice(0, limit);
}

export function canonicalUrl(value: unknown, allowedHosts: string[]): string | null {
  if (typeof value !== 'string' || value.length > 3000) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password || (url.port && url.port !== '443')) return null;
    if (!allowedHosts.includes(url.hostname.toLowerCase())) return null;
    for (const key of Array.from(url.searchParams.keys())) if (TRACKING.test(key)) url.searchParams.delete(key);
    url.hash = '';
    url.searchParams.sort();
    return url.toString();
  } catch { return null; }
}

export function parseNewsDate(value: unknown, now = Date.now()): string | null {
  if (typeof value !== 'string' || !value || /^\d{4}$/.test(value) || /^\d{4}-\d{2}$/.test(value)) return null;
  const time = Date.parse(value);
  if (!Number.isFinite(time) || time > now + 5 * 60_000) return null;
  // Date-only government records have no timezone or time of day. Preserve that
  // precision rather than turning midnight UTC into the previous local date.
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : new Date(time).toISOString();
}

export function makeArticle(input: { title: unknown; url: unknown; date: unknown; category: NewsCategory; kind: NewsKind; author?: unknown; preserveFeedFields?: boolean }, source: NewsSource, hosts: string[], now = Date.now()): NewsArticle | null {
  if (!source.enabled || source.rights.status !== 'approved') return null;
  const completeTitle = plainText(input.title, 5001);
  if (input.preserveFeedFields && completeTitle.length > 5000) return null;
  const title = input.preserveFeedFields ? completeTitle : completeTitle.slice(0, 500);
  const canonical = canonicalUrl(input.url, hosts);
  if (!title || !canonical) return null;
  // Some RSS licenses require the publisher's original link unchanged. We use a
  // normalized URL only for identity/deduplication, retaining the supplied href.
  const url = input.preserveFeedFields ? String(input.url) : canonical;
  const parsed = typeof input.date === 'string' ? Date.parse(input.date) : NaN;
  // Do not silently promote future stories into an undated/latest-news slot.
  if (Number.isFinite(parsed) && parsed > now + 5 * 60_000) return null;
  const author = plainText(input.author, 150);
  return {
    id: createHash('sha256').update(canonical).digest('hex').slice(0, 20),
    title, url, sourceId: source.id, category: input.category, kind: input.kind,
    publishedAt: parseNewsDate(input.date, now), ...(author ? { author } : {}),
  };
}

export function deduplicateArticles(articles: NewsArticle[]): NewsArticle[] {
  const byId = new Map<string, NewsArticle>();
  for (const article of articles) {
    const previous = byId.get(article.id);
    // The input orders retained records first and fresh metadata last. Equal dates
    // must therefore prefer the incoming title so publisher corrections propagate.
    if (!previous || (article.publishedAt || '') >= (previous.publishedAt || '')) byId.set(article.id, article);
  }
  return Array.from(byId.values()).sort((a, b) => (b.publishedAt || '').localeCompare(a.publishedAt || '') || a.id.localeCompare(b.id));
}

// Limited RSS 2.0 metadata reader for our fixed approved endpoints. It never expands entities,
// fetches external resources, interprets HTML, or returns descriptions/content bodies.
export function rssItems(xml: string): { title: string; url: string; date: string; author: string; categories: string[] }[] {
  if (/<!DOCTYPE|<!ENTITY/i.test(xml)) throw new Error('Unsupported XML declaration');
  if (!/<rss\b/i.test(xml)) throw new Error('Unexpected feed format');
  const entries = Array.from(xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item\s*>/gi)).slice(0, 60);
  return entries.map(entry => {
    const tag = (name: string) => plainText(entry[1].match(new RegExp(`<${name}\\b[^>]*>([\\s\\S]*?)<\\/${name}\\s*>`, 'i'))?.[1], name === 'link' ? 3000 : name === 'title' ? 5001 : 500);
    const categories = Array.from(entry[1].matchAll(/<category\b[^>]*>([\s\S]*?)<\/category\s*>/gi)).map(match => plainText(match[1], 100));
    return { title: tag('title'), url: tag('link'), date: tag('pubDate') || tag('dc:date'), author: tag('dc:creator'), categories };
  });
}
