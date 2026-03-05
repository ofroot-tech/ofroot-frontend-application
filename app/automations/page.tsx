import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/seo/JsonLd';
import { SITE } from '@/app/config/site';
import HowWeWork from '@/components/sections/HowWeWork';

export const metadata: Metadata = {
  title: 'Automation Services (Make, Zapier, HubSpot, Meta) | OfRoot',
  description:
    'We build workflow automations that capture leads, sync HubSpot, send follow-ups, and improve attribution via Meta API and Conversions API. Make.com, Zapier, and direct integrations.',
  keywords: [
    'automation services',
    'workflow automation',
    'Make.com automation',
    'Zapier automation',
    'HubSpot automation',
    'HubSpot integration',
    'Meta API integration',
    'Meta Conversions API',
    'lead routing',
    'meeting booking workflows',
  ],
  alternates: { canonical: '/automations' },
};

export default function AutomationsPage() {
  const breadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: `${SITE.url}/`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Automations',
        item: `${SITE.url}/automations`,
      },
    ],
  };

  const service = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Workflow Automation and Integrations',
    provider: {
      '@type': 'Organization',
      name: SITE.name,
      url: SITE.url,
      sameAs: SITE.socials,
    },
    areaServed: 'US',
    url: `${SITE.url}/automations`,
    serviceType: [
      'Make.com automations',
      'Zapier automations',
      'HubSpot lead routing and CRM workflows',
      'Meta API integrations',
      'Meta Conversions API (CAPI) event pipelines',
      'Comment and DM lead capture workflows',
      'Meeting booking workflows',
    ],
    description:
      'We build workflow automations that capture leads, sync HubSpot, route follow-up, and convert demand into booked meetings using Make.com, Zapier, and direct API integrations.',
  };

  const faqs = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Do you build in Make.com or Zapier?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. We use Make.com or Zapier when it fits, and ship direct API integrations when reliability, cost, or control requires it.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can you integrate HubSpot for lead routing and follow-up?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. We standardize lead properties, lifecycle stages, assignment rules, and automated follow-ups so no lead goes unworked.',
        },
      },
      {
        '@type': 'Question',
        name: 'Do you implement Meta Conversions API?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. We implement event pipelines and validation so attribution data is reliable and downstream automation stays accurate.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can you automate comment and DM responses?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. We build workflows that respond to comments and DMs, send links, collect lead details, and store them in your CRM.',
        },
      },
      {
        '@type': 'Question',
        name: 'What does success look like?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Faster response times, fewer dropped leads, cleaner CRM data, and a higher rate of qualified leads converting into booked meetings.',
        },
      },
    ],
  };

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <JsonLd data={[breadcrumbs, service, faqs]} />

      <div className="mx-auto max-w-6xl px-6 py-20 space-y-10">
        <header className="space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-900">
            Automations and integrations
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
            Automations that turn leads into booked meetings.
          </h1>
          <p className="text-lg sm:text-xl text-gray-700 max-w-3xl">
            If your leads live across Meta, forms, comments, DMs, and HubSpot, you are
            bleeding conversion in the handoffs. We build reliable workflows that capture,
            qualify, sync, route, and book meetings.
          </p>
          <p className="text-sm text-gray-600 max-w-3xl">
            Common tooling: <strong className="font-semibold text-gray-800">Make.com</strong>, <strong className="font-semibold text-gray-800">Zapier</strong>, <strong className="font-semibold text-gray-800">HubSpot</strong>, and <strong className="font-semibold text-gray-800">Meta API</strong> (including <strong className="font-semibold text-gray-800">Conversions API</strong>).
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/consulting/book"
              className="inline-flex items-center justify-center rounded-lg bg-[#0f766e] px-5 py-3 text-white font-semibold shadow-sm hover:bg-[#115e59] transition-colors"
            >
              Book an automation strategy call
            </Link>
            <Link
              href="/landing/social-comment-dm-automation"
              className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-5 py-3 text-gray-900 font-semibold shadow-sm hover:bg-gray-50 transition-colors"
            >
              See the social automation landing
            </Link>
            <Link
              href="/hubspot-integration"
              className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-5 py-3 text-gray-900 font-semibold shadow-sm hover:bg-gray-50 transition-colors"
            >
              HubSpot integrations
            </Link>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-gray-200 bg-white/90 p-6 shadow-card space-y-2">
            <h2 className="text-lg font-semibold">Make.com and Zapier builds</h2>
            <p className="text-sm text-gray-700">
              Automations for lead capture, routing, notifications, and reporting. Use the right tool,
              avoid brittle chains, and document ownership.
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white/90 p-6 shadow-card space-y-2">
            <h2 className="text-lg font-semibold">HubSpot lead workflows</h2>
            <p className="text-sm text-gray-700">
              Properties, lifecycle stages, assignment rules, sequences, and meeting-booking handoffs that
              raise qualified-meeting rate.
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white/90 p-6 shadow-card space-y-2">
            <h2 className="text-lg font-semibold">Meta API and CAPI</h2>
            <p className="text-sm text-gray-700">
              Event pipelines, validation, dedupe, and monitoring so attribution stays accurate and
              lead sync does not silently fail.
            </p>
          </div>
        </section>

        <HowWeWork />

        <section className="rounded-2xl border border-gray-200 bg-white/90 p-8 shadow-card space-y-4">
          <h2 className="text-2xl font-bold">Related pages</h2>
          <p className="text-sm text-gray-700 max-w-3xl">
            Use these if you want to go deeper on implementation details, integrations, and pricing.
          </p>
          <div className="flex flex-col sm:flex-row flex-wrap gap-3">
            <Link href="/services/automation" className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition-colors">
              Workflow automation service
            </Link>
            <Link href="/services/integration" className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition-colors">
              HubSpot + Meta integrations
            </Link>
            <Link href="/services/marketing-automation" className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition-colors">
              HubSpot workflows and routing
            </Link>
            <Link href="/pricing" className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition-colors">
              Pricing
            </Link>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white p-8 shadow-card space-y-4">
          <h2 className="text-2xl font-bold text-white tracking-tight">Common problems we fix</h2>
          <ul className="list-disc pl-5 space-y-2 text-sm text-gray-100">
            <li>Dropped, duplicated, or delayed leads across forms, Meta, and HubSpot.</li>
            <li>Incorrect lifecycle stages and misrouted owners that slow response time.</li>
            <li>Broken webhooks and brittle “glue” automations without monitoring.</li>
            <li>Attribution that does not match reality due to missing CAPI events.</li>
          </ul>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              href="/services/automation"
              className="inline-flex items-center justify-center rounded-lg bg-white text-gray-900 px-5 py-3 font-semibold shadow-sm hover:bg-gray-100 transition-colors"
            >
              Workflow automation
            </Link>
            <Link
              href="/services/integration"
              className="inline-flex items-center justify-center rounded-lg border border-white/30 bg-white/5 px-5 py-3 font-semibold text-white hover:bg-white/10 transition-colors"
            >
              HubSpot + Meta integrations
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
