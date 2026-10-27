import PublicHero from '@/components/growth/PublicHero';
import publicStyles from '@/components/growth/PublicPage.module.css';
import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import type { CaseStudyContent } from '@/app/lib/proof-content';
import { SITE_URL } from '@/app/lib/growth-content';
import { TrackedLink } from './Analytics';

export default function CaseStudyPage({ study }: { study: CaseStudyContent }) {
  const url = `${SITE_URL}/case-studies/${study.slug}`;
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: study.title,
    description: study.description,
    url,
    provider: { '@type': 'Organization', name: 'OfRoot', url: SITE_URL },
  };

  return (
    <main id="main-content" className={`${publicStyles.page} ${publicStyles.legacy} bg-[#17141f] text-[#faf9fc]`}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <PublicHero eyebrow={`${study.category} · capability example`} title={study.title} description={study.description}
        breadcrumbs={[{label:'Home',href:'/'},{label:'Capabilities',href:'/results'},{label:study.category}]}>
        <p className={publicStyles.note}>Illustrative engineering scope. This is not a client case study or a claim of measured results.</p>
        <aside className={`${publicStyles.card} mt-8 max-w-xl`}><p className={publicStyles.eyebrow}>{study.evidenceLabel}</p><p className="text-2xl text-white">{study.featuredResult}</p><p>{study.featuredResultLabel}</p></aside>
      </PublicHero>

      <section className="px-6 py-16 sm:px-8">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[.7fr_1.3fr]">
          <p className="mx-0 text-sm font-bold uppercase tracking-[.16em] text-[#c4abe3]">The approach</p>
          <p className="mx-0 text-balance text-2xl font-semibold leading-snug text-[#e0d8e9] sm:text-3xl">{study.summary}</p>
        </div>
      </section>

      <section className="border-y border-[#d2caeb]/16 bg-[#211c2c] px-6 py-20 sm:px-8">
        <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-3">
          {[
            ['Context', study.context],
            ['Problem', study.problem],
            ['Constraints', study.constraints],
          ].map(([title, body]) => (
            <article key={title} className="rounded-[2px] border border-[#d2caeb]/16 p-6">
              <h2 className="text-xl font-medium">{title}</h2>
              <p className="mx-0 mt-4 text-sm leading-relaxed text-[#c0b5cc]">{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="px-6 py-20 sm:px-8">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2">
          <div>
            <p className="mb-3 text-sm font-bold uppercase tracking-[.16em] text-[#c4abe3]">Implementation</p>
            <h2 className="text-3xl font-medium sm:text-4xl">How we approach the work.</h2>
            <ul className="mt-8 space-y-4">{study.approach.map(item => <li key={item} className="flex gap-3 text-[#c9bed5]"><CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-[#b4a0ef]" />{item}</li>)}</ul>
          </div>
          <div className="rounded-[2px] bg-[#211c2c] p-7 text-white sm:p-9">
            <p className="mb-3 text-sm font-bold uppercase tracking-[.16em] text-[#c4abe3]">Validation plan</p>
            <h2 className="text-3xl font-medium text-white">What we would validate.</h2>
            <ul className="mt-8 space-y-4">{study.outcomes.map(item => <li key={item} className="flex gap-3 text-slate-200"><span aria-hidden="true" className="text-[#b4a0ef]">→</span>{item}</li>)}</ul>
          </div>
        </div>
      </section>

      <section className="border-y border-[#d2caeb]/16 bg-[#211c2c] px-6 py-16 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-medium">Potential deliverables</h2>
          <div className="mt-7 grid gap-3 md:grid-cols-3">{study.delivered.map(item => <div key={item} className="rounded-[2px] border border-[#d2caeb]/16 bg-[#211c2c] p-5 text-sm font-semibold text-[#c9bed5]">{item}</div>)}</div>
        </div>
      </section>

      <section className="bg-[#211c2c] px-6 py-16 text-white sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
          <div><p className="mb-2 text-sm font-bold uppercase tracking-[.15em] text-[#c4abe3]">Apply the pattern</p><h2 className="max-w-3xl text-3xl font-medium text-white">Start with the workflow that carries the clearest business risk.</h2></div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <TrackedLink href="/book?source=case-study" source={`case-study:${study.slug}`} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[2px] bg-[#574064] px-6 py-3 font-semibold text-[#faf9fc]">Discuss your project<ArrowRight className="h-4 w-4" /></TrackedLink>
            <Link href={study.relatedService.href} className="inline-flex min-h-12 items-center justify-center rounded-[2px] border border-white/20 px-6 py-3 font-semibold text-white">Explore {study.relatedService.label}</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
