import { readFileSync } from 'node:fs';
import { caseStudies, getCaseStudy } from '@/app/lib/proof-content';
import { serviceOffers } from '@/app/lib/service-offers';
import { growthPages } from '@/app/lib/growth-content';
import sitemap from '@/app/sitemap';

const read = (path: string) => readFileSync(path, 'utf8');

describe('public website offer and evidence contract', () => {
  it('presents exactly three primary offers using existing service URLs', () => {
    expect(serviceOffers.map(offer => offer.id)).toEqual(['marketing', 'operations', 'ai']);
    expect(serviceOffers.map(offer => offer.href)).toEqual([
      '/services/ai-discoverability', '/services/automation-systems', '/services/private-company-ai',
    ]);
    expect(serviceOffers[0].includes.join(' ')).toMatch(/answer engine optimization/);
    expect(serviceOffers[0].includes.join(' ')).toMatch(/Ad campaign/);
  });

  it('labels all five public examples as capabilities, without outcome metrics', () => {
    expect(caseStudies).toHaveLength(5);
    for (const example of caseStudies) {
      expect(example.evidenceLabel).toBe('Capability example');
      expect(example.outcomes).toHaveLength(3);
      expect(example.delivered).toHaveLength(3);
      expect(JSON.stringify(example)).not.toMatch(/\d+\s*(?:%|days)|OfRoot delivered|OfRoot replaced|healthcare operations team/);
      expect(read(`app/case-studies/${example.slug}/page.tsx`)).toContain('Capability Example');
    }
  });

  it('includes every capability example in the public sitemap', () => {
    const urls = sitemap().map(entry => entry.url);
    for (const example of caseStudies) {
      expect(urls.some(url => url.endsWith(`/case-studies/${example.slug}`))).toBe(true);
    }
  });

  it('preserves the existing case-study URLs without presenting them as client cases', () => {
    for (const slug of ['home-services-mvp', 'crm-erp-sync', 'healthcare-ai-automation']) {
      expect(getCaseStudy(slug)?.evidenceLabel).toBe('Capability example');
    }
    const template = read('components/growth/CaseStudyPage.tsx');
    expect(template).toContain('This is not a client case study');
    expect(template).toContain("'@type': 'WebPage'");
    expect(template).not.toContain('Observed outcome');
  });

  it('keeps the booking form to four required answers and a same-origin endpoint', () => {
    const form = read('components/growth/GrowthAuditForm.tsx');
    expect(form.match(/\brequired(?=[\s>])/g)).toHaveLength(4);
    expect(form).toContain("fetch('/api/sales-inquiry'");
    expect(form).toContain('businessName');
    expect(form).toContain('desiredOutcome');
  });

  it('keeps the legacy booking journey on the shared inquiry route with attribution', () => {
    const redirect = read('app/consulting/book/page.tsx');
    expect(redirect).toContain('Object.entries(incoming)');
    expect(redirect).toContain("query.append(key, item)");
    expect(redirect).toContain("if (!query.has('source'))");
    expect(redirect).toContain('redirect(`/book?${query.toString()}`)');
    expect(read('app/book/page.tsx')).not.toContain('href="/consulting/book"');
  });

  it('retains home-services entry and states founder experience accurately', () => {
    expect(read('app/page.tsx')).toContain('/solutions/home-services-automation');
    expect(growthPages.homeServicesAutomation.primaryCta.href).toContain('focus=home-services-automation');
    expect(growthPages.hvacLeadFollowUp.path).toBe('/solutions/hvac-lead-follow-up-automation');
    expect(JSON.stringify(growthPages.homeServicesAutomation)).not.toContain('launched in 30 days');
    expect(read('app/page.tsx')).toContain('11 years in technology');
    expect(read('components/consulting/HeroConsulting.tsx')).not.toContain('8+ years');
  });

  it('disables build artifact disclosure while retaining runtime monitoring integration', () => {
    const config = read('next.config.ts');
    expect(config).toContain('export default withSentryConfig(nextConfig');
    expect(config).toContain('sourcemaps: { disable: true }');
    expect(config).toContain('telemetry: false');
    expect(config).toContain("release: { name: '', create: false, finalize: false }");
    expect(read('sentry.edge.config.ts')).not.toContain('enabled: false');
    expect(config).toContain("{ source: '/services/industrial-systems', destination: '/services/automation-systems', permanent: false }");
  });

  it('makes service pages match the three offers without ranking guarantees', () => {
    expect(growthPages.aiDiscoverability.eyebrow).toBe(serviceOffers[0].title);
    expect(growthPages.automationSystems.eyebrow).toBe(serviceOffers[1].title);
    expect(growthPages.privateCompanyAi.eyebrow).toBe(serviceOffers[2].title);
    expect(JSON.stringify(growthPages.aiDiscoverability)).toContain('not guaranteed');
  });
});
