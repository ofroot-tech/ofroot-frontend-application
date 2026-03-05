// app/case-studies/healthcare-ai-automation/page.tsx
// Narrative-first case study page.
//
// Goal:
// - Provide an outcome-focused story that supports consulting SEO.
// - Keep language non-technical, confidence-building, and skimmable.
// - Avoid claiming specific proprietary customer details.

import Link from 'next/link';

export const metadata = {
  title: 'Case Study: Healthcare systems + AI automation | OfRoot',
  description:
    'How a healthcare team improved system reliability and response time with AI automation, workflow optimization, and observability — without slowing delivery.',
  alternates: { canonical: '/case-studies/healthcare-ai-automation' },
};

export default function CaseStudyHealthcareAIAutomation() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-emerald-50/50 to-white text-gray-900">
      <div className="mx-auto max-w-6xl px-4 md:px-6 py-20 md:py-24 space-y-12">
        {/* Hero */}
        <header className="text-left space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-black text-white px-3 py-1 text-xs font-semibold uppercase tracking-wide">
            Healthcare systems · AI automation
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight text-gray-900">
              Faster response times, higher reliability
            </h1>
            <p className="text-lg sm:text-xl text-gray-700 max-w-3xl">
              A healthcare operations team reduced manual triage and stabilized critical workflows by combining workflow optimization,
              AI automation, and pragmatic observability.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 text-sm">
            <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 font-medium text-emerald-800">
              Reliability-first delivery
            </span>
            <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1 font-medium text-gray-800">
              Less manual triage
            </span>
            <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1 font-medium text-gray-800">
              Clear operational analytics
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/consulting/book"
              className="inline-flex items-center justify-center rounded-lg bg-[#0f766e] px-5 py-3 text-white font-semibold shadow-sm hover:bg-[#115e59] transition-colors"
            >
              Book a strategy call
            </Link>
            <Link
              href="/consulting"
              className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-5 py-3 text-gray-900 font-semibold shadow-sm hover:bg-gray-50 transition-colors"
            >
              See consulting overview
            </Link>
          </div>
        </header>

        {/* Context */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <article className="rounded-2xl border border-gray-200 bg-white/90 backdrop-blur p-6 shadow-card space-y-2">
            <h2 className="text-sm font-semibold text-emerald-800 uppercase tracking-wide">Context</h2>
            <p className="text-base text-gray-800">
              Clinical operations depend on timely, accurate workflows. When systems drift, teams compensate with spreadsheets,
              manual checklists, and late-night “tribal knowledge”.
            </p>
          </article>
          <article className="rounded-2xl border border-gray-200 bg-white/90 backdrop-blur p-6 shadow-card space-y-2">
            <h2 className="text-sm font-semibold text-emerald-800 uppercase tracking-wide">Problem</h2>
            <p className="text-base text-gray-800">
              Too many handoffs. Too little visibility. Incidents were discovered late, response paths weren’t consistent,
              and reporting was unreliable.
            </p>
          </article>
        </section>

        {/* Approach */}
        <section className="rounded-2xl border border-gray-200 bg-white/90 backdrop-blur p-6 shadow-card space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Approach</h2>
            <p className="text-gray-700">
              A senior software architect consulting engagement focused on reliability first: reduce failure modes, automate
              what can be automated, then add measurement.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-800">
            <div className="space-y-2">
              <p>• Clarified the “critical path” workflow and removed ambiguous handoffs.</p>
              <p>• Added observability: alerts that point to action, not noise.</p>
              <p>• Introduced AI automation for routing and summarization where it reduces manual triage.</p>
            </div>
            <div className="space-y-2">
              <p>• Replaced brittle processes with small, stable integration points.</p>
              <p>• Added reporting automation for operational analytics and weekly health checks.</p>
              <p>• Shipped iteratively to avoid disruption: small releases, clear rollback paths.</p>
            </div>
          </div>
        </section>

        {/* Outcome */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <article className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white/90 backdrop-blur p-6 shadow-card space-y-3">
            <h2 className="text-2xl font-bold text-gray-900">Outcome</h2>
            <ul className="list-disc pl-5 space-y-2 text-sm text-gray-800">
              <li>Fewer manual steps in day-to-day operations (less triage, fewer “who owns this?” moments).</li>
              <li>Earlier detection of issues through system reliability improvements and actionable alerts.</li>
              <li>Faster response paths: the right person sees the right context at the right time.</li>
              <li>Clear operational analytics: leadership can see trends without digging through tools.</li>
            </ul>
          </article>

          <article className="rounded-2xl border border-gray-200 bg-white/90 backdrop-blur p-6 shadow-card space-y-3">
            <h2 className="text-2xl font-bold text-gray-900">What we delivered</h2>
            <ul className="list-disc pl-5 space-y-2 text-sm text-gray-800">
              <li>Workflow optimization map + owner matrix.</li>
              <li>Observability baseline (alerts, runbooks, and incident patterns).</li>
              <li>AI automation modules (routing/summarization) with clear safeguards.</li>
              <li>Reporting automation and weekly operational health review cadence.</li>
            </ul>
          </article>
        </section>

        {/* CTA */}
        <section className="rounded-2xl border border-gray-200 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white p-8 shadow-card flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <h2 className="text-2xl font-bold text-white">Want reliability without slowdown?</h2>
            <p className="text-sm text-gray-100">
              We’ll identify your highest-risk workflow, automate the bottlenecks, and ship improvements you can measure.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/consulting/book"
              className="inline-flex items-center justify-center rounded-lg bg-white text-gray-900 px-5 py-3 font-semibold shadow-sm hover:bg-gray-100 transition-colors"
            >
              Book a strategy call
            </Link>
            <Link
              href="/case-studies"
              className="inline-flex items-center justify-center rounded-lg border border-white/30 px-5 py-3 font-semibold text-white hover:bg-white/10 transition-colors"
            >
              Back to case studies
            </Link>
          </div>
        </section>
      </div>

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CaseStudy',
            name: 'Healthcare systems + AI automation',
            description:
              'Improved system reliability and response time with workflow optimization, AI automation, and observability — without slowing delivery.',
            provider: { '@type': 'Organization', name: 'OfRoot' },
            audience: { '@type': 'Audience', audienceType: 'Healthcare operations and technical leadership' },
          }),
        }}
      />
    </main>
  );
}
