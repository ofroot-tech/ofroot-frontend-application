import { createHash } from 'node:crypto';
import type { NewsArticle } from '@/app/lib/news/types';
import { parseNewsDate } from '@/app/lib/news/normalize';
import type { BriefEvidence, EvidenceResult } from './types';

/** Discovery and evidence have different permissions. An article can point us
 * to an exact public record, but its headline alone can never support a brief.
 * Every network URL below is constructed from a fixed endpoint and validated ID.
 */
const MAX_BYTES = 4 * 1024 * 1024;
const CATALOG_TTL = 15 * 60_000;
const FDA_FEED = 'https://www.fda.gov/about-fda/contact-fda/stay-informed/rss-feeds/press-releases/rss.xml';
const KEV_FEED = 'https://raw.githubusercontent.com/cisagov/kev-data/develop/known_exploited_vulnerabilities.json';
type Identity = { kind: 'arxiv' | 'federal-register' | 'cisa' | 'fda'; id: string; url: string };
type Retrieved = { body: string; fetchedAt: string };
const catalogs = new WeakMap<typeof fetch, { expiresAt: number; pending: Promise<Retrieved> }>();
const HTML_TAGS = new Set('a abbr address area article aside audio b base bdi bdo blockquote body br button canvas caption cite code col colgroup data datalist dd del details dfn dialog div dl dt em embed fieldset figcaption figure footer form h1 h2 h3 h4 h5 h6 head header hgroup hr html i iframe img input ins kbd label legend li link main map mark menu meta meter nav noscript object ol optgroup option output p picture pre progress q rp rt ruby s samp script search section select slot small source span strong style sub summary sup table tbody td template textarea tfoot th thead time title tr track u ul var video wbr'.split(' '));
const BLOCK_TAGS = new Set('address article aside blockquote br caption dd details dialog div dl dt fieldset figcaption figure footer form h1 h2 h3 h4 h5 h6 header hgroup hr li main menu nav ol p pre section summary table tbody td tfoot th thead tr ul'.split(' '));

function object(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}
function records(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value) ? value.map(object) : [];
}
/** Evidence must preserve what a source actually claims. A blanket <...>
 * replacement mistakes comparisons for tags and can invert a research result.
 * Decode entities, remove script/style blocks, and strip only recognized HTML
 * tag tokens; numeric comparisons and non-HTML mathematical notation survive.
 * The result is still rendered as escaped React text, never executable HTML.
 */
