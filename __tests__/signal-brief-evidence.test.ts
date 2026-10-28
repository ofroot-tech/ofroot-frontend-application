import { fetchBriefEvidence, supportsBrief } from '@/app/lib/signal-briefs/evidence';
import type { NewsArticle } from '@/app/lib/news/types';

/** Fixtures contain only reusable primary records. The tests deliberately make
 * discovery references disagree with those records to verify the identity gate.
 */
const research: NewsArticle = { id: 'a'.repeat(20), title: 'Interoperability research', sourceId: 'arxiv', kind: 'research', category: 'ai', url: 'https://arxiv.org/abs/2610.12345', publishedAt: '2026-10-25' };
const federal: NewsArticle = { ...research, sourceId: 'federal-register', kind: 'policy', category: 'policy', title: 'Proposed Rule: Connected systems', url: 'https://www.federalregister.gov/documents/2026/10/25/2026-12345/connected-systems' };
const cisa: NewsArticle = { ...research, sourceId: 'cisa', kind: 'advisory', category: 'cybersecurity', title: 'CVE-2026-12345: Example product vulnerability', url: 'https://www.cisa.gov/known-exploited-vulnerabilities-catalog?search_api_fulltext=CVE-2026-12345' };
const fda: NewsArticle = { ...research, sourceId: 'fda', kind: 'release', category: 'healthcare', title: 'FDA launches a research program', url: 'https://www.fda.gov/news-events/press-announcements/fda-launches-a-research-program' };
const abstract = 'The authors describe a controlled evaluation of connected software systems using a limited research dataset. Their abstract reports the scope of their evaluation and the questions that remain open.';

function datacite() {
  return { data: { id: '10.48550/arxiv.2610.12345', attributes: { doi: '10.48550/arXiv.2610.12345', url: research.url, titles: [{ title: 'Interoperability research' }], descriptions: [{ descriptionType: 'Abstract', description: abstract }], creators: [{ name: 'Researcher, Example' }], dates: [{ dateType: 'Submitted', date: '2026-10-25' }] } } };
}
function fetchJson(data: unknown) { return jest.fn().mockResolvedValue(new Response(JSON.stringify(data), { headers: { 'content-type': 'application/json' } })); }
function agencyFeed(description = abstract, link = fda.url) { return `<rss><channel><item><title>${fda.title}</title><link>${link}</link><description><![CDATA[${description}]]></description><pubDate>Sun, 25 Oct 2026 12:00:00 GMT</pubDate></item></channel></rss>`; }

