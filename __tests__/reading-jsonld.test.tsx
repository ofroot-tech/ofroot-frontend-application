import { MAIL_ASSURE_NEWS_DRAFT, SAAS_RECOVERY_GUIDE_DRAFT } from '@/app/lib/security-editorial-20261123';
import { SECURITY_EDITORIAL_NEWS, SECURITY_EDITORIAL_GUIDES } from '@/app/lib/security-editorial';
import manifest from '@/content/signal-pilot.json';
import { renderToStaticMarkup } from 'react-dom/server';
import JsonLd from '@/components/seo/JsonLd';
import SecurityArticle, { securityArticleMetadata } from '@/components/editorial/SecurityArticle';
import { SECURITY_GUIDE, SECURITY_NEWS } from '@/app/lib/application-security-content';
import { readingCollection, signalArticleSchema } from '@/app/lib/reading-schema';
import { SMS_PHISHING_NEWS, ACCOUNT_RECOVERY_GUIDE } from '@/app/lib/security-editorial-20261118';
import { OPTIMIZELY_NEWS, THIRD_PARTY_SCRIPT_GUIDE } from '@/app/lib/security-editorial-20261119';
import { CONFIGURED_COMMERCE_NEWS, BUILD_SYSTEM_RETIREMENT_GUIDE } from '@/app/lib/security-editorial-20261122';

jest.mock('@/components/editorial/Reading.module.css', () => ({}));

function renderedSchema(data: Parameters<typeof SecurityArticle>[0]['article']) {
  const html = renderToStaticMarkup(<SecurityArticle article={data} />);
  const graphs = Array.from(html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g), match => JSON.parse(match[1])).flat();
  return { html, graphs };
}

test('article schema cannot close its script tag and keeps the original text', () => {
  const data = { '@context': 'https://schema.org', headline: '</script><script>alert(1)</script>' };
  const html = renderToStaticMarkup(<JsonLd data={data} />);
  expect((html.match(/<script/g) || [])).toHaveLength(1);
  const json = html.slice(html.indexOf('>') + 1, html.lastIndexOf('</script>'));
  expect(json).not.toContain('<');
  expect(JSON.parse(json)).toEqual(data);
});

it.each([
  { article: CONFIGURED_COMMERCE_NEWS, type: 'NewsArticle', related: BUILD_SYSTEM_RETIREMENT_GUIDE },
  { article: BUILD_SYSTEM_RETIREMENT_GUIDE, type: 'BlogPosting', related: CONFIGURED_COMMERCE_NEWS },
])('publishes the $type with its actual date and companion link', ({ article, type, related }) => {
  const html = renderToStaticMarkup(<SecurityArticle article={article} related={related} />);
  const graphs = Array.from(html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g), match => JSON.parse(match[1])).flat();
  const schema = graphs.find(item => item['@type'] === type);
  expect(schema).toMatchObject({ datePublished: '2026-11-23', dateModified: '2026-11-23', headline: article.title, url: `https://www.ofroot.technology${article.href}` });
  expect(schema).not.toHaveProperty('dateCreated');
  expect(schema).not.toHaveProperty('creativeWorkStatus');
  expect(schema).not.toHaveProperty('image');
  expect(html).not.toContain('Draft for review');
  expect(html).toContain('<time dateTime="2026-11-23">November 23, 2026</time>');
  expect(html).toContain(`href="${related.href}"`);
  expect(html).toContain('href="/services/application-security"');
  expect(securityArticleMetadata(article).robots).toBeUndefined();
  expect(securityArticleMetadata(article).openGraph).toMatchObject({ publishedTime: article.publishedAt, modifiedTime: article.publishedAt });
});

