// app/services/marketing-automation/page.tsx
import ServiceHero from '../components/ServiceHero';
import ServiceFAQ from '../components/ServiceFAQ';
import ServiceProof from '../components/ServiceProof';

export const metadata = {
  title: 'HubSpot Marketing Integrations | OfRoot',
  description: 'Implement HubSpot lead routing, lifecycle workflows, and follow-up automations that increase booked meetings.',
  alternates: { canonical: '/services/marketing-automation' },
};

export default function MarketingAutomationPage() {
  return (
  <div className="reveal-in fade-only">
      <ServiceHero
        title="HubSpot Marketing Integrations"
        subtitle="Capture, route, and work leads with confidence using HubSpot workflows built for meeting conversion."
        ctaHref="/consulting/book"
        ctaLabel="Book a HubSpot integration call"
        analyticsServiceId="marketing-automation"
  secondaryCtaHref="https://form.jotform.com/252643426225151"
      />

  <section className="grid grid-cols-1 md:grid-cols-2 grid-gap-modern reveal-in">
        <div className="rounded-xl border p-6 bg-white/80 backdrop-blur shadow-sm">
          <h3 className="text-xl font-semibold mb-2">Outcomes</h3>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li>• Faster lead response and ownership</li>
            <li>• Higher qualified-meeting rate</li>
            <li>• Fewer dropped or unworked leads</li>
          </ul>
        </div>
        <div className="rounded-xl border p-6 bg-white/80 backdrop-blur shadow-sm">
          <h3 className="text-xl font-semibold mb-2">What’s included</h3>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li>• HubSpot lifecycle and assignment workflows</li>
            <li>• Lead source normalization and sync rules</li>
            <li>• Email/SMS follow-up orchestration</li>
            <li>• Meeting-booking pipeline instrumentation</li>
            <li>• <span className="font-medium text-blue-700">AI safety & authentication review:</span> We audit your code and database for authentication errors and unsafe production code—especially important for AI-driven sites.</li>
          </ul>
        </div>
      </section>

      <ServiceProof
        logos={["/logos/logo-acme.svg", "/logos/logo-zen.svg"]}
        quotes={[{ quote: 'Lead handoff became predictable and we booked more meetings from the same spend.', author: 'Revenue Lead', role: 'Growth Team' }]}
      />

      <ServiceFAQ
        items={[
          { q: 'Can you work inside our existing HubSpot setup?', a: 'Yes. We audit current pipelines and implement changes without breaking existing team workflows.' },
          { q: 'Do you also handle Meta lead and event sync?', a: 'Yes. We can connect Meta lead events into HubSpot and validate mapping, deduplication, and attribution data.' },
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
                name: 'Can you work inside our existing HubSpot setup?',
                acceptedAnswer: { '@type': 'Answer', text: 'Yes. We audit current pipelines and implement changes without breaking existing team workflows.' },
              },
              {
                '@type': 'Question',
                name: 'Do you also handle Meta lead and event sync?',
                acceptedAnswer: { '@type': 'Answer', text: 'Yes. We can connect Meta lead events into HubSpot and validate mapping, deduplication, and attribution data.' },
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
            name: 'HubSpot Marketing Integrations',
            provider: { '@type': 'Organization', name: 'OfRoot' },
            areaServed: 'US',
            description:
              'Implement HubSpot lead routing, lifecycle workflows, and follow-up automations that increase booked meetings. Works with Make.com, Zapier, and Meta integrations as needed.',
            serviceType: [
              'HubSpot integration',
              'HubSpot workflow automation',
              'Make.com automation',
              'Zapier automation',
              'Lead routing and follow-up workflows',
              'Meeting booking workflows',
              'Meta API integration',
              'Meta Conversions API (CAPI)',
            ],
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
