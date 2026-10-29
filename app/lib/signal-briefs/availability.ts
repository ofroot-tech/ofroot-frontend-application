import type { NewsArticle } from '../news/types';

/** Support is a routing capability, not a promise that evidence was retrieved.
 * This module is shared with the browser, so it has no database or Node imports. */
export type BriefAvailability = 'ready' | 'unsupported' | 'unavailable' | 'unchecked';
export type BriefIdentity = { kind: 'arxiv' | 'federal-register' | 'cisa' | 'fda'; id: string; url: string };

export function briefIdentity(article: NewsArticle): BriefIdentity | null {
  try {
    const url = new URL(article.url);
    if (url.protocol !== 'https:' || url.username || url.password || url.port || url.hash) return null;
    if ((article.sourceId === 'arxiv' || article.sourceId === 'arxiv-integrations') && article.kind === 'research' && url.hostname === 'arxiv.org' && !url.search) {
      // Version-specific and legacy papers require a distinct adapter. Linking
      // another version would misrepresent the evidence behind this reference.
      const match = url.pathname.match(/^\/abs\/(\d{4}\.\d{4,5})$/);
      return match ? { kind: 'arxiv', id: match[1], url: url.href } : null;
    }
    if (article.sourceId === 'federal-register' && article.kind === 'policy' && url.hostname === 'www.federalregister.gov' && !url.search) {
      const match = url.pathname.match(/^\/documents\/\d{4}\/\d{2}\/\d{2}\/(\d{4}-\d{4,7})\/[a-z0-9-]+\/?$/);
      return match ? { kind: 'federal-register', id: match[1], url: url.href.replace(/\/$/, '') } : null;
    }
    if (article.sourceId === 'cisa' && article.kind === 'advisory' && url.hostname === 'www.cisa.gov' && url.pathname === '/known-exploited-vulnerabilities-catalog') {
      const id = url.searchParams.get('search_api_fulltext');
      const keys = Array.from(url.searchParams.keys());
      return id && /^CVE-\d{4}-\d{4,9}$/.test(id) && keys.length === 1 && keys[0] === 'search_api_fulltext' && article.title.startsWith(`${id}:`)
        ? { kind: 'cisa', id, url: url.href } : null;
    }
    if (article.sourceId === 'fda' && article.kind === 'release' && url.hostname === 'www.fda.gov' && !url.search && /^\/news-events\/press-announcements\/[a-z0-9-]+\/?$/.test(url.pathname)) {
      return { kind: 'fda', id: url.pathname, url: url.href.replace(/\/$/, '') };
    }
    return null;
  } catch { return null; }
}

export function initialBriefAvailability(article: NewsArticle): BriefAvailability {
  return briefIdentity(article) ? 'unchecked' : 'unsupported';
}

/** Only a checked, usable record earns the Brief label. The Signal mark stays
 * the consistent action; its text tells readers which experience will open. */
export function briefAction(availability: BriefAvailability = 'unchecked') {
  return availability === 'ready'
    ? { label: 'Brief', description: 'Read Signal brief' }
    : { label: 'Sources', description: availability === 'unavailable' ? 'View Signal sources; primary evidence temporarily unavailable' : 'View Signal sources' };
}
