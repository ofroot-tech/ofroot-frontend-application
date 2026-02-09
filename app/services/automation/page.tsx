import ServiceHero from '../components/ServiceHero';
import ServiceProof from '../components/ServiceProof';
import ServiceFAQ from '../components/ServiceFAQ';
import { SITE } from '@/app/config/site';
import Link from 'next/link';

export const metadata = {
  title: 'Workflow Automation | OfRoot',
  description: 'Workflow automation for lead capture, routing, follow-up, and booking so teams convert demand into meetings.',
};

export default function AutomationPage() {
  return (
    <div>
      {/* FAQ + Service JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE.url}/` },
              { '@type': 'ListItem', position: 2, name: 'Services', item: `${SITE.url}/services` },
              { '@type': 'ListItem', position: 3, name: 'Workflow Automation', item: `${SITE.url}/services/automation` },
            ],
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: 'Do you build automations in Make.com or Zapier?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Yes. We use Make.com or Zapier when it fits, and ship direct API integrations when reliability and control matter.',
                },
              },
              {
                '@type': 'Question',
                name: 'Can you automate comment and DM lead capture?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Yes. We build workflows that respond, send links, collect lead details, and sync data to your CRM.',
                },
              },
              {
                '@type': 'Question',
                name: 'Do you connect HubSpot and Meta workflows?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Yes. We connect lead events and routing rules across HubSpot and Meta so follow-up and booking are consistent.',
                },
              },
            ],
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Service',
            name: 'Workflow Automation',
            provider: { '@type': 'Organization', name: SITE.name, url: SITE.url },
            areaServed: 'US',
            url: `${SITE.url}/services/automation`,
            serviceType: [
              'Make.com automation',
              'Zapier automation',
              'HubSpot workflow automation',
              'Meta API integration',
              'Meeting booking workflows',
              'Lead routing and follow-up automation',
            ],
            description:
              'Workflow automation for lead capture, routing, follow-up, and booking using Make.com, Zapier, HubSpot, and Meta APIs.',
          }),
        }}
      />

      <ServiceHero
        title="Workflow Automation"
        subtitle="Remove manual lead and booking bottlenecks with reliable workflow automation across your systems."
        ctaHref="/consulting/book"
        ctaLabel="Book a workflow strategy call"
      />

      <section className="mt-6 reveal-in">
        <p className="text-gray-700 max-w-3xl">We automate lead routing, follow-up triggers, scheduler handoffs, and reporting tasks so revenue teams focus on conversations instead of data cleanup.</p>
      </section>

      <section className="mt-6 reveal-in">
        <div className="rounded-xl border p-6 bg-white/80 backdrop-blur shadow-sm">
          <h2 className="text-xl font-semibold mb-2">Related</h2>
          <p className="text-gray-700 text-sm max-w-3xl">
            Start with <Link href="/automations" className="underline font-semibold">Automations</Link> for an overview, then go deeper on <Link href="/services/integration" className="underline font-semibold">HubSpot + Meta integrations</Link> or the <Link href="/landing/social-comment-dm-automation" className="underline font-semibold">social comment and DM workflow</Link>.
          </p>
        </div>
      </section>

      <ServiceProof quotes={[{ quote: 'Lead response times dropped and booked meetings increased once routing and follow-up were automated.' }]} />

      <ServiceFAQ items={[{ q: 'Which tools do you automate?', a: 'We automate workflows across HubSpot, Meta APIs, scheduling tools, CRMs, and internal webhook-based systems.' }]} />
    </div>
  );
}
