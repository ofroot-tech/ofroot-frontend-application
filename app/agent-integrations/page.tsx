import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/seo/JsonLd';
import { SITE } from '@/app/config/site';
import HowWeWork from '@/components/sections/HowWeWork';

export const metadata: Metadata = {
  title: { absolute: 'AI Agent Integration Services | OfRoot' },
  description:
    'Connect AI agents to your CRM, data, and internal tools with permissions, evaluations, observability, and human approval for sensitive actions.',
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
  openGraph: {
    title: 'AI Agent Integration Services | OfRoot',
    description:
      'Connect AI agents to your CRM, data, and internal tools with permissions, evaluations, observability, and human approval for sensitive actions.',
    url: `${SITE.url}/agent-integrations`,
    siteName: SITE.name,
    type: 'website',
    images: [{ url: `${SITE.url}/og.jpg`, width: 1200, height: 630, alt: 'OfRoot AI agent integration services' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Agent Integration Services | OfRoot',
    description:
      'Connect AI agents to approved business systems with permissions, evaluations, observability, and human approval.',
    images: [`${SITE.url}/og.jpg`],
  },
};

const faqItems = [
  {
    question: 'What is an AI agent integration?',
    answer:
      'An AI agent integration connects a language model to approved business data and tools so it can complete defined workflow steps, not only generate text. Production integrations also need permissions, validation, monitoring, and safe failure handling.',
  },
  {
    question: 'How is an AI agent different from a chatbot?',
    answer:
      'A chatbot mainly answers questions. An agent can retrieve approved context and take defined actions through connected tools, subject to permissions and human approval rules.',
  },
  {
    question: 'Can an AI agent update HubSpot or other business systems?',
    answer:
      'Yes. OfRoot can connect agents to CRMs, ticketing systems, databases, and internal APIs using least-privilege access, validation, and auditable actions.',
  },
  {
    question: 'How do you make AI agent behavior reliable?',
    answer:
      'OfRoot uses evaluations, structured inputs and outputs, permission checks, logging, monitoring, retries, and safe fallbacks. Sensitive actions can remain behind explicit human approval.',
  },
  {
    question: 'Does an AI agent replace the team that owns the workflow?',
    answer:
      'No. A production agent operates inside rules owned by the business. People remain responsible for policy, exceptions, sensitive decisions, and performance review.',
  },
];

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
    mainEntity: faqItems.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
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
            AI agent integration services that safely do real work.
          </h1>
          <p className="text-lg sm:text-xl text-gray-700 max-w-3xl">
            OfRoot connects AI agents to approved company data, CRMs, ticketing systems, databases, and internal APIs. We design the permissions, evaluations, monitoring, and human approval steps that turn a prototype into a controlled production workflow.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/consulting/book"
              className="inline-flex items-center justify-center rounded-lg bg-[#0f766e] px-5 py-3 text-white font-semibold shadow-sm hover:bg-[#115e59] transition-colors"
            >
              Book an agent integration call
            </Link>
            <Link
              href="/insights/is-your-business-ai-agent-ready"
              className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-5 py-3 text-gray-900 font-semibold shadow-sm hover:bg-gray-50 transition-colors"
            >
              Check your AI-agent readiness
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

        <section className="rounded-2xl border border-gray-200 bg-slate-50 p-8 shadow-card space-y-6">
          <div className="max-w-3xl space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-violet-800">Readiness before software</p>
            <h2 className="text-3xl font-bold">A production agent needs an operating contract.</h2>
            <p className="text-gray-700">
              The strongest first use case is a specific workflow with approved sources, limited tool access, measurable value, safe recovery, and named owners. We make those controls explicit before expanding the agent&apos;s scope.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ['Defined workflow', 'A clear trigger, outcome, owner, and exception path.'],
              ['Approved sources', 'Known systems of record with permission-aware retrieval.'],
              ['Limited actions', 'Least-privilege tool access and validation before writes.'],
              ['Human approval', 'Explicit review before sensitive or external actions.'],
              ['Safe recovery', 'Retries, deduplication, fallbacks, and visible exceptions.'],
              ['Measured operation', 'Evaluations, logs, alerts, and business outcome tracking.'],
            ].map(([title, body]) => (
              <div key={title} className="rounded-xl border border-gray-200 bg-white p-5">
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-gray-700">{body}</p>
              </div>
            ))}
          </div>
          <Link href="/insights/is-your-business-ai-agent-ready" className="inline-flex font-semibold text-violet-900 underline underline-offset-4">
            Use the nine-part AI-agent readiness test
          </Link>
        </section>

        <section className="space-y-5" aria-labelledby="agent-faq-heading">
          <h2 id="agent-faq-heading" className="text-3xl font-bold">AI agent integration questions</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {faqItems.map(item => (
              <details key={item.question} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-card">
                <summary className="cursor-pointer font-semibold">{item.question}</summary>
                <p className="mt-3 text-sm leading-6 text-gray-700">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white/90 p-8 shadow-card space-y-3">
          <h2 className="text-2xl font-bold">Related</h2>
          <div className="flex flex-col sm:flex-row flex-wrap gap-3">
            <Link href="/hubspot-integration" className="underline font-semibold">HubSpot integrations</Link>
            <Link href="/automations" className="underline font-semibold">Automations overview</Link>
            <Link href="/services/integration" className="underline font-semibold">HubSpot + Meta integrations</Link>
            <Link href="/security" className="underline font-semibold">Security approach</Link>
            <Link href="/insights/is-your-business-ai-agent-ready" className="underline font-semibold">AI-agent readiness guide</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