function text(value: unknown, limit = 4_000): string {
  if (typeof value !== 'string') return '';
  const entities: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', copy: '\u00a9', le: '\u2264', leq: '\u2264', ge: '\u2265', geq: '\u2265', ne: '\u2260', minus: '\u2212', times: '\u00d7', plusmn: '\u00b1', middot: '\u00b7' };
  return value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&(#x[0-9a-f]+|#\d+|[a-z][a-z0-9]+);/gi, (match: string, entity: string) => {
      if (!entity.startsWith('#')) return entities[entity.toLowerCase()] ?? match;
      const code = entity.toLowerCase().startsWith('#x') ? parseInt(entity.slice(2), 16) : parseInt(entity.slice(1), 10);
      return code > 0 && code <= 0x10ffff && !(code >= 0xd800 && code <= 0xdfff) ? String.fromCodePoint(code) : '';
    })
    .replace(/<!--[^]*?-->/g, '')
    .replace(/<(script|style)\b[^>]*>[^]*?<\/\1\s*>/gi, '')
    .replace(/<(script|style)\b[^>]*>[^]*$/gi, '')
    .replace(/<\/?([a-z][a-z0-9:-]*)(?:\s(?:[^<>"']|"[^"]*"|'[^']*')*)?\s*\/?>/gi, (tag: string, name: string) => HTML_TAGS.has(name.toLowerCase()) ? BLOCK_TAGS.has(name.toLowerCase()) ? ' ' : '' : tag)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/\s+/g, ' ').trim().slice(0, limit);
}
function title(value: unknown): string { return text(value, 500); }
function date(value: unknown): string | null { return parseNewsDate(value); }
function calendarDate(value: unknown): string | null {
  // Effective dates and remediation deadlines can legitimately be in the
  // future; the publication-date future guard must not erase them.
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const timestamp = Date.parse(`${value}T00:00:00Z`);
  return Number.isFinite(timestamp) && new Date(timestamp).toISOString().slice(0, 10) === value ? value : null;
}

function identity(article: NewsArticle): Identity | null {
  try {
    const url = new URL(article.url);
    if (url.protocol !== 'https:' || url.username || url.password || url.port || url.hash) return null;
    if ((article.sourceId === 'arxiv' || article.sourceId === 'arxiv-integrations') && article.kind === 'research' && url.hostname === 'arxiv.org' && !url.search) {
      // Version-specific and legacy identifiers need their own adapter; never
      // silently substitute a different version of a paper for the linked one.
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

export function supportsBrief(article: NewsArticle): boolean { return identity(article) !== null; }

/** A byte limit applies while streaming, even when a server omits or lies about
 * Content-Length. Redirects, including a successful response that followed one,
 * are rejected; approved origins cannot become arbitrary URL fetch proxies.
 */
async function retrieve(endpoint: string, fetcher: typeof fetch): Promise<Retrieved> {
  const response = await fetcher(endpoint, {
    redirect: 'error', cache: 'no-store', signal: AbortSignal.timeout(8_000),
    headers: { Accept: endpoint === FDA_FEED ? 'application/rss+xml, application/xml;q=0.9' : 'application/json', 'User-Agent': 'OfRootSignalBrief/1.0 (https://www.ofroot.technology/news/methodology)' },
  });
  if (!response.ok || response.redirected) throw new Error('Evidence fetch unavailable');
  if (Number(response.headers.get('content-length') || 0) > MAX_BYTES || !response.body) throw new Error('Evidence size unavailable');
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let bytes = 0;
  let body = '';
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > MAX_BYTES) throw new Error('Evidence exceeds limit');
      body += decoder.decode(value, { stream: true });
    }
    return { body: body + decoder.decode(), fetchedAt: new Date().toISOString() };
  } finally { await reader.cancel().catch(() => undefined); }
}

function kevCatalog(fetcher: typeof fetch): Promise<Retrieved> {
  const previous = catalogs.get(fetcher);
  if (previous && previous.expiresAt > Date.now()) return previous.pending;
  const pending = retrieve(KEV_FEED, fetcher);
  catalogs.set(fetcher, { expiresAt: Date.now() + CATALOG_TTL, pending });
  pending.catch(() => { if (catalogs.get(fetcher)?.pending === pending) catalogs.delete(fetcher); });
  return pending;
}

function available(value: Omit<BriefEvidence, 'contentHash'>): EvidenceResult {
  // Hash substantive evidence, not retrieval time: repeated reads of unchanged
  // material should have the same provenance fingerprint.
  const contentHash = createHash('sha256').update(JSON.stringify({ ...value, fetchedAt: undefined })).digest('hex');
  return { status: 'available', evidence: { ...value, contentHash } };
}
function mismatch(): EvidenceResult { return { status: 'unavailable', reason: 'The approved primary record could not be matched to this reference.' }; }
function missing(): EvidenceResult { return { status: 'unavailable', reason: 'The approved source did not supply enough substantive evidence for a brief.' }; }

/** Exact IDs bind each brief to one primary source. No model-created URL, web
 * search result, or publisher article body participates in this adapter.
 */
export async function fetchBriefEvidence(article: NewsArticle, fetcher: typeof fetch = fetch): Promise<EvidenceResult> {
  const key = identity(article);
  if (!key) return { status: 'unsupported', reason: 'A reviewed primary evidence source is not available for this reference yet.' };
  try {
    if (key.kind === 'arxiv') {
      const doi = `10.48550/arxiv.${key.id}`;
      const remote = await retrieve(`https://api.datacite.org/dois/${doi}`, fetcher);
      const record = object(object(JSON.parse(remote.body)).data);
      const item = object(record.attributes);
      if (typeof record.id !== 'string' || record.id.toLowerCase() !== doi || typeof item.doi !== 'string' || item.doi.toLowerCase() !== doi || item.url !== key.url) return mismatch();
      const abstract = text(records(item.descriptions).find(entry => entry.descriptionType === 'Abstract')?.description, 12_000);
      const heading = title(records(item.titles)[0]?.title);
      if (abstract.length < 80 || !heading) return missing();
      const authors = records(item.creators).map(entry => text(entry.name, 180)).filter(Boolean).slice(0, 12).join('; ');
      const submitted = records(item.dates).find(entry => entry.dateType === 'Submitted')?.date;
      return available({ url: key.url, retrievalUrl: `https://api.datacite.org/dois/${doi}`, publisher: 'arXiv via DataCite', title: heading, publishedAt: date(submitted), fetchedAt: remote.fetchedAt,
        license: 'CC0 1.0 descriptive metadata from arXiv / DataCite. Linked full text has separate rights.',
        scope: 'Author-supplied research abstract and bibliographic metadata. The full paper was not reviewed.', abstract,
        facts: [{ label: 'DOI', value: doi }, ...(authors ? [{ label: 'Authors', value: authors }] : [])],
        caveats: ['An abstract describes the authors’ claims; it does not establish independent verification or peer review.', 'Reported research findings may not generalize to production systems.'],
      });
    }
    if (key.kind === 'federal-register') {
      const remote = await retrieve(`https://www.federalregister.gov/api/v1/documents/${key.id}.json`, fetcher);
      const item = object(JSON.parse(remote.body));
      if (item.document_number !== key.id || typeof item.html_url !== 'string' || item.html_url.replace(/\/$/, '') !== key.url) return mismatch();
      const abstract = text(item.abstract, 12_000);
      const heading = title(item.title);
      const documentType = text(item.type, 100);
      if (abstract.length < 80 || !heading || !documentType) return missing();
      const effective = calendarDate(item.effective_on);
      return available({ url: key.url, retrievalUrl: `https://www.federalregister.gov/api/v1/documents/${key.id}.json`, publisher: 'Federal Register', title: heading, publishedAt: date(item.publication_date), fetchedAt: remote.fetchedAt,
        license: 'Federal Register material may be reproduced under 1 CFR 2.6.',
        scope: 'Agency-supplied Federal Register abstract and document metadata; not a full legal analysis.', abstract,
        facts: [{ label: 'Document number', value: key.id }, { label: 'Document type', value: documentType }, ...(effective ? [{ label: 'Effective date recorded', value: effective }] : []), ...(text(item.citation, 100) ? [{ label: 'Citation', value: text(item.citation, 100) }] : [])],
        caveats: ['A proposal or notice is not an enacted requirement. Read the document’s type, dates, scope, and jurisdiction.', 'For legal reliance, verify against the official Federal Register edition linked by the source.'],
      });
    }
    if (key.kind === 'cisa') {
      const remote = await kevCatalog(fetcher);
      const catalog = object(JSON.parse(remote.body));
      const matches = records(catalog.vulnerabilities).filter(entry => entry.cveID === key.id);
      if (matches.length !== 1) return mismatch();
      const item = matches[0];
      const abstract = text(item.shortDescription, 4_000);
      const heading = title(item.vulnerabilityName);
      if (abstract.length < 30 || !heading) return missing();
      const facts = [{ label: 'CVE', value: key.id }];
      for (const [field, label] of [['vendorProject', 'Vendor'], ['product', 'Product'], ['requiredAction', 'CISA required action']] as const) {
        const value = text(item[field], field === 'requiredAction' ? 2_000 : 250);
        if (value) facts.push({ label, value });
      }
      const due = calendarDate(item.dueDate);
      if (due) facts.push({ label: 'Federal agency due date', value: due });
      if (item.knownRansomwareCampaignUse === 'Known' || item.knownRansomwareCampaignUse === 'Unknown') facts.push({ label: 'Ransomware campaign use in catalog', value: item.knownRansomwareCampaignUse });
      return available({ url: key.url, retrievalUrl: KEV_FEED, publisher: 'CISA Known Exploited Vulnerabilities catalog', title: `${key.id}: ${heading}`, publishedAt: date(item.dateAdded), fetchedAt: remote.fetchedAt,
        license: 'CC0 1.0 — CISA KEV database. Third-party linked material is excluded.',
        scope: 'One exact CISA catalog record, retrieved from CISA’s official GitHub data mirror.', abstract, facts,
        caveats: ['Catalog inclusion records known exploitation; it is not evidence that a particular organization is compromised.', 'The listed remediation due date applies to U.S. Federal Civilian Executive Branch agencies under the relevant directive, not universally to every organization.', 'Unknown ransomware campaign use does not mean no ransomware use. Consult current vendor guidance before acting.'],
      });
    }

    // FDA explicitly supplies a short agency summary in RSS. Use that exact
    // description, never scrape the linked release or infer clinical benefits.
    const remote = await retrieve(FDA_FEED, fetcher);
    if (/<!DOCTYPE|<!ENTITY/i.test(remote.body) || !/<rss\b/i.test(remote.body)) return missing();
    const entries = Array.from(remote.body.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item\s*>/gi));
    const field = (entry: string, name: string, limit: number) => text(entry.match(new RegExp(`<${name}\\b[^>]*>([\\s\\S]*?)<\\/${name}\\s*>`, 'i'))?.[1], limit);
    const matches = entries.filter(entry => field(entry[1], 'link', 3_000).replace(/^http:\/\/www\.fda\.gov\//i, 'https://www.fda.gov/').replace(/\/$/, '') === key.url);
    if (matches.length !== 1 || field(matches[0][1], 'title', 500) !== title(article.title)) return mismatch();
    const entry = matches[0][1];
    const creator = field(entry, 'dc:creator', 150) || field(entry, 'creator', 150);
    const thirdPartyCreator = creator && !/^(?:FDA|(?:U\.?S\.?\s+)?Food and Drug Administration)$/i.test(creator);
    if (thirdPartyCreator || /copyright|\u00a9|all rights reserved|courtesy of|reprinted (?:by|with)|provided by a third.party/i.test(text(entry, MAX_BYTES)) || /&copy;/i.test(entry)) return { status: 'unsupported', reason: 'This source item requires an additional rights review before a brief can be provided.' };
    const abstract = field(entry, 'description', 4_000);
    if (abstract.length < 80) return missing();
    return available({ url: key.url, retrievalUrl: FDA_FEED, publisher: 'U.S. Food and Drug Administration', title: field(entry, 'title', 500), publishedAt: date(field(entry, 'pubDate', 100)), fetchedAt: remote.fetchedAt,
      license: 'FDA agency-created feed summary; public domain unless otherwise noted.',
      scope: 'The FDA’s short agency-supplied RSS summary only. The full release and supporting studies were not reviewed.', abstract, facts: [],
      caveats: ['This is an agency announcement, not independent clinical verification or medical advice.', 'A program announcement does not establish that a treatment is effective or approved. Read the current FDA source for scope and updates.'],
    });
  } catch {
    return { status: 'unavailable', reason: 'The approved evidence source is temporarily unavailable. Please try again later.' };
  }
}
