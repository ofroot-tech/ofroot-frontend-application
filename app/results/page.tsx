import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { growthMetadata } from '@/app/lib/growth-content';
import { caseStudies } from '@/app/lib/proof-content';
import { TrackedLink } from '@/components/growth/Analytics';

export const metadata = growthMetadata(
  'Engineering Capabilities and Examples',
  'Explore OfRoot capabilities in reporting, operational software, integrations, AI-assisted tools, and marketing websites.',
  '/results',
);

const evidenceStandards = [
  ['Relevant experience', 'Our founder brings 11 years in technology across full-stack development and solutions architecture.'],
  ['Clear attribution', 'These examples describe available engineering capabilities. They do not present former employers or confidential projects as OfRoot clients.'],
  ['Project-specific evidence', 'Scope, acceptance checks, and any outcome measures are agreed for the actual engagement. No rankings, revenue, or delivery timeline is guaranteed here.'],
];

export default function ResultsPage() {
  return (
    <main id="main-content" className="bg-[#f7f6f2] text-slate-950">
      <section className="relative overflow-hidden bg-[#071225] px-6 py-20 text-white sm:px-8 sm:py-28">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true" style={{ background: 'radial-gradient(circle at 82% 18%, rgba(55,255,224,.14), transparent 28%), radial-gradient(circle at 12% 88%, rgba(255,147,18,.2), transparent 30%)' }} />
        <div className="relative mx-auto max-w-6xl">
          <p className="mb-5 text-sm font-bold uppercase tracking-[.18em] text-[#FFC46B]">Capabilities</p>
          <h1 className="max-w-5xl text-balance text-4xl font-black text-white sm:text-6xl">Practical engineering for the work behind your business.</h1>
          <p className="mx-0 mt-6 max-w-3xl text-lg text-slate-200">Explore the kinds of problems we can help solve, from customer-facing websites to the internal systems that support delivery.</p>
        </div>
      </section>

      <section className="px-6 py-20 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 grid gap-6 lg:grid-cols-[.75fr_1.25fr]">
            <div><p className="mb-3 text-sm font-bold uppercase tracking-[.16em] text-[#B55B00]">What we can build</p><h2 className="text-3xl font-black sm:text-4xl">Five useful starting points.</h2></div>
            <p className="mx-0 text-lg text-slate-600">These are capability examples with potential scope and validation plans. They are not client case studies or claims of measured business results.</p>
          </div>
          <div className="grid gap-5 lg:grid-cols-3">
            {caseStudies.map((study) => (
              <Link key={study.slug} href={`/case-studies/${study.slug}`} className="group flex min-h-[390px] flex-col rounded-3xl border border-slate-200 bg-white p-7 shadow-[0_14px_50px_rgba(15,23,42,.05)]">
                <div className="flex items-start justify-between gap-4"><p className="mx-0 text-xs font-bold uppercase tracking-[.15em] text-[#B55B00]">{study.category}</p><span className="rounded-full bg-[#fff1df] px-3 py-1 text-right text-[11px] font-bold text-[#8F4700]">{study.evidenceLabel}</span></div>
                <p className="mx-0 mt-9 text-3xl font-black text-slate-950">{study.featuredResult}</p>
                <p className="mx-0 mt-2 text-xs text-slate-500">{study.featuredResultLabel}</p>
                <h2 className="mt-7 text-balance text-2xl font-black">{study.title}</h2>
                <p className="mx-0 mt-4 flex-1 text-sm text-slate-600">{study.summary}</p>
                <span className="mt-8 inline-flex items-center gap-2 font-semibold text-[#8F4700]">Explore the approach<ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white px-6 py-20 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-7 lg:grid-cols-[.75fr_1.25fr]"><h2 className="text-3xl font-black sm:text-4xl">Experience with clear boundaries.</h2><p className="mx-0 text-lg text-slate-600">The examples draw on general engineering experience. Client identities, private project details, and unverified performance numbers are not published.</p></div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">{evidenceStandards.map(([title, body]) => <article key={title} className="rounded-2xl bg-[#f7f6f2] p-6"><CheckCircle2 className="mb-5 h-5 w-5 text-[#C96800]" /><h3 className="text-xl font-bold">{title}</h3><p className="mx-0 mt-3 text-sm text-slate-600">{body}</p></article>)}</div>
        </div>
      </section>

      <section className="bg-[#071225] px-6 py-16 text-white sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div><p className="mb-2 text-sm font-bold uppercase tracking-[.15em] text-[#FFC46B]">Your system</p><h2 className="max-w-3xl text-3xl font-black text-white">Define the result and evidence before choosing the implementation.</h2></div>
          <TrackedLink href="/book?source=results" source="results:final" className="rounded-full bg-[#FF9312] px-6 py-3 font-semibold text-slate-950">Discuss your project</TrackedLink>
        </div>
      </section>
    </main>
  );
}
