import { canonicalUrl, makeArticle, rssItems } from './normalize';
import { isRelevantArticle } from './editorial';
import type { NewsArticle, NewsCategory, NewsSource } from './types';

const MAX_BYTES = 4 * 1024 * 1024;
const ENDPOINT_HOSTS = ['api.datacite.org', 'www.federalregister.gov', 'www.fda.gov', 'www.cisa.gov', 'www.nist.gov', 'www.cms.gov', 'techcrunch.com', 'www.techcrunch.com'];

export async function readSourceBody(source: NewsSource, fetcher: typeof fetch = fetch): Promise<string> {
  if (!source.enabled || source.rights.status !== 'approved' || !source.feedUrl) throw new Error('Source is not approved');
  const endpoint = canonicalUrl(source.feedUrl, ENDPOINT_HOSTS);
  if (!endpoint) throw new Error('Feed endpoint is not allowed');
  const response = await fetcher(endpoint, {
    redirect: 'error', cache: 'no-store', signal: AbortSignal.timeout(8_000),
    headers: { Accept: 'application/json, application/rss+xml, application/xml;q=0.8', 'User-Agent': 'OfRootNews/1.0 (mailto:communications@ofroot.technology; https://ofroot.technology/news/methodology)' },
  });
  if (!response.ok) throw new Error(`Source returned HTTP ${response.status}`);
  const length = Number(response.headers.get('content-length') || 0);
  if (length > MAX_BYTES) throw new Error('Source response exceeds size limit');
  if (!response.body) throw new Error('Source returned an empty body');
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let bytes = 0;
  let output = '';
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > MAX_BYTES) throw new Error('Source response exceeds size limit');
      output += decoder.decode(value, { stream: true });
    }
    return output + decoder.decode();
  } finally { await reader.cancel().catch(() => undefined); }
}

function records(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value) ? value.filter(item => !!item && typeof item === 'object') as Record<string, unknown>[] : [];
}