it.each([
  { article: SMS_PHISHING_NEWS, type: 'NewsArticle', related: ACCOUNT_RECOVERY_GUIDE },
  { article: ACCOUNT_RECOVERY_GUIDE, type: 'BlogPosting', related: SMS_PHISHING_NEWS },
  { article: OPTIMIZELY_NEWS, type: 'NewsArticle', related: THIRD_PARTY_SCRIPT_GUIDE },
  { article: THIRD_PARTY_SCRIPT_GUIDE, type: 'BlogPosting', related: OPTIMIZELY_NEWS },
])('publishes $type with the actual date and matching related article', ({ article, type, related }) => {
  const html = renderToStaticMarkup(<SecurityArticle article={article} related={related} />);
  const graphs = Array.from(html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g), match => JSON.parse(match[1])).flat();
  const schema = graphs.find(item => item['@type'] === type);
  expect(schema).toMatchObject({ datePublished: '2026-11-19', dateModified: '2026-11-19', url: `https://www.ofroot.technology${article.href}` });
  expect(schema).not.toHaveProperty('creativeWorkStatus');
  expect(schema).not.toHaveProperty('dateCreated');
  expect(schema).not.toHaveProperty('image');
  expect(html).not.toContain('Draft for review');
  expect(html).toContain('<time dateTime="2026-11-19">November 19, 2026</time>');
  expect(html).toContain(`href="${related.href}"`);
  expect(html).toContain('href="/services/application-security"');
  expect(securityArticleMetadata(article).robots).toBeUndefined();
  expect(securityArticleMetadata(article).openGraph).toMatchObject({ publishedTime: article.publishedAt, modifiedTime: article.publishedAt });
});

it.each([
  { article: SECURITY_GUIDE, type: 'BlogPosting', parent: '/blog', section: 'Application security' },
  { article: SECURITY_NEWS, type: 'NewsArticle', parent: '/news', section: 'Cybersecurity' },
])('renders $type with the actual article identity, sources and visible breadcrumb trail', ({ article, type, parent, section }) => {
  const { html, graphs } = renderedSchema(article);
  const schema = graphs.find(item => item['@type'] === type);
  const canonical = `https://www.ofroot.technology${article.href}`;
  expect(schema).toMatchObject({
    '@id': `${canonical}#article`, headline: article.title, description: article.description,
    url: canonical, mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
    datePublished: article.publishedAt, dateModified: article.publishedAt,
    author: { '@type': 'Organization', name: 'OfRoot Technology' },
    publisher: { '@type': 'Organization', name: 'OfRoot Technology' },
    articleSection: section, inLanguage: 'en-US', isAccessibleForFree: true,
  });
  expect(schema.citation.map((source: { name: string; url: string }) => ({ label: source.name, href: source.url }))).toEqual(article.sources);
  expect(schema.image).toBeUndefined();
  expect(graphs.find(item => item['@type'] === 'BreadcrumbList').itemListElement).toEqual([
    { '@type': 'ListItem', position: 1, name: parent === '/blog' ? 'OfRoot blog' : 'Signal', item: `https://www.ofroot.technology${parent}` },
    { '@type': 'ListItem', position: 2, name: article.title, item: canonical },
  ]);
  expect(html).toContain(`href="${parent}"`);
  expect(html).toContain(`<h1>${article.title}</h1>`);
  expect(html).toContain('By OfRoot Technology');
  expect(securityArticleMetadata(article).alternates).toEqual({ canonical: article.href });
});

it('keeps publication, modification and source-check dates separate and visible', () => {
  const article = { ...SECURITY_NEWS, modifiedAt: '2026-11-18', sourcesCheckedAt: '2026-11-18' };
  const { html, graphs } = renderedSchema(article);
  expect(graphs.find(item => item['@type'] === 'NewsArticle')).toMatchObject({ datePublished: '2026-11-17', dateModified: '2026-11-18' });
  expect(html).toContain('Updated <time dateTime="2026-11-18">November 18, 2026</time>');
  expect(html).toContain('Sources checked <time dateTime="2026-11-18">November 18, 2026</time>');
});

