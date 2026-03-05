import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/seo/JsonLd';
import { SITE } from '@/app/config/site';
import HowWeWork from '@/components/sections/HowWeWork';

export const metadata: Metadata = {
  title: 'Make.com + Zapier Automation Services | OfRoot',
  description:
    'Make.com and Zapier automations for lead capture, routing, CRM sync, and reporting. Use the right tool and add reliability guardrails.',
  keywords: [
    'Make.com automation',
    'Make automation',
    'Zapier automation',
    'workflow automation',
    'CRM sync',
    'lead routing',
    'data sanity',
  ],
  alternates: { canonical: '/make-zapier-automation' },
};

export default function MakeZapierAutomationPage() {
  const breadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE.url}/` },
      { '@type': 'ListItem', position: 2, name: 'Make + Zapier', item: `${SITE.url}/make-zapier-automation` },
    ],
  };

  const service = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Make.com and Zapier Automations',
    provider: { '@type': 'Organization', name: SITE.name, url: SITE.url },
    areaServed: 'US',
    url: `${SITE.url}/make-zapier-automation`,
    serviceType: [
      'Make.com automation',
      'Zapier automation',
      'Webhook integrations',
      'Lead routing and follow-up workflows',
      'CRM sync and data sanity',
    ],
    description:
      'We build Make.com and Zapier automations with reliability guardrails: validation, dedupe, retries, and monitoring.',
  };

  const faqs = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Do you prefer Make.com or Zapier?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'It depends on complexity and reliability needs. We choose the tool based on failure modes, volume, and the systems involved.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do you keep automations from breaking?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'We add validation, dedupe, retries, and monitoring. When a failure happens, it is visible and recoverable.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can you connect these automations to HubSpot and Meta?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. We connect lead capture and event flows into HubSpot workflows and Meta integrations as needed.',
        },
      },
    ],
  };

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <JsonLd data={[breadcrumbs, service, faqs]} />

      <div className="mx-auto max-w-6xl px-6 py-20 space-y-12">
        <header className="space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900">
            Make and Zapier automations
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
            Make.com and Zapier automations that do not silently fail.
          </h1>
          <p className="text-lg sm:text-xl text-gray-700 max-w-3xl">
            We build automations for lead capture, routing, CRM sync, and reporting, then harden them with data sanity checks and monitoring.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/consulting/book"
              className="inline-flex items-center justify-center rounded-lg bg-[#0f766e] px-5 py-3 text-white font-semibold shadow-sm hover:bg-[#115e59] transition-colors"
            >
              Book an automation call
            </Link>
            <Link
              href="/automations"
              className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-5 py-3 text-gray-900 font-semibold shadow-sm hover:bg-gray-50 transition-colors"
            >
              Automations overview
            </Link>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-gray-200 bg-white/90 p-6 shadow-card space-y-2">
            <h2 className="text-lg font-semibold">Lead capture</h2>
            <p className="text-sm text-gray-700">Forms, webhooks, comments, and DMs routed into your CRM with clean properties.</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white/90 p-6 shadow-card space-y-2">
            <h2 className="text-lg font-semibold">Data sanity</h2>
            <p className="text-sm text-gray-700">Validation and dedupe so downstream reports and workflows match reality.</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white/90 p-6 shadow-card space-y-2">
            <h2 className="text-lg font-semibold">Monitoring</h2>
            <p className="text-sm text-gray-700">Dashboards and alerting for failures, throughput drops, and schema drift.</p>
          </div>
        </section>

        <HowWeWork />

        <section className="rounded-2xl border border-gray-200 bg-white/90 p-8 shadow-card space-y-3">
          <h2 className="text-2xl font-bold">Related</h2>
          <div className="flex flex-col sm:flex-row flex-wrap gap-3">
            <Link href="/hubspot-integration" className="underline font-semibold">HubSpot integrations</Link>
            <Link href="/meta-conversions-api" className="underline font-semibold">Meta Conversions API</Link>
            <Link href="/services/automation" className="underline font-semibold">Workflow automation service</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
