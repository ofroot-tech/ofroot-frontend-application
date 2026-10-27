import { canonicalUrl, deduplicateArticles, makeArticle, parseNewsDate, plainText, rssItems } from '@/app/lib/news/normalize';
import { parseSourceBody, readSourceBody } from '@/app/lib/news/ingest';
import { NEWS_SOURCES } from '@/app/lib/news/sources';

const now = Date.parse('2026-10-27T12:00:00Z');
const fda = NEWS_SOURCES.find(source => source.id === 'fda')!;
const cisa = NEWS_SOURCES.find(source => source.id === 'cisa')!;

describe('news discovery metadata safety', () => {
  test('requires an approved source and an exact HTTPS publisher host', () => {
    const input = { title: 'A headline', url: 'https://www.fda.gov/news/a', date: '2026-10-26', category: 'healthcare' as const, kind: 'release' as const };
    expect(makeArticle(input, { ...fda, rights: { ...fda.rights, status: 'pending' } }, ['www.fda.gov'], now)).toBeNull();
    for (const url of ['javascript:alert(1)', 'http://www.fda.gov/news/a', 'https://www.fda.gov.evil.test/news/a', 'https://user:password@www.fda.gov/news/a', 'https://127.0.0.1/news/a']) {
      expect(makeArticle({ ...input, url }, fda, ['www.fda.gov'], now)).toBeNull();
    }
    expect(makeArticle(input, fda, ['www.fda.gov'], now)?.url).toBe(input.url);
  });

  test('removes tracking without collapsing distinct CVE catalog searches', () => {
    expect(canonicalUrl('https://www.cisa.gov/catalog?utm_source=email&search=CVE-2026-1000#top', ['www.cisa.gov'])).toBe('https://www.cisa.gov/catalog?search=CVE-2026-1000');
    const first = makeArticle({ title: 'First CVE', url: 'https://www.cisa.gov/catalog?search=A', date: '2026-10-25', category: 'cybersecurity', kind: 'advisory' }, cisa, ['www.cisa.gov'], now)!;
    const second = makeArticle({ title: 'Second CVE', url: 'https://www.cisa.gov/catalog?search=B', date: '2026-10-26', category: 'cybersecurity', kind: 'advisory' }, cisa, ['www.cisa.gov'], now)!;
    expect(deduplicateArticles([first, second, { ...first, title: 'Updated headline' }])).toHaveLength(2);
    expect(deduplicateArticles([first, { ...first, title: 'Corrected headline' }])[0].title).toBe('Corrected headline');
    expect(deduplicateArticles([first, second])[0].id).toBe(second.id);
  });

  test('rejects future publication dates and does not invent missing dates', () => {
    expect(parseNewsDate('2026-10-27', now)).toBe('2026-10-27');
    expect(parseNewsDate('2027-01-01', now)).toBeNull();
    expect(parseNewsDate('2026', now)).toBeNull();
    expect(parseNewsDate('not a date', now)).toBeNull();
    expect(makeArticle({ title: 'Future', url: 'https://www.fda.gov/news/future', date: '2027-01-01', category: 'healthcare', kind: 'release' }, fda, ['www.fda.gov'], now)).toBeNull();
  });

  test('reads only FDA discovery fields, upgrades official HTTP links and drops article bodies', () => {
    const body = '<rss><channel><item><title><![CDATA[New &amp; useful <b>program</b>]]></title><link>http://www.fda.gov/news/program</link><pubDate>Mon, 26 Oct 2026 12:00:00 EDT</pubDate><description>Unlicensed article body</description><content:encoded>Full text</content:encoded></item></channel></rss>';
    const articles = parseSourceBody(fda, body, now);
    expect(articles).toHaveLength(1);
    expect(articles[0]).toMatchObject({ title: 'New & useful program', url: 'https://www.fda.gov/news/program', kind: 'release', publishedAt: '2026-10-26T16:00:00.000Z' });
    expect(JSON.stringify(articles)).not.toMatch(/Unlicensed|Full text|description|content:encoded/);
    expect(() => rssItems('<!DOCTYPE rss [<!ENTITY x SYSTEM "file:///etc/passwd">]><rss></rss>')).toThrow('Unsupported XML');
    expect(plainText('<script>alert(1)</script><b>Safe</b> &#x110000;')).toBe('Safe');
  });

  test('bounds remote content and rejects unapproved sources before fetching', async () => {
    const fetcher = jest.fn().mockResolvedValue(new Response('too large', { headers: { 'content-length': String(5 * 1024 * 1024) } }));
    await expect(readSourceBody(fda, fetcher)).rejects.toThrow('size limit');
    expect(fetcher.mock.calls[0][1]).toMatchObject({ redirect: 'error', cache: 'no-store' });
    fetcher.mockClear();
    await expect(readSourceBody({ ...fda, enabled: false }, fetcher)).rejects.toThrow('not approved');
    expect(fetcher).not.toHaveBeenCalled();
  });

  test('keeps research labels and original submitted dates from DataCite', () => {
    const source = NEWS_SOURCES.find(item => item.id === 'arxiv-integrations')!;
    const data = JSON.stringify({ data: [{ attributes: { titles: [{ title: 'Model Context Protocol interoperability' }], url: 'https://arxiv.org/abs/2610.12345', dates: [{ dateType: 'Submitted', date: '2026-10-24T10:00:00Z' }, { dateType: 'Updated', date: '2026-10-26T10:00:00Z' }], descriptions: [{ description: 'Do not store abstracts' }] } }] });
    expect(parseSourceBody(source, data, now)[0]).toMatchObject({ kind: 'research', category: 'integrations', publishedAt: '2026-10-24T10:00:00.000Z' });
    expect(JSON.stringify(parseSourceBody(source, data, now))).not.toContain('Do not store');
  });

  test('TechCrunch retains complete feed headlines, attribution and original links while deduplicating tracking variants', () => {
    const source = NEWS_SOURCES.find(item => item.id === 'techcrunch')!;
    const title = 'A complete headline '.repeat(35).trim();
    const body = (tracking: string) => `<rss><channel><item><title><![CDATA[${title}]]></title><link>https://techcrunch.com/2026/10/26/story/?utm_source=${tracking}</link><pubDate>Mon, 26 Oct 2026 12:00:00 GMT</pubDate><dc:creator>Reporter Name</dc:creator><description>Do not use</description></item></channel></rss>`;
    const first = parseSourceBody(source, body('first'), now)[0];
    const second = parseSourceBody(source, body('second'), now)[0];
    expect(first.title).toBe(title);
    expect(first.author).toBe('Reporter Name');
    expect(first.url).toBe('https://techcrunch.com/2026/10/26/story/?utm_source=first');
    expect(first.kind).toBe('reporting');
    expect(deduplicateArticles([first, second])).toHaveLength(1);
    expect(JSON.stringify(first)).not.toContain('Do not use');
  });

  test('routes TechCrunch security reporting and integration reporting conservatively without changing publisher fields', () => {
    const ai = NEWS_SOURCES.find(item => item.id === 'techcrunch')!;
    const healthcare = NEWS_SOURCES.find(item => item.id === 'techcrunch-healthcare')!;
    const body = (title: string, category = '') => `<rss><channel><item><title>${title}</title><link>https://techcrunch.com/2026/10/26/story/?utm_source=feed</link><pubDate>Mon, 26 Oct 2026 12:00:00 GMT</pubDate><category>${category}</category></item></channel></rss>`;
    const breach = 'Japan internet giant GMO says hackers posted stolen customer data';
    expect(parseSourceBody(ai, body(breach), now)[0]).toMatchObject({ title: breach, category: 'cybersecurity', url: 'https://techcrunch.com/2026/10/26/story/?utm_source=feed' });
    expect(parseSourceBody(ai, body('A new company announcement', 'Security'), now)[0].category).toBe('cybersecurity');
    expect(parseSourceBody(ai, body('A new MCP connector for enterprise APIs'), now)[0].category).toBe('integrations');
    expect(parseSourceBody(ai, body('AI cameras improve building security'), now)[0].category).toBe('ai');
    expect(parseSourceBody(healthcare, body('Healthcare startup builds an API for clinicians'), now)[0].category).toBe('healthcare');
  });

  test('excludes unrelated Federal Register full-text matches and accepts a healthy empty filtered response', () => {
    const source = NEWS_SOURCES.find(item => item.id === 'federal-register')!;
    const make = (title: string, id: number) => ({ title, type: 'Notice', publication_date: '2026-10-26', html_url: `https://www.federalregister.gov/documents/2026/10/26/${id}/notice` });
    const unrelated = make('Critical Material List; Addition of Helium', 1);
    expect(parseSourceBody(source, JSON.stringify({ results: [unrelated] }), now)).toEqual([]);
    const relevant = make('Artificial Intelligence and Data Privacy Standards', 2);
    expect(parseSourceBody(source, JSON.stringify({ results: [unrelated, relevant] }), now)).toHaveLength(1);
    expect(parseSourceBody(source, JSON.stringify({ results: [relevant] }), now)[0].title).toBe('Notice: Artificial Intelligence and Data Privacy Standards');
  });
});
