import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/seo/JsonLd';
import { SITE } from '@/app/config/site';
import HowWeWork from '@/components/sections/HowWeWork';

export const metadata: Metadata = {
  title: 'Agent Integrations (LLMs + Tools) | OfRoot',
  description:
    'Agent integrations that connect LLMs to your tools and data with evaluations, safety guardrails, and observability. Not chatbots: production workflows.',
  keywords: [
    'agent integrations',
    'AI agent integration',
    'LLM integration',
    'tool calling',
    'RAG integration',
    'evaluations',
    'observability',
  ],
  alternates: { canonical: '/agent-integrations' },
};

export default function AgentIntegrationsPage() {
  const breadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE.url}/` },
      { '@type': 'ListItem', position: 2, name: 'Agent Integrations', item: `${SITE.url}/agent-integrations` },
    ],
  };

  const service = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Agent and LLM Integrations',
    provider: { '@type': 'Organization', name: SITE.name, url: SITE.url },
    areaServed: 'US',
    url: `${SITE.url}/agent-integrations`,
    serviceType: [
      'LLM integration',
      'AI agent integration',
      'Tool-connected workflows',
      'Retrieval-augmented generation (RAG)',
      'Evaluations and monitoring',
    ],
    description:
      'We integrate agents with your tools and data and ship evaluations, safety guardrails, and observability so behavior stays stable in production.',
  };

  const faqs = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Do you build agents or chatbots?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Agents. They use tools, retrieve from your data, and complete workflows with safe fallbacks and monitoring.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do you keep behavior reliable over time?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'We ship evaluations, logging, and alerting. We also add guardrails for tool permissions, data redaction, and error handling.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can an agent update HubSpot or trigger automations?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. We integrate HubSpot and other systems with least-privilege permissions and auditing so actions are safe and traceable.',
        },
      },
    ],
  };

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <JsonLd data={[breadcrumbs, service, faqs]} />

      <div className="mx-auto max-w-6xl px-6 py-20 space-y-12">
        <header className="space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-900">
            Agent integrations
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
            Agents that can safely do real work in your stack.
          </h1>
          <p className="text-lg sm:text-xl text-gray-700 max-w-3xl">
            We connect LLMs to your tools and data, then ship the reliability layer: evaluations, observability, permissions, and safe fallbacks.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/consulting/book"
              className="inline-flex items-center justify-center rounded-lg bg-[#0f766e] px-5 py-3 text-white font-semibold shadow-sm hover:bg-[#115e59] transition-colors"
            >
              Book an agent integration call
            </Link>
            <Link
              href="/services/ai-development-integrations"
              className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-5 py-3 text-gray-900 font-semibold shadow-sm hover:bg-gray-50 transition-colors"
            >
              Agents and LLM service page
            </Link>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-gray-200 bg-white/90 p-6 shadow-card space-y-2">
            <h2 className="text-lg font-semibold">Tool integrations</h2>
            <p className="text-sm text-gray-700">Connect CRMs, ticketing, databases, and internal APIs with audited actions.</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white/90 p-6 shadow-card space-y-2">
            <h2 className="text-lg font-semibold">Reliability layer</h2>
            <p className="text-sm text-gray-700">Evaluations, logging, and monitoring so performance does not drift silently.</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white/90 p-6 shadow-card space-y-2">
            <h2 className="text-lg font-semibold">Data safety</h2>
            <p className="text-sm text-gray-700">Redaction, least privilege, and safe fallbacks for high-stakes workflows.</p>
          </div>
        </section>

        <HowWeWork />

        <section className="rounded-2xl border border-gray-200 bg-white/90 p-8 shadow-card space-y-3">
          <h2 className="text-2xl font-bold">Related</h2>
          <div className="flex flex-col sm:flex-row flex-wrap gap-3">
            <Link href="/hubspot-integration" className="underline font-semibold">HubSpot integrations</Link>
            <Link href="/automations" className="underline font-semibold">Automations overview</Link>
            <Link href="/services/integration" className="underline font-semibold">HubSpot + Meta integrations</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
