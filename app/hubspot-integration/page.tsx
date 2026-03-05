import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/seo/JsonLd';
import { SITE } from '@/app/config/site';
import HowWeWork from '@/components/sections/HowWeWork';

export const metadata: Metadata = {
  title: 'HubSpot Integration Services | OfRoot',
  description:
    'HubSpot integrations for lead routing, lifecycle stages, dedupe, and meeting booking workflows. Fix dropped leads and sync issues.',
  keywords: [
    'HubSpot integration',
    'HubSpot workflow automation',
    'HubSpot lead routing',
    'HubSpot lifecycle stages',
    'CRM data sanity',
    'lead deduplication',
    'meeting booking workflows',
  ],
  alternates: { canonical: '/hubspot-integration' },
};

export default function HubSpotIntegrationPage() {
  const breadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE.url}/` },
      { '@type': 'ListItem', position: 2, name: 'HubSpot Integration', item: `${SITE.url}/hubspot-integration` },
    ],
  };

  const service = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'HubSpot Integration Services',
    provider: { '@type': 'Organization', name: SITE.name, url: SITE.url },
    areaServed: 'US',
    url: `${SITE.url}/hubspot-integration`,
    serviceType: [
      'HubSpot lead routing',
      'HubSpot workflow automation',
      'CRM data sanity',
      'Lead deduplication',
      'Meeting booking workflows',
    ],
    description:
      'We implement HubSpot integrations that route leads correctly, keep lifecycle stages consistent, and convert demand into booked meetings.',
  };

  const faqs = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Can you fix dropped or duplicated HubSpot leads?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. We diagnose the event chain, add dedupe and validation rules, and implement retries and monitoring so the system is reliable.',
        },
      },
      {
        '@type': 'Question',
        name: 'Do you set up lead routing and SLAs?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. We implement assignment rules, lifecycle stages, follow-up sequences, and SLA alerts so every lead is owned and worked quickly.',
        },
      },
      {
        '@type': 'Question',
        name: 'Do you integrate HubSpot with Make or Zapier?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. We use Make/Zapier when it fits, and direct APIs when reliability and control matter.',
        },
      },
    ],
  };

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <JsonLd data={[breadcrumbs, service, faqs]} />

      <div className="mx-auto max-w-6xl px-6 py-20 space-y-12">
        <header className="space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-900">
            HubSpot integrations
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
            HubSpot lead routing and data sanity that drives booked meetings.
          </h1>
          <p className="text-lg sm:text-xl text-gray-700 max-w-3xl">
            We connect your lead sources to HubSpot with clean properties, lifecycle stages, assignment rules, and follow-up workflows.
            No more silent drops, duplicates, or misrouted owners.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/consulting/book"
              className="inline-flex items-center justify-center rounded-lg bg-[#0f766e] px-5 py-3 text-white font-semibold shadow-sm hover:bg-[#115e59] transition-colors"
            >
              Book a HubSpot integration call
            </Link>
            <Link
              href="/services/marketing-automation"
              className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-5 py-3 text-gray-900 font-semibold shadow-sm hover:bg-gray-50 transition-colors"
            >
              HubSpot workflows service
            </Link>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-gray-200 bg-white/90 p-6 shadow-card space-y-2">
            <h2 className="text-lg font-semibold">Lead routing</h2>
            <p className="text-sm text-gray-700">Assignment rules, territories, SLAs, and owner handoffs that keep response time low.</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white/90 p-6 shadow-card space-y-2">
            <h2 className="text-lg font-semibold">Lifecycle sanity</h2>
            <p className="text-sm text-gray-700">Consistent properties, lifecycle stages, and dedupe so reports match reality.</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white/90 p-6 shadow-card space-y-2">
            <h2 className="text-lg font-semibold">Meeting workflows</h2>
            <p className="text-sm text-gray-700">Follow-up triggers and scheduling handoffs that turn qualified leads into booked meetings.</p>
          </div>
        </section>

        <HowWeWork />

        <section className="rounded-2xl border border-gray-200 bg-white/90 p-8 shadow-card space-y-3">
          <h2 className="text-2xl font-bold">Related</h2>
          <div className="flex flex-col sm:flex-row flex-wrap gap-3">
            <Link href="/automations" className="underline font-semibold">Automations overview</Link>
            <Link href="/services/integration" className="underline font-semibold">HubSpot + Meta integrations</Link>
            <Link href="/make-zapier-automation" className="underline font-semibold">Make and Zapier automations</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
