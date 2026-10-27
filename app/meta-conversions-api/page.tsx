import publicStyles from '@/components/growth/PublicPage.module.css';
import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/seo/JsonLd';
import { SITE } from '@/app/config/site';
import HowWeWork from '@/components/sections/HowWeWork';

export const metadata: Metadata = {
  title: 'Meta Conversions API (CAPI) Integration | OfRoot',
  description:
    'Implement Meta Conversions API with validated event pipelines, dedupe, and monitoring. Improve attribution quality and downstream lead workflows.',
  keywords: [
    'Meta Conversions API',
    'Meta CAPI',
    'Meta API integration',
    'conversion tracking',
    'event pipeline',
    'deduplication',
    'attribution',
  ],
  alternates: { canonical: '/meta-conversions-api' },
};

export default function MetaConversionsApiPage() {
  const breadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE.url}/` },
      { '@type': 'ListItem', position: 2, name: 'Meta Conversions API', item: `${SITE.url}/meta-conversions-api` },
    ],
  };

  const service = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Meta Conversions API Integration',
    provider: { '@type': 'Organization', name: SITE.name, url: SITE.url },
    areaServed: 'US',
    url: `${SITE.url}/meta-conversions-api`,
    serviceType: [
      'Meta Conversions API (CAPI)',
      'Event pipeline implementation',
      'Event validation and dedupe',
      'Attribution reliability',
      'Monitoring and alerts',
    ],
    description:
      'We implement Meta Conversions API with validated event pipelines, dedupe, and monitoring to improve attribution quality and downstream workflow accuracy.',
  };

  const faqs = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Do you handle server-side event pipelines?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. We implement server-side event ingestion, validation, and dedupe so events are consistent and reliable.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can you connect Meta events to HubSpot workflows?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. We connect Meta lead events and attribution data into HubSpot and workflow automations where it improves routing and reporting.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do you prevent silent failures?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'We add retries, alerting, and dashboards that show event throughput, failure rates, and data quality over time.',
        },
      },
    ],
  };

  return (
    <main className={`${publicStyles.page} ${publicStyles.legacy} min-h-screen bg-[#211c2c] text-[#faf9fc]`}>
      <JsonLd data={[breadcrumbs, service, faqs]} />

      <div className="mx-auto max-w-6xl px-6 py-20 space-y-12">
        <header className="space-y-5">
          <div className="inline-flex items-center gap-2 rounded-[2px] border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-900">
            Meta CAPI integration
          </div>
          <h1 className="text-4xl sm:text-6xl font-medium tracking-tight">
            Meta Conversions API that matches reality.
          </h1>
          <p className="text-lg sm:text-xl text-[#c9bed5] max-w-3xl">
            We implement Meta CAPI with validation, dedupe, and monitoring so you can trust attribution and the workflows that depend on it.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/consulting/book"
              className="inline-flex items-center justify-center rounded-lg bg-[#574064] px-5 py-3 text-white font-semibold shadow-sm hover:bg-[#6d4c70] transition-colors"
            >
              Book a Meta CAPI call
            </Link>
            <Link
              href="/services/hubspot-meta-integrations"
              className="inline-flex items-center justify-center rounded-lg border border-[#d2caeb]/16 bg-[#211c2c] px-5 py-3 text-[#faf9fc] font-semibold shadow-sm hover:bg-[#262231] transition-colors"
            >
              HubSpot + Meta integrations
            </Link>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-[2px] border border-[#d2caeb]/16 bg-[#211c2c]/90 p-6 shadow-card space-y-2">
            <h2 className="text-lg font-semibold">Event quality</h2>
            <p className="text-sm text-[#c9bed5]">Validation, required fields, and consistent mapping so you are not optimizing on bad data.</p>
          </div>
          <div className="rounded-[2px] border border-[#d2caeb]/16 bg-[#211c2c]/90 p-6 shadow-card space-y-2">
            <h2 className="text-lg font-semibold">Dedupe and retries</h2>
            <p className="text-sm text-[#c9bed5]">Prevent duplicate conversions and recover from transient API failures.</p>
          </div>
          <div className="rounded-[2px] border border-[#d2caeb]/16 bg-[#211c2c]/90 p-6 shadow-card space-y-2">
            <h2 className="text-lg font-semibold">Monitoring</h2>
            <p className="text-sm text-[#c9bed5]">Dashboards and alerts so silent failures get caught before spend is wasted.</p>
          </div>
        </section>

        <HowWeWork />

        <section className="rounded-[2px] border border-[#d2caeb]/16 bg-[#211c2c]/90 p-8 shadow-card space-y-3">
          <h2 className="text-2xl font-bold">Related</h2>
          <div className="flex flex-col sm:flex-row flex-wrap gap-3">
            <Link href="/automations" className="underline font-semibold">Automations overview</Link>
            <Link href="/hubspot-integration" className="underline font-semibold">HubSpot integrations</Link>
            <Link href="/make-zapier-automation" className="underline font-semibold">Make and Zapier automations</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