it('classifies a future guide by its editorial kind rather than one hardcoded slug', () => {
  const { graphs } = renderedSchema({ ...SECURITY_GUIDE, href: '/blog/another-security-guide' });
  expect(graphs.find(item => item['@type'] === 'BlogPosting')?.url).toBe('https://www.ofroot.technology/blog/another-security-guide');
  expect(graphs.some(item => item['@type'] === 'NewsArticle')).toBe(false);
});

it('keeps article citations safely inside one JSON-LD script', () => {
  const { html, graphs } = renderedSchema({ ...SECURITY_NEWS, title: '</script><script>alert(1)</script>' });
  expect((html.match(/<script/g) || [])).toHaveLength(1);
  expect(graphs.find(item => item['@type'] === 'NewsArticle').headline).toBe('</script><script>alert(1)</script>');
});

it('links the news collection to the visible authored briefing and original publisher pages', () => {
  const schema = readingCollection('/news', 'Signal', [
    { title: SECURITY_NEWS.title, path: SECURITY_NEWS.href },
    { title: 'Source reference', path: 'https://www.cisa.gov/example' },
  ]);
  expect(schema.mainEntity.itemListElement.map(item => item.url)).toEqual([
    `https://www.ofroot.technology${SECURITY_NEWS.href}`, 'https://www.cisa.gov/example',
  ]);
});

it('does not turn an automated digest refresh into an invented publication date', () => {
  const schema = signalArticleSchema({ id: 'a'.repeat(20), title: 'Source digest', description: 'Source-supported text', generatedAt: '2026-11-18T15:00:00Z', sourceUrl: 'https://www.cisa.gov/example', evidenceUrl: 'https://www.cisa.gov/record', evidencePublisher: 'CISA' });
  expect(schema['@type']).toBe('Article');
  expect(schema).not.toHaveProperty('datePublished');
  expect(schema).not.toHaveProperty('dateModified');
});

it.each([
  { article: MAIL_ASSURE_NEWS_DRAFT, type: 'NewsArticle', related: SAAS_RECOVERY_GUIDE_DRAFT },
  { article: SAAS_RECOVERY_GUIDE_DRAFT, type: 'BlogPosting', related: MAIL_ASSURE_NEWS_DRAFT },
])('keeps the recovery $type draft out of published collections and dates', ({ article, type, related }) => {
  const html = renderToStaticMarkup(<SecurityArticle article={article} related={related} />);
  const graphs = Array.from(html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g), match => JSON.parse(match[1])).flat();
  const schema = graphs.find(item => item['@type'] === type);
  expect(schema).toMatchObject({ dateCreated: '2026-11-23', creativeWorkStatus: 'Draft', headline: article.title, url: `https://www.ofroot.technology${article.href}` });
  expect(schema).not.toHaveProperty('datePublished');
  expect(schema).not.toHaveProperty('dateModified');
  expect(schema).not.toHaveProperty('image');
  expect(schema.citation).toHaveLength(3);
  expect(schema.citation).toContainEqual(expect.objectContaining({ url: 'https://raw.githubusercontent.com/cisagov/kev-data/develop/known_exploited_vulnerabilities.json' }));
  expect(html).toContain('Draft for review');
  expect(html).toContain('Prepared <time dateTime="2026-11-23">November 23, 2026</time>');
  expect(html).toContain('Sources checked <time dateTime="2026-11-24">November 24, 2026</time>');
  expect(html).toContain(`href="${related.href}"`);
  expect(html).toContain('href="/services/application-security"');
  expect(securityArticleMetadata(article).robots).toEqual({ index: false, follow: false });
  expect(securityArticleMetadata(article).openGraph).not.toHaveProperty('publishedTime');
  expect([...SECURITY_EDITORIAL_NEWS, ...SECURITY_EDITORIAL_GUIDES].some(item => item.href === article.href)).toBe(false);
  expect(manifest.articles.some(item => item.sourcePath === article.href)).toBe(false);
});
