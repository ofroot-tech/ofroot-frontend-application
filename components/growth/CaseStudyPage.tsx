import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import type { CaseStudyContent } from '@/app/lib/proof-content';
import { SITE_URL } from '@/app/lib/growth-content';
import { TrackedLink } from './Analytics';

export default function CaseStudyPage({ study }: { study: CaseStudyContent }) {
  const url = `${SITE_URL}/case-studies/${study.slug}`;
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CaseStudy',
    name: study.title,
    description: study.description,
    url,
    provider: { '@type': 'Organization', name: 'OfRoot', url: SITE_URL },
  };

  return (
    <main id="main-content" className="case-study-full-bleed relative left-1/2 w-screen -translate-x-1/2 bg-[#f7f6f2] text-slate-950">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <header className="relative overflow-hidden bg-[#071225] px-6 py-20 text-white sm:px-8 sm:py-28">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true" style={{ background: 'radial-gradient(circle at 82% 18%, rgba(55,255,224,.14), transparent 27%), radial-gradient(circle at 12% 88%, rgba(255,147,18,.2), transparent 30%)' }} />
        <div className="relative mx-auto max-w-6xl">
          <nav aria-label="Breadcrumb" className="mb-10 flex flex-wrap items-center gap-2 text-sm text-slate-400">
            <Link href="/">Home</Link><span aria-hidden="true">/</span><Link href="/results">Results</Link><span aria-hidden="true">/</span><span className="text-white">{study.category}</span>
          </nav>
          <div className="grid gap-10 lg:grid-cols-[1.25fr_.75fr] lg:items-end">
            <div>
              <p className="mb-5 text-sm font-bold uppercase tracking-[.18em] text-[#FFC46B]">{study.category} case study</p>
              <h1 className="max-w-4xl text-balance text-4xl font-black leading-[1.02] text-white sm:text-6xl">{study.title}</h1>
              <p className="mx-0 mt-6 max-w-3xl text-lg text-slate-200">{study.description}</p>
            </div>
            <aside className="rounded-3xl border border-white/10 bg-white/5 p-7">
              <p className="mx-0 text-xs font-bold uppercase tracking-[.15em] text-[#37FFE0]">{study.evidenceLabel}</p>
              <p className="mx-0 mt-5 text-3xl font-black text-white">{study.featuredResult}</p>
              <p className="mx-0 mt-2 text-sm text-slate-300">{study.featuredResultLabel}</p>
            </aside>
          </div>
        </div>
      </header>

      <section className="px-6 py-16 sm:px-8">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[.7fr_1.3fr]">
          <p className="mx-0 text-sm font-bold uppercase tracking-[.16em] text-[#B55B00]">The plain-language result</p>
          <p className="mx-0 text-balance text-2xl font-semibold leading-snug text-slate-800 sm:text-3xl">{study.summary}</p>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white px-6 py-20 sm:px-8">
        <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-3">
          {[
            ['Context', study.context],
            ['Problem', study.problem],
            ['Constraints', study.constraints],
          ].map(([title, body]) => (
            <article key={title} className="rounded-2xl border border-slate-200 p-6">
              <h2 className="text-xl font-black">{title}</h2>
              <p className="mx-0 mt-4 text-sm leading-relaxed text-slate-600">{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="px-6 py-20 sm:px-8">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2">
          <div>
            <p className="mb-3 text-sm font-bold uppercase tracking-[.16em] text-[#B55B00]">Implementation</p>
            <h2 className="text-3xl font-black sm:text-4xl">What changed in the system.</h2>
            <ul className="mt-8 space-y-4">{study.approach.map(item => <li key={item} className="flex gap-3 text-slate-700"><CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-[#C96800]" />{item}</li>)}</ul>
          </div>
          <div className="rounded-3xl bg-[#071225] p-7 text-white sm:p-9">
            <p className="mb-3 text-sm font-bold uppercase tracking-[.16em] text-[#FFC46B]">Observed outcome</p>
            <h2 className="text-3xl font-black text-white">What became easier to operate.</h2>
            <ul className="mt-8 space-y-4">{study.outcomes.map(item => <li key={item} className="flex gap-3 text-slate-200"><span aria-hidden="true" className="text-[#37FFE0]">→</span>{item}</li>)}</ul>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-[#efece5] px-6 py-16 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-black">Delivered system</h2>
          <div className="mt-7 grid gap-3 md:grid-cols-3">{study.delivered.map(item => <div key={item} className="rounded-2xl border border-slate-200 bg-white p-5 text-sm font-semibold text-slate-700">{item}</div>)}</div>
        </div>
      </section>

      <section className="bg-[#071225] px-6 py-16 text-white sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
          <div><p className="mb-2 text-sm font-bold uppercase tracking-[.15em] text-[#FFC46B]">Apply the pattern</p><h2 className="max-w-3xl text-3xl font-black text-white">Start with the workflow that carries the clearest business risk.</h2></div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <TrackedLink href="/book?source=case-study" source={`case-study:${study.slug}`} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#FF9312] px-6 py-3 font-semibold text-slate-950">Book a Growth Systems Audit<ArrowRight className="h-4 w-4" /></TrackedLink>
            <Link href={study.relatedService.href} className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/20 px-6 py-3 font-semibold text-white">Explore {study.relatedService.label}</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
