// app/services/marketing-automation/page.tsx
import ServiceHero from '../components/ServiceHero';
import ServiceFAQ from '../components/ServiceFAQ';
import ServiceProof from '../components/ServiceProof';

export const metadata = {
  title: 'Marketing Automation | OfRoot',
  description: 'Capture more demand with landing pages, follow‑up automations, and measurement.',
  alternates: { canonical: '/services/marketing-automation' },
};

export default function MarketingAutomationPage() {
  return (
  <div className="reveal-in fade-only">
      <ServiceHero
        title="Marketing Automation"
        subtitle="Capture more demand with landing pages, follow‑up automations, and measurement. Less manual work, more revenue."
        ctaHref="/subscribe?product=marketing-automation"
        ctaLabel="Start $1 trial"
        analyticsServiceId="marketing-automation"
  secondaryCtaHref="https://form.jotform.com/252643426225151"
      />

  <section className="grid grid-cols-1 md:grid-cols-2 grid-gap-modern reveal-in">
        <div className="rounded-xl border p-6 bg-white/80 backdrop-blur shadow-sm">
          <h3 className="text-xl font-semibold mb-2">Outcomes</h3>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li>• Increase qualified leads</li>
            <li>• Faster follow‑ups and reviews</li>
            <li>• Clear attribution and ROI</li>
          </ul>
        </div>
        <div className="rounded-xl border p-6 bg-white/80 backdrop-blur shadow-sm">
          <h3 className="text-xl font-semibold mb-2">What’s included</h3>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li>• SEO landing pages and content</li>
            <li>• Email/SMS automations</li>
            <li>• Analytics & reporting</li>
            <li>• <span className="font-medium text-blue-700">AI safety & authentication review:</span> We audit your code and database for authentication errors and unsafe production code—especially important for AI-driven sites.</li>
          </ul>
        </div>
      </section>

      <ServiceProof
        logos={["/logos/logo-acme.svg", "/logos/logo-zen.svg"]}
        quotes={[{ quote: 'Leads increased within weeks after automation.', author: 'Owner', role: 'Local Contractor' }]}
      />

      <ServiceFAQ
        items={[
          { q: 'Can you integrate my CRM?', a: 'Yes. We support common CRMs and can build custom connectors.' },
          { q: 'How soon to see results?', a: 'Typically within 2–4 weeks as pages rank and automations engage.' },
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
                name: 'Can you integrate my CRM?',
                acceptedAnswer: { '@type': 'Answer', text: 'Yes. We support common CRMs and can build custom connectors.' },
              },
              {
                '@type': 'Question',
                name: 'How soon to see results?',
                acceptedAnswer: { '@type': 'Answer', text: 'Typically within 2–4 weeks as pages rank and automations engage.' },
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
            name: 'Marketing Automation',
            provider: { '@type': 'Organization', name: 'OfRoot' },
            areaServed: 'US',
            description:
              'Capture more demand with landing pages, follow‑up automations, and measurement.',
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
