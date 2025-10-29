// app/services/development-automation/page.tsx
import ServiceHero from '../components/ServiceHero';
import ServiceFAQ from '../components/ServiceFAQ';
import ServiceProof from '../components/ServiceProof';

export const metadata = {
  title: 'Development Automation | OfRoot',
  description: 'Ship features faster with pipelines, scaffolds, and integrations. Reduce regressions and increase velocity.',
  alternates: { canonical: '/services/development-automation' },
};

export default function DevelopmentAutomationPage() {
  return (
    <div className="snap-page" style={{ ['--chevron-bottom-offset' as any]: '14px', ['--chevron-top-offset' as any]: '14px', ['--chevron-glow-opacity' as any]: 0.9 }}>
      <section data-snap-section className="section-full snap-fade">
        <ServiceHero
        title="Development Automation"
        subtitle="Ship features faster with pipelines, scaffolds, and repeatable integrations. Reduce regressions, increase velocity."
        ctaHref="/subscribe?product=development-automation"
        ctaLabel="Start $1 trial"
  analyticsServiceId="development-automation"
  secondaryCtaHref="https://form.jotform.com/252643426225151"
        />
      </section>

      <section data-snap-section className="section-full snap-fade grid grid-cols-1 md:grid-cols-2 gap-6 py-12 px-6">
        <div className="rounded-xl border p-6 bg-white/80 backdrop-blur shadow-sm">
          <h3 className="text-xl font-semibold mb-2">Outcomes</h3>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li>• Cycle time down 25–40%</li>
            <li>• Less toil: codegen + pipelines</li>
            <li>• Higher reliability with checks</li>
          </ul>
        </div>
        <div className="rounded-xl border p-6 bg-white/80 backdrop-blur shadow-sm">
          <h3 className="text-xl font-semibold mb-2">What’s included</h3>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li>• CI/CD pipelines, previews</li>
            <li>• Auth, RBAC, observability</li>
            <li>• API + frontend scaffolds</li>
          </ul>
        </div>
      </section>
      <section data-snap-section className="section-full snap-fade py-12 px-6">
        <ServiceProof
        logos={["/logos/logo-acme.svg", "/logos/logo-zen.svg"]}
        quotes={[{ quote: 'We shipped our MVP 2x faster with OfRoot.', author: 'Founder', role: 'Home Services SaaS' }]}
        />
      </section>
      <section data-snap-section className="section-full snap-fade py-12 px-6">
        <ServiceFAQ
        items={[
          { q: 'Is this a fit for my stack?', a: 'We specialize in Laravel + Next.js, but adapt where it makes sense.' },
          { q: 'How fast can we start?', a: 'Within a week. We begin with a 30-minute alignment call and a sprint plan.' },
        ]}
        />
      </section>
      {/* FAQ JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: 'Is this a fit for my stack?',
                acceptedAnswer: { '@type': 'Answer', text: 'We specialize in Laravel + Next.js, but adapt where it makes sense.' },
              },
              {
                '@type': 'Question',
                name: 'How fast can we start?',
                acceptedAnswer: { '@type': 'Answer', text: 'Within a week. We begin with a 30-minute alignment call and a sprint plan.' },
              },
            ],
          }),
        }}
      />

      {/* Service JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Service',
            name: 'Development Automation',
            provider: { '@type': 'Organization', name: 'OfRoot' },
            areaServed: 'US',
            description:
              'Ship features faster with pipelines, scaffolds, and integrations. Reduce regressions and increase velocity.',
            offers: {
              '@type': 'Offer',
              price: '49',
              priceCurrency: 'USD',
              category: 'subscription',
            },
          }),
        }}
      />
    </div>
  );
}
