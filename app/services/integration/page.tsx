import ServiceHero from '../components/ServiceHero';
import ServiceProof from '../components/ServiceProof';
import ServiceFAQ from '../components/ServiceFAQ';
import { SITE } from '@/app/config/site';
import Link from 'next/link';

export const metadata = {
  title: 'HubSpot + Meta API Integrations | OfRoot',
  description: 'Connect HubSpot and Meta APIs to deliver reliable lead sync, attribution, and meeting-booking workflows.',
};

export default function IntegrationPage() {
  return (
    <div>
      {/* Breadcrumb JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE.url}/` },
              { '@type': 'ListItem', position: 2, name: 'Services', item: `${SITE.url}/services` },
              { '@type': 'ListItem', position: 3, name: 'Integrations', item: `${SITE.url}/services/integration` },
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
            name: 'HubSpot + Meta API Integrations',
            provider: { '@type': 'Organization', name: SITE.name, url: SITE.url },
            areaServed: 'US',
            url: `${SITE.url}/services/integration`,
            serviceType: [
              'HubSpot integration',
              'HubSpot lead routing workflows',
              'Meta API integration',
              'Meta Conversions API (CAPI)',
              'Webhook validation and retries',
              'Lead sync monitoring',
            ],
            description:
              'Connect HubSpot and Meta APIs to deliver reliable lead sync, attribution, and meeting-booking workflows.',
          }),
        }}
      />

      <ServiceHero
        title="HubSpot + Meta API Integrations"
        subtitle="Connect HubSpot and Meta APIs with reliable lead sync, workflow automation, and booking-focused handoffs."
        ctaHref="/consulting/book"
        ctaLabel="Book an integration strategy call"
      />

      <section className="mt-6 reveal-in">
        <p className="text-gray-700 max-w-3xl">We map field-level requirements, implement API sync logic, and harden data flows with retries and monitoring so lead and meeting pipelines stay accurate.</p>
      </section>

      <section className="mt-6 reveal-in">
        <div className="rounded-xl border p-6 bg-white/80 backdrop-blur shadow-sm">
          <h2 className="text-xl font-semibold mb-2">Where this fits</h2>
          <p className="text-gray-700 text-sm max-w-3xl">
            If you need a broad automation plan first, start at <Link href="/automations" className="underline font-semibold">Automations</Link>. If your focus is HubSpot routing and follow-ups, see <Link href="/services/marketing-automation" className="underline font-semibold">HubSpot Marketing Integrations</Link>.
          </p>
        </div>
      </section>

      <ServiceProof quotes={[{ quote: 'Meta leads now arrive cleanly in HubSpot with owners assigned and meeting follow-up triggered automatically.' }]} />

      <ServiceFAQ items={[{ q: 'Do you handle third-party auth and data sync?', a: 'Yes. We handle OAuth, API credentials, webhook validation, and resilient syncing strategies for production workflows.' }]} />
    </div>
  );
}
