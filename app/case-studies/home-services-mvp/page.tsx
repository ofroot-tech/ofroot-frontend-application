// app/case-studies/home-services-mvp/page.tsx
// Narrative-first, matching the brand patterns used on the homepage: gradient hero, stat chips, cards, and dual CTAs.
import Link from 'next/link';

export const metadata = {
  title: 'Case Study: Home services MVP in 30 days | OfRoot',
  description:
    'How a home services operator shipped intake, scheduling, invoicing, and payments in 30 days using OfRoot playbooks, guardrails, and CI/CD.',
  alternates: { canonical: '/case-studies/home-services-mvp' },
};

export default function CaseStudyHomeServicesMVP() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-emerald-50/50 to-white text-gray-900">
      <div className="mx-auto max-w-6xl px-4 md:px-6 py-20 md:py-24 space-y-12">
        {/* Hero */}
        <header className="text-left space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-black text-white px-3 py-1 text-xs font-semibold uppercase tracking-wide">
            Home services · 30-day build
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight text-gray-900">Home services MVP live in 30 days</h1>
            <p className="text-lg sm:text-xl text-gray-700 max-w-3xl">
              An HVAC-and-plumbing operator launched intake, scheduling, invoicing, and payments in 30 days with OfRoot’s operator-led build, guardrails, and CI/CD.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 font-medium text-emerald-800">Live in 30 days</span>
            <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1 font-medium text-gray-800">~40% faster estimate → invoice</span>
            <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1 font-medium text-gray-800">Stripe payments + guardrails</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/consulting/book" className="inline-flex items-center justify-center rounded-lg bg-[#0f766e] px-5 py-3 text-white font-semibold shadow-sm hover:bg-[#115e59] transition-colors">Book an integration call</Link>
            <Link href="/pricing#pilot" className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-5 py-3 text-gray-900 font-semibold shadow-sm hover:bg-gray-50 transition-colors">See pricing</Link>
          </div>
        </header>

        {/* Company + Problem */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <article className="rounded-2xl border border-gray-200 bg-white/90 backdrop-blur p-6 shadow-card space-y-2">
            <h3 className="text-sm font-semibold text-emerald-800 uppercase tracking-wide">Company</h3>
            <p className="text-base text-gray-800">Home services operator (pre-seed), HVAC and plumbing focus.</p>
          </article>
          <article className="rounded-2xl border border-gray-200 bg-white/90 backdrop-blur p-6 shadow-card space-y-3">
            <h3 className="text-sm font-semibold text-emerald-800 uppercase tracking-wide">Problem</h3>
            <p className="text-base text-gray-800">
              Needed production-ready intake and scheduling without hiring a full in-house team. Lost after-hours calls, and estimates/invoices/reminders lived in spreadsheets.
            </p>
          </article>
        </section>

        {/* Approach */}
        <section className="rounded-2xl border border-gray-200 bg-white/90 backdrop-blur p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Approach</h2>
              <p className="text-gray-700">Operator-led, 30-day build with weekly demos and guardrails.</p>
            </div>
            <span className="inline-flex items-center rounded-full bg-black text-white px-3 py-1 text-xs font-semibold uppercase tracking-wide">Weekly demos</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-800">
            <div className="space-y-2">
              <p>• Scoped intake, scheduling, estimates → invoices, and Stripe payments.</p>
              <p>• Prebuilt scaffolds for auth, RBAC, observability, and CI/CD with preview deploys.</p>
              <p>• Guardrails: PII handling, audit trails, rollback paths; templated home services intents.</p>
            </div>
            <div className="space-y-2">
              <p>• Fixture-driven QA and incident runbooks to reduce post-launch risk.</p>
              <p>• Post-launch runbook plus OnTask ladder for teams that prefer to start on Starter/Plus.</p>
              <p>• Clear owner thread for priorities; Friday demos with diffs and outcomes.</p>
            </div>
          </div>
        </section>

        {/* Outcomes and Deliverables */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <article className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white/90 backdrop-blur p-6 shadow-card space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="text-2xl font-bold text-gray-900">Outcome</h2>
              <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-800">Live in 30 days</span>
            </div>
            <ul className="list-disc pl-5 space-y-2 text-sm text-gray-800">
              <li>Single agent workflow with dispatcher guardrails, live in 30 days.</li>
              <li>~40% faster estimate-to-invoice handoff; cleaner collections via Stripe.</li>
              <li>Confidence to scale: observability, CI, and playbooks reduced post-launch incidents.</li>
              <li>Pricing ladder clarity: Starter/Plus for teams, operator-led pilot when volume grows.</li>
            </ul>
          </article>

          <article className="rounded-2xl border border-gray-200 bg-white/90 backdrop-blur p-6 shadow-card space-y-3">
            <h2 className="text-2xl font-bold text-gray-900">What we delivered</h2>
            <ul className="list-disc pl-5 space-y-2 text-sm text-gray-800">
              <li>AI-assisted intake routing into the calendar with redaction and audit trails.</li>
              <li>Scheduling, estimates, invoices, and payments in one flow; branded comms and reminders.</li>
              <li>Runbooks, SLOs, incident playbooks; handoff of code, prompts, policies, and tests.</li>
            </ul>
          </article>
        </section>

        {/* CTA */}
        <section className="rounded-2xl border border-gray-200 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white p-8 shadow-card flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <h2 className="text-2xl font-bold text-white">Want the same outcome?</h2>
            <p className="text-sm text-gray-100">Start with the 30-day build, then keep us on retainer to extend channels and guardrails.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/consulting/book" className="inline-flex items-center justify-center rounded-lg bg-white text-gray-900 px-5 py-3 font-semibold shadow-sm hover:bg-gray-100 transition-colors">Scope your 30-day build</Link>
            <Link href="/pricing#pilot" className="inline-flex items-center justify-center rounded-lg border border-white/30 px-5 py-3 font-semibold text-white hover:bg-white/10 transition-colors">See pricing</Link>
          </div>
        </section>
      </div>

      {/* CaseStudy JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CaseStudy',
            name: 'Home services MVP live in 30 days',
            description:
              'How a home services operator shipped intake, scheduling, invoicing, and payments in 30 days using OfRoot playbooks, guardrails, and CI/CD.',
            provider: { '@type': 'Organization', name: 'OfRoot' },
            about: { '@type': 'Product', name: 'Operator-led 30-day build' },
            audience: { '@type': 'Audience', audienceType: 'Home services founders and operators' },
          }),
        }}
      />
    </main>
  );
}