describe('Signal brief evidence boundaries', () => {
  test('maps exact arXiv IDs to CC0 metadata without requesting a paper or publisher article', async () => {
    const fetcher = fetchJson(datacite());
    const result = await fetchBriefEvidence(research, fetcher);
    expect(result.status).toBe('available');
    if (result.status !== 'available') throw new Error('Expected primary evidence');
    expect(result.evidence).toMatchObject({ abstract, url: research.url, retrievalUrl: 'https://api.datacite.org/dois/10.48550/arxiv.2610.12345', publishedAt: '2026-10-25', title: research.title });
    expect(result.evidence.scope).toContain('full paper was not reviewed');
    expect(result.evidence.license).toContain('CC0');
    expect(result.evidence.contentHash).toMatch(/^[a-f0-9]{64}$/);
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(fetcher.mock.calls[0][0]).toBe('https://api.datacite.org/dois/10.48550/arxiv.2610.12345');
    expect(fetcher.mock.calls[0][1]).toMatchObject({ redirect: 'error', cache: 'no-store' });
    expect(fetcher.mock.calls[0][1].signal).toBeDefined();
  });

  test.each(['id', 'url', 'doi'])('rejects a mismatched DataCite %s even with a plausible title', async field => {
    const data = datacite();
    if (field === 'id') data.data.id = '10.48550/arxiv.2610.99999';
    else data.data.attributes[field as 'url' | 'doi'] = field === 'url' ? 'https://arxiv.org/abs/2610.99999' : '10.48550/arxiv.2610.99999';
    expect((await fetchBriefEvidence(research, fetchJson(data))).status).toBe('unavailable');
  });

  test('does not invent an abstract from bibliographic metadata or an article headline', async () => {
    const data = datacite();
    data.data.attributes.descriptions = [];
    expect((await fetchBriefEvidence(research, fetchJson(data))).status).toBe('unavailable');
  });

  test('rejects URL injection, ambiguous identities, and unsupported publisher sources without a request', async () => {
    const fetcher = jest.fn();
    const variants: NewsArticle[] = [
      ...['http://arxiv.org/abs/2610.12345', 'https://arxiv.org.evil.test/abs/2610.12345', 'https://user:password@arxiv.org/abs/2610.12345', 'https://arxiv.org:444/abs/2610.12345', 'https://127.0.0.1/abs/2610.12345', 'https://arxiv.org/abs/2610.12345?url=https://evil.test', 'https://arxiv.org/abs/2610.12345#untrusted', 'https://arxiv.org/abs/2610.12345v2'].map(url => ({ ...research, url })),
      { ...research, sourceId: 'techcrunch', kind: 'reporting', url: 'https://techcrunch.com/2026/10/25/a-story/' },
      { ...cisa, url: `${cisa.url}&search_api_fulltext=CVE-2026-99999` },
      { ...cisa, title: 'CVE-2026-99999: A different vulnerability' },
      { ...federal, url: 'https://www.federalregister.gov/documents/../../api/private' },
    ];
    for (const article of variants) {
      expect(supportsBrief(article)).toBe(false);
      expect((await fetchBriefEvidence(article, fetcher)).status).toBe('unsupported');
    }
    expect(fetcher).not.toHaveBeenCalled();
  });

  test('matches Federal Register document numbers and canonical source URLs, retaining proposal status', async () => {
    const item = { document_number: '2026-12345', html_url: federal.url, title: 'Connected systems', abstract, type: 'Proposed Rule', publication_date: '2026-10-25', effective_on: null, citation: '91 FR 12345' };
    const fetcher = fetchJson(item);
    const result = await fetchBriefEvidence(federal, fetcher);
    expect(result.status).toBe('available');
    if (result.status !== 'available') throw new Error('Expected primary evidence');
    expect(result.evidence.facts).toContainEqual({ label: 'Document type', value: 'Proposed Rule' });
    expect(result.evidence.facts.some(fact => fact.label === 'Effective date recorded')).toBe(false);
    expect(result.evidence.caveats.join(' ')).toContain('not an enacted requirement');
    expect(result.evidence.retrievalUrl).toBe('https://www.federalregister.gov/api/v1/documents/2026-12345.json');
    expect(fetcher.mock.calls[0][0]).toBe('https://www.federalregister.gov/api/v1/documents/2026-12345.json');
    expect((await fetchBriefEvidence(federal, fetchJson({ ...item, document_number: '2026-99999' }))).status).toBe('unavailable');
    expect((await fetchBriefEvidence(federal, fetchJson({ ...item, html_url: 'https://evil.test/record' }))).status).toBe('unavailable');
    const future = await fetchBriefEvidence(federal, fetchJson({ ...item, effective_on: '2099-02-28' }));
    if (future.status !== 'available') throw new Error('Expected future effective date');
    expect(future.evidence.facts).toContainEqual({ label: 'Effective date recorded', value: '2099-02-28' });
    const invalid = await fetchBriefEvidence(federal, fetchJson({ ...item, effective_on: '2099-02-30' }));
    if (invalid.status !== 'available') throw new Error('Expected primary record');
    expect(invalid.evidence.facts.some(fact => fact.label === 'Effective date recorded')).toBe(false);
  });

  test('matches one exact CVE, coalesces catalog reads, and labels federal due dates narrowly', async () => {
    const record = { cveID: 'CVE-2026-12345', vendorProject: 'Example vendor', product: 'Example product', vulnerabilityName: 'Example product vulnerability', shortDescription: 'Example product contains a vulnerability that permits unauthorized access to configured records.', dateAdded: '2026-10-25', dueDate: '2099-01-31', requiredAction: 'Apply mitigations according to vendor instructions.', knownRansomwareCampaignUse: 'Unknown' };
    const fetcher = jest.fn().mockImplementation(async () => new Response(JSON.stringify({ catalogVersion: '2026.10.25', vulnerabilities: [record] })));
    const [first, second] = await Promise.all([fetchBriefEvidence(cisa, fetcher), fetchBriefEvidence(cisa, fetcher)]);
    expect(first.status).toBe('available');
    expect(second).toEqual(first);
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(fetcher.mock.calls[0][0]).toBe('https://raw.githubusercontent.com/cisagov/kev-data/develop/known_exploited_vulnerabilities.json');
    if (first.status !== 'available') throw new Error('Expected catalog evidence');
    expect(first.evidence.retrievalUrl).toBe('https://raw.githubusercontent.com/cisagov/kev-data/develop/known_exploited_vulnerabilities.json');
    expect(first.evidence.facts).toContainEqual({ label: 'Federal agency due date', value: '2099-01-31' });
    expect(first.evidence.caveats.join(' ')).toContain('not universally');
    expect(first.evidence.caveats.join(' ')).toContain('Unknown ransomware campaign use does not mean no');
    expect((await fetchBriefEvidence(cisa, fetchJson({ vulnerabilities: [{ ...record, cveID: 'CVE-2026-99999' }] }))).status).toBe('unavailable');
    expect((await fetchBriefEvidence(cisa, fetchJson({ vulnerabilities: [record, record] }))).status).toBe('unavailable');
  });

  test('uses only an exact FDA agency feed description and preserves the limited scope', async () => {
    const fetcher = jest.fn().mockResolvedValue(new Response(agencyFeed(abstract, fda.url.replace('https:', 'http:'))));
    const result = await fetchBriefEvidence(fda, fetcher);
    expect(result.status).toBe('available');
    if (result.status !== 'available') throw new Error('Expected agency evidence');
    expect(result.evidence.abstract).toBe(abstract);
    expect(result.evidence.retrievalUrl).toBe('https://www.fda.gov/about-fda/contact-fda/stay-informed/rss-feeds/press-releases/rss.xml');
    expect(result.evidence.scope).toContain('full release and supporting studies were not reviewed');
    expect(fetcher.mock.calls[0][0]).not.toBe(fda.url);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  test('declines mismatched, insufficient, third-party-marked, or entity-bearing FDA content', async () => {
    for (const body of [agencyFeed(abstract, `${fda.url}-different`), agencyFeed('Short headline only'), `<!DOCTYPE rss [<!ENTITY x SYSTEM "file:///etc/passwd">]>${agencyFeed()}`, agencyFeed().replace(fda.title, 'A different title')]) {
      const fetcher = jest.fn().mockResolvedValue(new Response(body));
      expect((await fetchBriefEvidence(fda, fetcher)).status).toBe('unavailable');
    }
    for (const body of [agencyFeed(`${abstract} Copyright Example Organization. All rights reserved.`), agencyFeed(`${abstract} &#169; Example Organization.`), agencyFeed().replace('</item>', '<dc:creator>Example Organization</dc:creator></item>')]) {
      const result = await fetchBriefEvidence(fda, jest.fn().mockResolvedValue(new Response(body)));
      expect(result.status).toBe('unsupported');
    }
  });

  test('strips source HTML/script content rather than exposing HTML or executing it', async () => {
    const data = datacite();
    data.data.attributes.descriptions[0].description = `<script>untrusted()</script><b>${abstract}</b>`;
    const result = await fetchBriefEvidence(research, fetchJson(data));
    expect(result.status).toBe('available');
    if (result.status !== 'available') throw new Error('Expected sanitized evidence');
    expect(result.evidence.abstract).toBe(abstract);
    expect(JSON.stringify(result.evidence)).not.toMatch(/<script|<b>|untrusted\(\)/);
    const invalid = await fetchBriefEvidence(research, jest.fn().mockResolvedValue(new Response('<html>Not JSON</html>')));
    expect(invalid.status).toBe('unavailable');
  });

  test.each([
    ['literal spaced', 'The error remains < 0.05 while accuracy is > 95%. We report limits and make no claim of universal performance.', 'The error remains < 0.05 while accuracy is > 95%. We report limits and make no claim of universal performance.'],
    ['literal unspaced', 'The error remains <0.05 while accuracy is >95%. We report limits and make no claim of universal performance.', 'The error remains <0.05 while accuracy is >95%. We report limits and make no claim of universal performance.'],
    ['named entities', 'The error remains &lt; 0.05 while accuracy is &gt; 95%. We report limits and make no claim of universal performance.', 'The error remains < 0.05 while accuracy is > 95%. We report limits and make no claim of universal performance.'],
    ['decimal entities', 'The error remains &#60; 0.05 while accuracy is &#62; 95%. We report limits and make no claim of universal performance.', 'The error remains < 0.05 while accuracy is > 95%. We report limits and make no claim of universal performance.'],
    ['hex entities', 'The error remains &#x3c; 0.05 while accuracy is &#x3e; 95%. We report limits and make no claim of universal performance.', 'The error remains < 0.05 while accuracy is > 95%. We report limits and make no claim of universal performance.'],
  ])('preserves scientific comparisons from %s while removing real markup', async (_kind, input, expected) => {
    const data = datacite();
    data.data.attributes.descriptions[0].description = `<p><strong>${input}</strong></p><script>untrusted()</script><style>p { display:none }</style>`;
    const result = await fetchBriefEvidence(research, fetchJson(data));
    if (result.status !== 'available') throw new Error('Expected comparison evidence');
    expect(result.evidence.abstract).toBe(expected);
    expect(result.evidence.abstract).not.toMatch(/<p>|<strong>|<script>|<style>|untrusted|display:none/);
  });

  test('bounds both declared and streamed bytes and does not expose raw failures', async () => {
    const tooBig = jest.fn().mockResolvedValue(new Response('small actual body', { headers: { 'content-length': String(5 * 1024 * 1024) } }));
    expect((await fetchBriefEvidence(research, tooBig)).status).toBe('unavailable');
    const streamed = jest.fn().mockResolvedValue(new Response('x'.repeat(4 * 1024 * 1024 + 1)));
    expect((await fetchBriefEvidence(research, streamed)).status).toBe('unavailable');
    const result = await fetchBriefEvidence(research, jest.fn().mockRejectedValue(new Error('private connection detail')));
    expect(result.status).toBe('unavailable');
    expect(JSON.stringify(result)).not.toContain('private connection detail');
  });

  test('hashes substantive evidence consistently and changes the hash when evidence changes', async () => {
    const first = await fetchBriefEvidence(research, fetchJson(datacite()));
    const repeat = await fetchBriefEvidence(research, fetchJson(datacite()));
    const data = datacite();
    data.data.attributes.descriptions[0].description = `${abstract} An additional qualification is recorded.`;
    const changed = await fetchBriefEvidence(research, fetchJson(data));
    if (first.status !== 'available' || repeat.status !== 'available' || changed.status !== 'available') throw new Error('Expected primary evidence');
    expect(first.evidence.contentHash).toBe(repeat.evidence.contentHash);
    expect(first.evidence.contentHash).not.toBe(changed.evidence.contentHash);
  });
});
