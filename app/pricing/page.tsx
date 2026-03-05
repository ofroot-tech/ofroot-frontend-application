/**
 * Pricing Page
 *
 * Purpose:
 *  - Present operator-led pricing centered on a 30-day build, ongoing operation, and regulated-ready scaling.
 *  - Anchor with the MetroAreaRemovalServices case study for proof.
 *  - Keep structure simple: hero, tiers, timeline, credibility, FAQ, CTA.
 */

import { Metadata } from 'next';
import Link from "next/link";
import PrimaryCta from "@/components/ui/PrimaryCta";
import { generatePricingSchema, generateOrganizationSchema } from '@/app/lib/schemas';

export const metadata: Metadata = {
  title: 'Pricing — Operator-led AI builds in 30 days | OfRoot',
  description: 'Three tiers for operators: Build & Prove (30-day sprint), Operate & Extend (steady-state shipping), Scale & Assure (regulated/high-volume). Senior engineers, weekly demos, production guardrails.',
  keywords: ['AI systems pricing', 'automation pricing', 'operator-led', '30-day build', 'OfRoot'],
  openGraph: {
    title: 'Pricing — Operator-led AI builds in 30 days | OfRoot',
    description: 'Scope a 30-day build, keep senior engineers in the loop, and run production AI with guardrails.',
    url: 'https://ofroot.technology/pricing',
    type: 'website',
  },
};

