import { CANONICAL_SITE_URL, SITE } from '@/app/config/site';
import sitemap from '@/app/sitemap';
import robots from '@/app/robots';
import { growthMetadata } from '@/app/lib/growth-content';
import {
  generateOrganizationSchema,
  generatePricingSchema,
  generateServiceSchema,
} from '@/app/lib/schemas';

describe('public canonical host contract', () => {
  it('uses the live redirect destination as the shared site URL', () => {
    expect(CANONICAL_SITE_URL).toBe('https://www.ofroot.technology');
    expect(SITE.url).toBe(CANONICAL_SITE_URL);
    expect(SITE.logo.url).toBe(`${CANONICAL_SITE_URL}/favicon.ico`);
  });

  it('publishes only www URLs in crawl discovery documents', () => {
    const entries = sitemap();
    expect(entries.length).toBeGreaterThan(0);
    expect(entries.every((entry) => entry.url.startsWith(CANONICAL_SITE_URL))).toBe(true);

    const rules = robots();
    expect(rules.host).toBe(CANONICAL_SITE_URL);
    expect(rules.sitemap).toBe(`${CANONICAL_SITE_URL}/sitemap.xml`);
  });

  it('publishes only www URLs in centralized structured data', () => {
    const schemas = [
      generateOrganizationSchema(),
      generatePricingSchema(),
      generateServiceSchema(),
    ];
    const serialized = JSON.stringify(schemas);

    expect(serialized).toContain(CANONICAL_SITE_URL);
    expect(serialized).not.toContain('https://ofroot.technology');
  });

  it('uses the shared host for generated Open Graph URLs', () => {
    const metadata = growthMetadata('Example', 'Example description', '/example');
    expect(metadata.openGraph).toMatchObject({
      url: `${CANONICAL_SITE_URL}/example`,
    });
  });
});
