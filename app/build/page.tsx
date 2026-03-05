// app/build/page.tsx
'use client';

/**
 * Build Landing Page
 * 
 * Marketing page showcasing OfRoot's app building capability.
 * Presents the 6-step process from idea to MVP with clear,
 * outcome-driven messaging aimed at founders and product teams.
 */

import { Metadata } from 'next';
import Link from 'next/link';
import { Search, Target, PenTool, Code2, Sparkles, Rocket } from 'lucide-react';

/* ─────────────────────────────────────────────────────────────
   Process Steps Data
   Each step represents a phase in the idea-to-MVP journey.
   ───────────────────────────────────────────────────────────── */
const processSteps = [
  {
    step: 1,
    icon: Search,
    title: 'Discover & Align',
    description:
      'Identify goals, constraints, users, and success metrics. Gather the essentials to move fast with clarity.',
  },
  {
    step: 2,
    icon: Target,
    title: 'Scope the MVP',
    description:
      'Define a small, valuable slice. Prioritize core flows, data model, and the shortest path to value.',
  },
  {
    step: 3,
    icon: PenTool,
    title: 'Design the experience',
    description:
      'Wireframes, UI, and copy that make the MVP intuitive and on-brand. Accessibility and responsiveness by default.',
  },
  {
    step: 4,
    icon: Code2,
    title: 'Build & integrate',
    description:
      'Implement backend APIs (Laravel), frontend (Next.js), auth, and key integrations. Ship weekly demos.',
  },
  {
    step: 5,
    icon: Sparkles,
    title: 'Automate & add AI',
    description:
      'Wire up workflows, assistants, and retrieval where they create leverage. Measure impact from day one.',
  },
  {
    step: 6,
    icon: Rocket,
    title: 'Launch & iterate',
    description:
      'Release, observe, and refine. We keep shipping improvements that compound into a product moat.',
  },
];

/* ─────────────────────────────────────────────────────────────
   ProcessCard Component
   Renders a single step in the process grid.
   ───────────────────────────────────────────────────────────── */
function ProcessCard({
  step,
  icon: Icon,
  title,
  description,
}: {
  step: number;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <article className="group relative rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 focus-within:ring-2 focus-within:ring-[var(--color-primary)] focus-within:ring-offset-2">
      {/* Icon and Step Label */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] transition-colors group-hover:bg-[var(--color-primary)] group-hover:text-white">
          <Icon className="h-5 w-5" />
        </div>
        <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">
          Step {step}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>

      {/* Description */}
      <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
    </article>
  );
}

/* ─────────────────────────────────────────────────────────────
   Main Page Component
   ───────────────────────────────────────────────────────────── */
export default function BuildLandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-6 sm:px-12 lg:px-20">
        {/* Decorative background circles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-[var(--color-primary)]/5 blur-3xl" />
          <div className="absolute top-40 right-10 w-60 h-60 rounded-full bg-[var(--color-primary)]/8 blur-2xl" />
          <div className="absolute bottom-0 left-1/3 w-96 h-96 rounded-full bg-[var(--color-primary)]/4 blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          {/* Eyebrow */}
          <span className="inline-block text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-primary)] mb-4">
            Process
          </span>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
            How we go from{' '}
            <span className="text-[var(--color-primary)]">idea</span> to{' '}
            <span className="text-[var(--color-primary)]">MVP</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            A clear, outcome-driven sequence. We partner closely, validate quickly, and ship working software on a predictable cadence.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://form.jotform.com/252643426225151"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-[var(--color-primary)] text-white font-semibold py-3 px-8 rounded-full shadow-lg transition-all duration-300 hover:bg-[var(--color-primary-dark)] hover:shadow-xl hover:-translate-y-0.5"
            >
              Book a scoping call
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
            <Link
              href="/case-studies"
              className="inline-flex items-center justify-center gap-2 bg-white text-gray-900 font-semibold py-3 px-8 rounded-full border border-gray-200 shadow-sm transition-all duration-300 hover:bg-gray-50 hover:shadow-md"
            >
              See case studies
            </Link>
          </div>
        </div>
      </section>

      {/* Process Steps Grid */}
      <section className="py-16 px-6 sm:px-12 lg:px-20 bg-gradient-to-b from-white to-gray-50/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {processSteps.map((step) => (
              <ProcessCard
                key={step.step}
                step={step.step}
                icon={step.icon}
                title={step.title}
                description={step.description}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Value Proposition Section */}
      <section className="py-20 px-6 sm:px-12 lg:px-20 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
              Why build with OfRoot?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We&apos;re not just developers — we&apos;re product partners who care about outcomes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Benefit 1 */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] mb-4">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Ship fast</h3>
              <p className="text-gray-600 text-sm">
                Weekly demos, working software every sprint. No months of planning before you see progress.
              </p>
            </div>

            {/* Benefit 2 */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] mb-4">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Built right</h3>
              <p className="text-gray-600 text-sm">
                Modern stack (Next.js, Laravel, Tailwind), accessibility by default, and architecture that scales.
              </p>
            </div>

            {/* Benefit 3 */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] mb-4">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">True partners</h3>
              <p className="text-gray-600 text-sm">
                We&apos;re invested in your success. Strategy, design, and engineering — all under one roof.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof / Trust Section */}
      <section className="py-16 px-6 sm:px-12 lg:px-20 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <blockquote className="text-xl sm:text-2xl text-gray-700 font-medium italic mb-6">
            &ldquo;OfRoot took our messy spreadsheet workflow and turned it into a real product in under 8 weeks. The weekly demos kept us aligned and excited.&rdquo;
          </blockquote>
          <div className="text-gray-500 text-sm">
            — Founder, Home Services Startup
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-6 sm:px-12 lg:px-20 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
            Ready to turn your idea into reality?
          </h2>
          <p className="text-lg text-white/90 mb-8 max-w-xl mx-auto">
            Let&apos;s talk about your project. We&apos;ll scope it together and show you exactly what&apos;s possible.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://form.jotform.com/252643426225151"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-white text-[var(--color-primary-dark)] font-semibold py-3 px-8 rounded-full shadow-lg transition-all duration-300 hover:bg-gray-100 hover:shadow-xl hover:-translate-y-0.5"
            >
              Book a 20-min call
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
            <Link
              href="/#subscription"
              className="inline-flex items-center justify-center gap-2 bg-transparent text-white font-semibold py-3 px-8 rounded-full border-2 border-white/30 transition-all duration-300 hover:bg-white/10 hover:border-white/50"
            >
              View subscription plans
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