export default function PricingPage() {
  const pricingSchema = generatePricingSchema();
  const orgSchema = generateOrganizationSchema();

  const homeServicesPilot = {
    name: 'OnTask AI Intake Pilot',
    price: 'Home services · $6–8K · 30 days',
    who: 'HVAC, cleaning, and plumbing operators who want AI intake + routing without over-buying a platform.',
    outcomes: ['AI intake that qualifies, schedules, and routes jobs into your CRM', 'Guardrails, redaction, and agent playbooks for dispatchers', 'Live in 30 days with weekly demos and conversion reporting'],
  };

  const tiers = [
    {
      name: 'Build & Prove',
      price: 'From $12K · 30 days',
      who: 'Operators who need a revenue-grade AI workflow this quarter.',
      pain: 'Blank page, stalled intake, manual routing and follow-up.',
      outcomes: ['AI intake + routing tied to your CRM', 'Guardrails, redaction, and audit trails', 'Weekly demos and a shipping calendar'],
      cta: 'Scope this 30-day build',
      href: '/consulting/book',
    },
    {
      name: 'Operate & Extend',
      price: 'From $8K/mo',
      who: 'Teams with live traffic that need reliability, QA, and new surfaces.',
      pain: 'Regressions, ad-hoc fixes, and slow ship cycles.',
      outcomes: ['Weekly releases with QA and observability', 'New channels (chat, voice, back-office) without regressions', 'Prompt/policy tuning with incident playbooks'],
      cta: 'Review your stack',
      href: '/consulting/book',
    },
    {
      name: 'Scale & Assure',
      price: 'Custom · regulated/high-volume',
      who: 'Teams in regulated or high-volume environments that need formal guardrails.',
      pain: 'Compliance risk, performance surprises, unclear ownership.',
      outcomes: ['Policy-backed prompts and retrieval with redaction', 'Load-tested pathways with SLOs and runbooks', 'Vendor/PHI/PII handling mirrored from OfRoot Health flows'],
      cta: 'Run a readiness check',
      href: '/consulting/book',
    },
  ];

  const timeline = [
    { title: 'Day 0 · Review', detail: '30-minute review of stack, constraints, and the revenue/ops target.' },
    { title: 'Days 1–30 · Build', detail: 'Ship the workflow, routing, guardrails, and integrations with weekly demos.' },
    { title: 'Week by week · Run', detail: 'Operate, measure, and extend; add surfaces without regressions.' },
  ];

  const faqs = [
    { q: 'Who is this for?', a: 'Operators and founders who need a production AI workflow this quarter without hiring in-house.' },
    { q: 'What do I get in 30 days?', a: 'A live AI workflow (intake/routing/follow-up) wired to your stack, with guardrails, redaction, and weekly demos.' },
    { q: 'How do you handle security and data?', a: 'We run HIPAA-adjacent flows internally. We apply the same policies: redaction, least-privilege keys, audit trails, and SLOs.' },
    { q: 'Who owns the assets?', a: 'You do. We hand over code, prompts, policies, and runbooks. If you pause, you keep everything.' },
    { q: 'How are changes requested?', a: 'One thread for priorities. We ship weekly and show diffs in demos.' },
  ];

  return (
    <>
      {/* JSON-LD Schemas */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }} />

      <main className="flex flex-col w-full bg-white">
        {/* Hero: position the 30-day promise and proof */}
        <section className="py-28 px-6 sm:px-8 text-center bg-gradient-to-b from-white to-gray-50">
          <div className="max-w-5xl mx-auto space-y-4">
            <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight text-gray-900">Pricing built around a 30-day, operator-led AI build.</h1>
            <p className="text-xl sm:text-2xl text-gray-700">Senior engineers design, build, and run your workflow. Weekly demos, zero mystery. MetroAreaRemovalServices: AI intake + scheduling → reliable weekly bookings.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
              <PrimaryCta href="/consulting/book" className="h-12 px-8 text-lg">Scope a 30-day build</PrimaryCta>
              <Link href="/consulting/book" className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-8 py-3 text-gray-900 font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 h-12 text-lg shadow-sm">Review your stack</Link>
            </div>
          </div>
        </section>

        {/* Home services pilot lane for OnTask customers */}
        <section id="pilot" className="py-14 px-6 sm:px-8 bg-white">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-6 items-center rounded-2xl border border-gray-200 bg-gradient-to-r from-gray-50 via-white to-emerald-50 shadow-card p-6 sm:p-8">
            <div className="space-y-3 text-left">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">Home services lane</p>
              <h2 className="text-3xl font-extrabold text-gray-900">OnTask AI Intake Pilot</h2>
              <p className="text-lg text-gray-700">For HVAC, cleaning, and plumbing teams: add AI intake, qualification, and routing to OnTask without over-buying a platform. Live in 30 days.</p>
              <div className="space-y-2 text-sm text-gray-700">
                <p className="font-semibold text-gray-800">{homeServicesPilot.price}</p>
                <ul className="space-y-1">
                  {homeServicesPilot.outcomes.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="text-brand-600 mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <PrimaryCta href="/consulting/book">Scope this pilot</PrimaryCta>
                <Link href="/ontask" className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-6 py-3 text-gray-900 font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all duration-200">See OnTask product</Link>
              </div>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-white p-5 space-y-3">
              <p className="text-sm font-semibold text-emerald-800">Where it fits</p>
              <p className="text-sm text-gray-800">Use OnTask for day-to-day scheduling, estimates, invoices, and payments. Add this pilot when you want AI to answer, qualify, and route leads into the same calendar without changing tools.</p>
              <p className="text-sm text-gray-800">Outcome: AI intake + dispatcher guardrails in 30 days, priced for home services.</p>
            </div>
          </div>
        </section>

        {/* Tiers: who it is for, pain removed, outcome */}
        <section className="py-24 px-6 sm:px-8 bg-white">
          <div className="max-w-6xl mx-auto space-y-6 text-center">
            <div className="space-y-3">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">Choose the engagement that matches your stage</h2>
              <p className="text-lg sm:text-xl text-gray-700">Each tier spells out who it is for, the pain we remove, and the outcomes we deliver with weekly milestones.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              {tiers.map((tier) => (
                <article key={tier.name} className="rounded-2xl border border-gray-200 bg-white shadow-card p-6 flex flex-col gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">{tier.name}</p>
                    <h3 className="text-2xl font-bold text-gray-900">{tier.price}</h3>
                    <p className="text-sm text-gray-600">{tier.who}</p>
                  </div>

                  <div className="space-y-2 text-sm text-gray-700">
                    <p className="font-semibold text-gray-800">Pain removed</p>
                    <p>{tier.pain}</p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-gray-800">Outcomes</p>
                    <ul className="space-y-2 text-sm text-gray-700">
                      {tier.outcomes.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <span className="text-brand-600 mt-0.5">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-auto">
                    <PrimaryCta href={tier.href}>{tier.cta}</PrimaryCta>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline: set expectations for the first 30 days */}
        <section className="py-20 px-6 sm:px-8 bg-gradient-to-b from-brand-50/70 via-white to-sky-50/70">
          <div className="max-w-5xl mx-auto text-center space-y-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">What happens in the first 30 days</h2>
            <p className="text-lg text-gray-700">Clear beats clever: review, build, run. We show progress every week.</p>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              {timeline.map((item) => (
                <div key={item.title} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                  <p className="text-sm font-semibold text-brand-800">{item.title}</p>
                  <p className="mt-2 text-sm text-gray-700 leading-relaxed">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Credibility band */}
        <section className="py-16 px-6 sm:px-8 bg-gray-900 text-white">
          <div className="max-w-5xl mx-auto flex flex-col gap-4 text-center">
            <h3 className="text-2xl sm:text-3xl font-bold">Operator-led, production-grade, regulated-ready</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm sm:text-base">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">Built and run by senior engineers shipping live systems every week.</div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">Proof: MetroAreaRemovalServices relies on our AI intake + scheduling for weekly bookings.</div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">We operate HIPAA-adjacent flows in OfRoot Health; your data gets the same guardrails.</div>
            </div>
          </div>
        </section>

        {/* FAQ aligned to the operator narrative */}
        <section className="py-24 px-6 sm:px-8 bg-gray-50">
          <div className="max-w-5xl mx-auto space-y-10">
            <div className="text-center space-y-3">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">Pricing FAQ</h2>
              <p className="text-lg text-gray-700">Short answers to the questions that slow decisions.</p>
            </div>

            <div className="space-y-6">
              {faqs.map((item) => (
                <div key={item.q} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900">{item.q}</h3>
                  <p className="mt-2 text-sm text-gray-700 leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 px-6 sm:px-8 bg-gradient-to-b from-white to-gray-50 text-center">
          <div className="max-w-5xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">Ready to scope your build?</h2>
            <p className="text-lg text-gray-700">Tell us the revenue or ops outcome you need. We ship the workflow in 30 days and keep shipping weekly.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <PrimaryCta href="/consulting/book" className="h-12 px-8 text-lg">Scope a 30-day build</PrimaryCta>
              <Link href="/consulting/book" className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-8 py-3 text-gray-900 font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 h-12 text-lg shadow-sm">Review your stack</Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
