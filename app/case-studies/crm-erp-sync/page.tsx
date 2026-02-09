// app/case-studies/crm-erp-sync/page.tsx
// Narrative-first case study page.
//
// Goal:
// - Showcase stable system integrations (CRM + ERP) in outcome language.
// - Emphasize uptime, consistency, and operational clarity.
// - Avoid vendor-specific or customer-identifying details.

import Link from 'next/link';

export const metadata = {
  title: 'Case Study: CRM + ERP sync automation | OfRoot',
  description:
    'How a team reduced operational drag with stable system integrations: CRM ↔ ERP sync automation with observability, retries, and reporting automation.',
  alternates: { canonical: '/case-studies/crm-erp-sync' },
};

export default function CaseStudyCrmErpSync() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-emerald-50/50 to-white text-gray-900">
      <div className="mx-auto max-w-6xl px-4 md:px-6 py-20 md:py-24 space-y-12">
        {/* Hero */}
        <header className="text-left space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-black text-white px-3 py-1 text-xs font-semibold uppercase tracking-wide">
            System integrations · CRM ↔ ERP
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight text-gray-900">CRM + ERP sync that doesn’t break production</h1>
            <p className="text-lg sm:text-xl text-gray-700 max-w-3xl">
              A team replaced brittle one-off scripts with stable system integrations, clear ownership, and reporting automation —
              so revenue operations had consistent data without constant firefighting.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 text-sm">
            <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 font-medium text-emerald-800">
              Fewer failures
            </span>
            <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1 font-medium text-gray-800">
              Faster back office ops
            </span>
            <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1 font-medium text-gray-800">
              Better reporting
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
              href="/services/integration"
              className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-5 py-3 text-gray-900 font-semibold shadow-sm hover:bg-gray-50 transition-colors"
            >
              Learn about integrations
            </Link>
          </div>
        </header>

        {/* Problem */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <article className="rounded-2xl border border-gray-200 bg-white/90 backdrop-blur p-6 shadow-card space-y-2">
            <h2 className="text-sm font-semibold text-emerald-800 uppercase tracking-wide">Problem</h2>
            <p className="text-base text-gray-800">
              CRM and ERP data diverged. Ops teams spent hours reconciling discrepancies and chasing “which system is correct?”
              while leaders couldn’t trust pipeline reports.
            </p>
          </article>
          <article className="rounded-2xl border border-gray-200 bg-white/90 backdrop-blur p-6 shadow-card space-y-2">
            <h2 className="text-sm font-semibold text-emerald-800 uppercase tracking-wide">Constraints</h2>
            <p className="text-base text-gray-800">
              Integrations had to be stable, auditable, and safe to deploy—without disrupting existing sales and finance workflows.
            </p>
          </article>
        </section>

        {/* Approach */}
        <section className="rounded-2xl border border-gray-200 bg-white/90 backdrop-blur p-6 shadow-card space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Approach</h2>
            <p className="text-gray-700">
              System integrations done like product: clear ownership, predictable behavior, and observability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-800">
            <div className="space-y-2">
              <p>• Defined the source-of-truth rules for each field (and documented exceptions).</p>
              <p>• Added idempotency and retries to prevent duplicate updates and silent failures.</p>
              <p>• Introduced dead-letter handling: failures are visible, assigned, and recoverable.</p>
            </div>
            <div className="space-y-2">
              <p>• Added observability: alerts and dashboards that answer “what broke and why?”</p>
              <p>• Built reporting automation so ops can audit changes without engineering.</p>
              <p>• Shipped in small slices to keep uptime and reduce integration risk.</p>
            </div>
          </div>
        </section>

        {/* Outcomes */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <article className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white/90 backdrop-blur p-6 shadow-card space-y-3">
            <h2 className="text-2xl font-bold text-gray-900">Outcome</h2>
            <ul className="list-disc pl-5 space-y-2 text-sm text-gray-800">
              <li>Less manual reconciliation: ops teams stop doing spreadsheet cleanup work.</li>
              <li>Higher confidence reporting: leaders can trust pipeline and revenue status.</li>
              <li>Lower incident risk: integration failures are contained, visible, and recoverable.</li>
              <li>Faster iteration: adding new fields and workflows becomes predictable.</li>
            </ul>
          </article>

          <article className="rounded-2xl border border-gray-200 bg-white/90 backdrop-blur p-6 shadow-card space-y-3">
            <h2 className="text-2xl font-bold text-gray-900">What we delivered</h2>
            <ul className="list-disc pl-5 space-y-2 text-sm text-gray-800">
              <li>Sync rules + ownership map.</li>
              <li>Retries, idempotency, and failure handling.</li>
              <li>Observability + runbooks.</li>
              <li>Reporting automation for audit and operational analytics.</li>
            </ul>
          </article>
        </section>

        {/* CTA */}
        <section className="rounded-2xl border border-gray-200 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white p-8 shadow-card flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <h2 className="text-2xl font-bold text-white">Need stable integrations?</h2>
            <p className="text-sm text-gray-100">We’ll stabilize the sync, add observability, and make reporting trustworthy again.</p>
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
            name: 'CRM + ERP sync automation',
            description:
              'Reduced operational drag with stable system integrations: CRM ↔ ERP sync automation with observability, retries, and reporting automation.',
            provider: { '@type': 'Organization', name: 'OfRoot' },
            audience: { '@type': 'Audience', audienceType: 'Revenue operations and technical leadership' },
          }),
        }}
      />
    </main>
  );
}
