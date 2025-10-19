// app/services/website-app-development/page.tsx
import ServiceHero from '../components/ServiceHero';
import ServiceFAQ from '../components/ServiceFAQ';
import ServiceProof from '../components/ServiceProof';

export const metadata = {
  title: 'Website & App Development | OfRoot',
  description: 'Full‑stack web and mobile development — prototypes, SaaS platforms, migrations, and performance‑driven engineering.',
  alternates: { canonical: '/services/website-app-development' },
};

export default function WebsiteAppDevelopmentPage() {
  return (
  <div className="reveal-in fade-only">
      <ServiceHero
        title="Website & App Development"
        subtitle="Full‑stack product engineering for speed: MVPs, SaaS, mobile, and migrations — with observability and performance baked in."
        ctaHref="/subscribe?product=website-app-development"
        ctaLabel="Start $1 trial"
        analyticsServiceId="website-app-development"
  secondaryCtaHref="https://form.jotform.com/252643426225151"
      />

  <section className="grid grid-cols-1 md:grid-cols-2 grid-gap-modern reveal-in">
        <div className="rounded-xl border p-6 bg-white/80 backdrop-blur shadow-sm">
          <h3 className="text-xl font-semibold mb-2">Outcomes</h3>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li>• Ship faster with sprint‑driven cadence</li>
            <li>• Performance and reliability improvements</li>
            <li>• Clean admin, data models, and integrations</li>
          </ul>
        </div>
        <div className="rounded-xl border p-6 bg-white/80 backdrop-blur shadow-sm">
          <h3 className="text-xl font-semibold mb-2">What’s included</h3>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li>• Frontend and backend engineering</li>
            <li>• CMS and content tooling</li>
            <li>• Observability and testing harnesses</li>
            <li>• <span className="font-medium text-blue-700">AI safety & authentication review:</span> We audit your code and database for authentication errors and unsafe production code—especially important for AI-driven sites.</li>
          </ul>
        </div>
      </section>

      <ServiceProof
        logos={["/logos/logo-acme.svg", "/logos/logo-zen.svg"]}
        quotes={[{ quote: 'They shipped features weekly and boosted our Core Web Vitals.', author: 'Product Lead', role: 'SaaS Startup' }]}
      />

      <ServiceFAQ
        items={[
          { q: 'Do you handle migrations?', a: 'Yes — from monoliths to modern stacks, with clear rollout plans.' },
          { q: 'Can you integrate our APIs?', a: 'Absolutely. We design integrations and ensure observability around them.' },
        ]}
      />

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
                name: 'Do you handle migrations?',
                acceptedAnswer: { '@type': 'Answer', text: 'Yes — from monoliths to modern stacks, with clear rollout plans.' },
              },
              {
                '@type': 'Question',
                name: 'Can you integrate our APIs?',
                acceptedAnswer: { '@type': 'Answer', text: 'Absolutely. We design integrations and ensure observability around them.' },
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
            name: 'Website & App Development',
            provider: { '@type': 'Organization', name: 'OfRoot' },
            areaServed: 'US',
            description:
              'Full‑stack web and mobile development — prototypes, SaaS platforms, migrations, and performance‑driven engineering.',
            offers: {
              '@type': 'Offer',
              price: '99',
              priceCurrency: 'USD',
              category: 'subscription',
            },
          }),
        }}
      />
    </div>
  );
}
