import sitemap from '@/app/sitemap';
import { CANONICAL_SITE_URL } from '@/app/config/site';
import { growthMetadata } from '@/app/lib/growth-content';
import { generateMetadata as generateLandingMetadata } from '@/app/landing/[slug]/page';
import { GET as getLlms } from '@/app/llms.txt/route';
import { GET as getLlmsFull } from '@/app/llms-full.txt/route';
import { metadata as servicesMetadata } from '@/app/services/page';
import { insights } from '@/app/lib/insights-content';

const retiredOrNonIndexablePaths = [
  '/services/automation',
  '/services/integration',
  '/services/ai-audit',
  '/services/ai-development-integrations',
  '/services/llm-agent-integrations',
  '/services/marketing-automation',
  '/services/development-automation',
  '/services/website-app-development',
  '/services/stability',
  '/services/growth-systems',
  '/docs/brand-guide',
  '/helpr',
  '/ontask',
  '/landing/ofroot-demo',
  '/landing/plumbers',
  '/landing/hvac',
  '/landing/roofers',
  '/landing/cto',
];

describe('SEO indexing contract', () => {
  it('publishes only unique canonical destinations in the sitemap', () => {
    const entries = sitemap();
    const urls = entries.map((entry) => entry.url);

    expect(new Set(urls).size).toBe(urls.length);
    for (const path of retiredOrNonIndexablePaths) {
      expect(urls).not.toContain(`${CANONICAL_SITE_URL}${path}`);
    }
  });

  it('publishes the AI-agent-readiness insight exactly once', () => {
    const target = `${CANONICAL_SITE_URL}/insights/is-your-business-ai-agent-ready`;
    const matches = sitemap().filter((entry) => entry.url === target);

    expect(matches).toHaveLength(1);
    expect(String(matches[0].lastModified)).toBe('2026-09-08');
  });

  it('publishes the complete insight cluster with unique slugs', () => {
    const slugs = insights.map((insight) => insight.slug);
    const sitemapUrls = new Set(sitemap().map((entry) => entry.url));
    const newGuides = [
      'ai-discoverability-audit-checklist',
      'how-to-get-mentioned-in-ai-answers',
      'private-ai-assistant-security-requirements',
      'workflow-automation-roi-guide',
      'hubspot-ai-agent-integration-guide',
    ];

    expect(new Set(slugs).size).toBe(slugs.length);
    expect(insights).toHaveLength(9);
    for (const slug of newGuides) {
      expect(sitemapUrls.has(`${CANONICAL_SITE_URL}/insights/${slug}`)).toBe(true);
    }
  });

  it('uses intentional, stable sitemap modification dates', () => {
    const entries = sitemap();
    const dates = entries.map((entry) => String(entry.lastModified));

    expect(dates.every(Boolean)).toBe(true);
    expect(new Set(dates).size).toBeGreaterThan(1);
  });

  it('includes the shared social image in generated page metadata', () => {
    const metadata = growthMetadata('Example', 'Example description', '/example');

    expect(metadata.openGraph).toMatchObject({
      url: `${CANONICAL_SITE_URL}/example`,
      images: [expect.objectContaining({ url: `${CANONICAL_SITE_URL}/og.jpg` })],
    });
    expect(metadata.twitter).toMatchObject({
      images: [`${CANONICAL_SITE_URL}/og.jpg`],
    });
  });

  it('keeps the services index self-canonical', () => {
    expect(servicesMetadata.alternates).toMatchObject({ canonical: '/services' });
    expect(servicesMetadata.openGraph).toMatchObject({
      url: `${CANONICAL_SITE_URL}/services`,
    });
  });

  it('keeps campaign landing pages usable but out of the organic index', async () => {
    const metadata = await generateLandingMetadata({
      params: Promise.resolve({ slug: 'hvac' }),
    });

    expect(metadata.alternates).toMatchObject({ canonical: '/landing/hvac' });
    expect(metadata.robots).toMatchObject({ index: false, follow: true });
  });

  it('publishes the canonical agent service and readiness guide for LLM discovery', async () => {
    const [summary, full] = await Promise.all([
      getLlms().text(),
      getLlmsFull().text(),
    ]);

    for (const output of [summary, full]) {
      expect(output).toContain(`${CANONICAL_SITE_URL}/agent-integrations`);
      expect(output).toContain(`${CANONICAL_SITE_URL}/insights/is-your-business-ai-agent-ready`);
      expect(output).not.toContain(`${CANONICAL_SITE_URL}/services/llm-agent-integrations`);
      for (const insight of insights) {
        expect(output).toContain(`${CANONICAL_SITE_URL}/insights/${insight.slug}`);
      }
    }
  });
});