function object(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

const INTEGRATION_SIGNAL = /\bapis?\b|integration|interoperabilit|\bmcp\b|model context protocol|connector|zapier|\bsdks?\b/i;
const CYBER_TITLE_SIGNAL = /\bcyber(?:security|attack|crime)?\b|\bransomware\b|\bmalware\b|\bhackers?\b|\bhacked\b|\bhacking\b|\bdata breach\b|\bzero.day\b|\bvulnerabilit(?:y|ies)\b|\b(?:stolen|leaked|exposed) (?:customer|user|patient|personal|account|sensitive|private|financial) data\b/i;
const CYBER_CATEGORY_SIGNAL = /^(?:security|cybersecurity|cybercrime|data breach|data breaches)$/i;
const HEALTH_TITLE_SIGNAL = /\b(?:healthcare|health care|clinical|clinician|patient|biotech|medical|hospital|therap(?:y|ies)|drug discovery)\b/i;

export function routeTechCrunchCategory(sourceId: string, title: string, categories: string[] = []): NewsCategory {
  if (sourceId === 'techcrunch-healthcare') return 'healthcare';
  if (CYBER_TITLE_SIGNAL.test(title) || categories.some(category => CYBER_CATEGORY_SIGNAL.test(category.trim()))) return 'cybersecurity';
  if (HEALTH_TITLE_SIGNAL.test(title)) return 'healthcare';
  if (sourceId === 'techcrunch-integrations' || INTEGRATION_SIGNAL.test([title, ...categories].join(' '))) return 'integrations';
  return 'ai';
}

export function relevantPolicyTitle(title: string): boolean {
  // A full-text match can merely mention AI in an unrelated policy document.
  // Require a technology-related title before publishing the metadata card.
  return /\bAI\b|artificial intelligence|cyber|\b(?:data|information|network|software|digital|computer) security\b|privacy|health (?:information|IT)|data governance|automated|automation|technolog|machine learning|algorithm|digital identity|interoperabilit/i.test(title);
}

export function parseSourceBody(source: NewsSource, body: string, now = Date.now()): NewsArticle[] {
  if (!source.enabled || source.rights.status !== 'approved') return [];
  const articles: (NewsArticle | null)[] = [];
  if (source.id === 'nist' || source.id === 'cms') {
    for (const item of rssItems(body)) {
      let url = item.url;
      let date = item.date;
      if (source.id === 'cms') {
        // CMS currently serializes an HTML anchor into its RSS link field. Read
        // only that fixed-origin newsroom path; never follow arbitrary HTML URLs.
        if (url.includes('%3C') || url.includes('%3c')) {
          let decoded = '';
          try { decoded = decodeURIComponent(url); } catch { continue; }
          const path = decoded.match(/<a\s+href="(\/newsroom\/[^"<>]+)"/i)?.[1];
          if (!path || path.startsWith('//')) continue;
          url = `https://www.cms.gov${path}`;
        }
        // Its feed omits a timezone. Preserve only the supplied calendar date,
        // rather than manufacturing an exact UTC publication timestamp.
        const supplied = date.match(/\b(\d{2})\/(\d{2})\/(\d{4})\b/);
        if (supplied) date = `${supplied[3]}-${supplied[1]}-${supplied[2]}`;
        if (!/technolog|digital|\bdata\b|prior authorization|interoperabilit|electronic|artificial intelligence|\bAI\b|cyber/i.test(item.title)) continue;
      }
      const category: NewsCategory = source.id === 'cms' ? 'healthcare'
        : CYBER_TITLE_SIGNAL.test(item.title) || /\bsecurity\b|cryptograph|encryption/i.test(item.title) ? 'cybersecurity'
          : /\bAI\b|artificial intelligence|machine learning/i.test(item.title) ? 'ai' : 'integrations';
      // CMS's dc:creator currently repeats its date instead of naming an author.
      // Omit that malformed value; NIST's supplied author credit remains intact.
      articles.push(makeArticle({ title: item.title, url, date, author: source.id === 'cms' ? undefined : item.author, category, kind: 'release' }, source, source.id === 'cms' ? ['www.cms.gov'] : ['www.nist.gov'], now));
    }
    // Valid official feeds can contain only events or out-of-beat records.
    return articles.filter((article): article is NewsArticle => !!article && isRelevantArticle(article));
  } else if (source.id === 'fda') {
    for (const item of rssItems(body)) {
      // The FDA's own RSS currently publishes http links. Upgrade this exact official
      // origin to HTTPS; arbitrary HTTP URLs remain rejected by the normalizer.
      const url = item.url.replace(/^http:\/\/www\.fda\.gov\//i, 'https://www.fda.gov/');
      articles.push(makeArticle({ title: item.title, url, date: item.date, author: item.author, category: 'healthcare', kind: 'release' }, source, ['www.fda.gov', 'fda.gov'], now));
    }
  } else if (source.id.startsWith('techcrunch')) {
    for (const item of rssItems(body)) {
      const integration = INTEGRATION_SIGNAL.test([item.title, ...item.categories].join(' '));
      if (source.id === 'techcrunch-integrations' && !integration) continue;
      const category = routeTechCrunchCategory(source.id, item.title, item.categories);
      articles.push(makeArticle({ title: item.title, url: item.url, date: item.date, author: item.author, category, kind: 'reporting', preserveFeedFields: true }, source, ['techcrunch.com', 'www.techcrunch.com'], now));
    }
    // An enterprise feed may have no integration-specific items at this check.
    // That is an honest empty category, not a failed feed or fabricated story.
    if (!articles.length && source.id === 'techcrunch-integrations') return [];
  } else {
    const data = object(JSON.parse(body));
    if (source.id === 'cisa') {
      if (!Array.isArray(data.vulnerabilities)) throw new Error('Unexpected catalog format');
      const vulnerabilities = records(data.vulnerabilities).sort((a, b) => String(b.dateAdded || '').localeCompare(String(a.dateAdded || ''))).slice(0, 40);
      for (const item of vulnerabilities) {
        if (typeof item.cveID !== 'string' || !/^CVE-\d{4}-\d{4,}$/.test(item.cveID)) continue;
        articles.push(makeArticle({ title: `${item.cveID}: ${item.vulnerabilityName || `${item.vendorProject} ${item.product}`}`, url: `https://www.cisa.gov/known-exploited-vulnerabilities-catalog?search_api_fulltext=${encodeURIComponent(item.cveID)}`, date: item.dateAdded, category: 'cybersecurity', kind: 'advisory' }, source, ['www.cisa.gov'], now));
      }
    } else if (source.id === 'federal-register') {
      if (!Array.isArray(data.results)) throw new Error('Unexpected document format');
      for (const item of records(data.results).slice(0, 40)) {
        if (typeof item.title !== 'string' || !relevantPolicyTitle(item.title)) continue;
        articles.push(makeArticle({ title: `${item.type || 'Document'}: ${item.title}`, url: item.html_url, date: item.publication_date, category: 'policy', kind: 'policy' }, source, ['www.federalregister.gov'], now));
      }
      // A valid API response with no relevant titles is healthy and intentionally empty.
      if (!articles.length) return [];
    } else if (source.id === 'arxiv' || source.id === 'arxiv-integrations') {
      if (!Array.isArray(data.data)) throw new Error('Unexpected metadata format');
      for (const record of records(data.data).slice(0, 40)) {
        const item = object(record.attributes);
        const title = records(item.titles)[0]?.title;
        if (typeof title !== 'string') continue;
        const dates = records(item.dates).filter(date => date.dateType === 'Submitted').map(date => date.date).filter((date): date is string => typeof date === 'string').sort();
        const authors = records(item.creators).slice(0, 2).map(author => author.name).filter((name): name is string => typeof name === 'string').join(', ');
        const category = source.id === 'arxiv-integrations' || /model context protocol|interoperabilit|api integration/i.test(title) ? 'integrations' : 'ai';
        articles.push(makeArticle({ title, url: item.url, date: dates[0], author: authors, category, kind: 'research' }, source, ['arxiv.org', 'www.arxiv.org'], now));
      }
    } else throw new Error('No adapter configured for source');
  }
  const accepted = articles.filter((item): item is NewsArticle => item !== null && isRelevantArticle(item));
  if (articles.length && !accepted.length && source.id.startsWith('techcrunch')) return [];
  if (!accepted.length) throw new Error('Source returned no valid metadata');
  return accepted;
}
