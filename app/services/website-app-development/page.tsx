// app/services/website-app-development/page.tsx
import ServiceHero from '../components/ServiceHero';
import ServiceFAQ from '../components/ServiceFAQ';
import ServiceProof from '../components/ServiceProof';

export const metadata = {
  title: 'Integration-Ready Website & App Development | OfRoot',
  description: 'Full-stack website and app development focused on HubSpot and Meta API connectivity, lead flows, and booking workflows.',
  alternates: { canonical: '/services/website-app-development' },
};

export default function WebsiteAppDevelopmentPage() {
  return (
    <div className="snap-page" style={{ ['--chevron-bottom-offset' as any]: '14px', ['--chevron-top-offset' as any]: '14px', ['--chevron-glow-opacity' as any]: 0.9 }}>
      <section data-snap-section className="section-full snap-fade">
        <ServiceHero
        title="Integration-Ready Website & App Development"
        subtitle="Full-stack product engineering for lead workflows: build sites and apps that connect cleanly to HubSpot, Meta APIs, and scheduling systems."
        ctaHref="/consulting/book"
        ctaLabel="Book an integration build call"
        analyticsServiceId="website-app-development"
  secondaryCtaHref="https://form.jotform.com/252643426225151"
        />
      </section>
      <section data-snap-section className="section-full snap-fade grid grid-cols-1 md:grid-cols-2 grid-gap-modern py-12 px-6">
        <div className="rounded-xl border p-6 bg-white/80 backdrop-blur shadow-sm">
          <h3 className="text-xl font-semibold mb-2">Outcomes</h3>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li>• Reliable lead capture and form processing</li>
            <li>• Better sync quality across CRM and ad platforms</li>
            <li>• Faster path from inquiry to booked meeting</li>
          </ul>
        </div>
        <div className="rounded-xl border p-6 bg-white/80 backdrop-blur shadow-sm">
          <h3 className="text-xl font-semibold mb-2">What’s included</h3>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li>• Frontend and backend engineering</li>
            <li>• HubSpot and Meta API integration layers</li>
            <li>• Workflow observability and sync monitoring</li>
            <li>• <span className="font-medium text-blue-700">AI safety & authentication review:</span> We audit your code and database for authentication errors and unsafe production code—especially important for AI-driven sites.</li>
          </ul>
        </div>
      </section>
      <section data-snap-section className="section-full snap-fade py-12 px-6">
        <ServiceProof
        logos={["/logos/logo-acme.svg", "/logos/logo-zen.svg"]}
        quotes={[{ quote: 'They shipped our lead workflows fast and stabilized HubSpot sync in production.', author: 'Revenue Ops Lead', role: 'B2B SaaS' }]}
        />
      </section>
      <section data-snap-section className="section-full snap-fade py-12 px-6">
        <ServiceFAQ
        items={[
          { q: 'Can you build around our existing CRM workflows?', a: 'Yes. We design app and backend architecture around current HubSpot workflows and improve where needed.' },
          { q: 'Do you implement Meta API and conversion event flows?', a: 'Yes. We implement event ingestion and mapping patterns that keep attribution and downstream automation accurate.' },
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
                name: 'Can you build around our existing CRM workflows?',
                acceptedAnswer: { '@type': 'Answer', text: 'Yes. We design app and backend architecture around current HubSpot workflows and improve where needed.' },
              },
              {
                '@type': 'Question',
                name: 'Do you implement Meta API and conversion event flows?',
                acceptedAnswer: { '@type': 'Answer', text: 'Yes. We implement event ingestion and mapping patterns that keep attribution and downstream automation accurate.' },
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
            name: 'Integration-Ready Website & App Development',
            provider: { '@type': 'Organization', name: 'OfRoot' },
            areaServed: 'US',
            description:
              'Full-stack website and app development focused on HubSpot and Meta API connectivity, lead flows, and booking workflows.',
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
