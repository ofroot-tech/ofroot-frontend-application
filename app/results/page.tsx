import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { growthMetadata } from '@/app/lib/growth-content';
import { caseStudies } from '@/app/lib/proof-content';
import { TrackedLink } from '@/components/growth/Analytics';

export const metadata = growthMetadata(
  'Results and Growth Systems Case Studies',
  'Review documented and anonymized OfRoot implementation records across automation, integration, AI, and production delivery.',
  '/results',
);

const evidenceStandards = [
  ['Documented outcomes', 'A specific delivery fact already recorded in the project history, such as the 30-day production launch.'],
  ['Implementation records', 'Anonymized system changes and observed operational effects without invented customer metrics.'],
  ['Capability boundaries', 'Clear separation between what was delivered, what changed, and what still requires customer-specific validation.'],
];

export default function ResultsPage() {
  return (
    <main id="main-content" className="bg-[#f7f6f2] text-slate-950">
      <section className="relative overflow-hidden bg-[#071225] px-6 py-20 text-white sm:px-8 sm:py-28">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true" style={{ background: 'radial-gradient(circle at 82% 18%, rgba(55,255,224,.14), transparent 28%), radial-gradient(circle at 12% 88%, rgba(255,147,18,.2), transparent 30%)' }} />
        <div className="relative mx-auto max-w-6xl">
          <p className="mb-5 text-sm font-bold uppercase tracking-[.18em] text-[#FFC46B]">Results</p>
          <h1 className="max-w-5xl text-balance text-4xl font-black text-white sm:text-6xl">Proof should show what changed, how it worked, and what became measurable.</h1>
          <p className="mx-0 mt-6 max-w-3xl text-lg text-slate-200">These records connect business friction to an implemented system and an observable operating result. Client details remain anonymized where permission to publish them is not recorded.</p>
        </div>
      </section>

      <section className="px-6 py-20 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 grid gap-6 lg:grid-cols-[.75fr_1.25fr]">
            <div><p className="mb-3 text-sm font-bold uppercase tracking-[.16em] text-[#B55B00]">Selected work</p><h2 className="text-3xl font-black sm:text-4xl">Three systems. Three operating problems.</h2></div>
            <p className="mx-0 text-lg text-slate-600">Each case study separates the problem, constraints, implementation, delivered system, and observed outcome so buyers can judge relevance without inflated claims.</p>
          </div>
          <div className="grid gap-5 lg:grid-cols-3">
            {caseStudies.map((study) => (
              <Link key={study.slug} href={`/case-studies/${study.slug}`} className="group flex min-h-[390px] flex-col rounded-3xl border border-slate-200 bg-white p-7 shadow-[0_14px_50px_rgba(15,23,42,.05)]">
                <div className="flex items-start justify-between gap-4"><p className="mx-0 text-xs font-bold uppercase tracking-[.15em] text-[#B55B00]">{study.category}</p><span className="rounded-full bg-[#fff1df] px-3 py-1 text-right text-[11px] font-bold text-[#8F4700]">{study.evidenceLabel}</span></div>
                <p className="mx-0 mt-9 text-3xl font-black text-slate-950">{study.featuredResult}</p>
                <p className="mx-0 mt-2 text-xs text-slate-500">{study.featuredResultLabel}</p>
                <h2 className="mt-7 text-balance text-2xl font-black">{study.title}</h2>
                <p className="mx-0 mt-4 flex-1 text-sm text-slate-600">{study.summary}</p>
                <span className="mt-8 inline-flex items-center gap-2 font-semibold text-[#8F4700]">Read the case study<ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white px-6 py-20 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-7 lg:grid-cols-[.75fr_1.25fr]"><h2 className="text-3xl font-black sm:text-4xl">How OfRoot presents evidence.</h2><p className="mx-0 text-lg text-slate-600">The evidence label tells you how much weight a statement can carry before a deeper customer reference or measurement review.</p></div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">{evidenceStandards.map(([title, body]) => <article key={title} className="rounded-2xl bg-[#f7f6f2] p-6"><CheckCircle2 className="mb-5 h-5 w-5 text-[#C96800]" /><h3 className="text-xl font-bold">{title}</h3><p className="mx-0 mt-3 text-sm text-slate-600">{body}</p></article>)}</div>
        </div>
      </section>

      <section className="bg-[#071225] px-6 py-16 text-white sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div><p className="mb-2 text-sm font-bold uppercase tracking-[.15em] text-[#FFC46B]">Your system</p><h2 className="max-w-3xl text-3xl font-black text-white">Define the result and evidence before choosing the implementation.</h2></div>
          <TrackedLink href="/book?source=results" source="results:final" className="rounded-full bg-[#FF9312] px-6 py-3 font-semibold text-slate-950">Book a Growth Systems Audit</TrackedLink>
        </div>
      </section>
    </main>
  );
}
