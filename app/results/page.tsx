import PublicHero from '@/components/growth/PublicHero';
import publicStyles from '@/components/growth/PublicPage.module.css';
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
    <main id="main-content" className={`${publicStyles.page} ${publicStyles.legacy} bg-[#17141f] text-[#faf9fc]`}>
            <PublicHero eyebrow="Capabilities" title="Practical engineering for the work behind your business." description="Explore the kinds of problems we can help solve, from customer-facing websites to the internal systems that support delivery." breadcrumbs={[{label:'Home',href:'/'},{label:'Capabilities'}]} />

      <section className="px-6 py-20 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 grid gap-6 lg:grid-cols-[.75fr_1.25fr]">
            <div><p className="mb-3 text-sm font-bold uppercase tracking-[.16em] text-[#c4abe3]">What we can build</p><h2 className="text-3xl font-medium sm:text-4xl">Five useful starting points.</h2></div>
            <p className="mx-0 text-lg text-[#c0b5cc]">These are capability examples with potential scope and validation plans. They are not client case studies or claims of measured business results.</p>
          </div>
          <div className="grid gap-5 lg:grid-cols-3">
            {caseStudies.map((study) => (
              <Link key={study.slug} href={`/case-studies/${study.slug}`} className="group flex min-h-[390px] flex-col rounded-[2px] border border-[#d2caeb]/16 bg-[#211c2c] p-7 shadow-[0_14px_50px_rgba(15,23,42,.05)]">
                <div className="flex items-start justify-between gap-4"><p className="mx-0 text-xs font-bold uppercase tracking-[.15em] text-[#c4abe3]">{study.category}</p><span className="rounded-[2px] bg-[#30263d] px-3 py-1 text-right text-[11px] font-bold text-[#e1c7f2]">{study.evidenceLabel}</span></div>
                <p className="mx-0 mt-9 text-3xl font-medium text-[#faf9fc]">{study.featuredResult}</p>
                <p className="mx-0 mt-2 text-xs text-[#b4a3c5]">{study.featuredResultLabel}</p>
                <h2 className="mt-7 text-balance text-2xl font-medium">{study.title}</h2>
                <p className="mx-0 mt-4 flex-1 text-sm text-[#c0b5cc]">{study.summary}</p>
                <span className="mt-8 inline-flex items-center gap-2 font-semibold text-[#e1c7f2]">Explore the approach<ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-[#d2caeb]/16 bg-[#211c2c] px-6 py-20 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-7 lg:grid-cols-[.75fr_1.25fr]"><h2 className="text-3xl font-medium sm:text-4xl">Experience with clear boundaries.</h2><p className="mx-0 text-lg text-[#c0b5cc]">The examples draw on general engineering experience. Client identities, private project details, and unverified performance numbers are not published.</p></div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">{evidenceStandards.map(([title, body]) => <article key={title} className="rounded-[2px] bg-[#17141f] p-6"><CheckCircle2 className="mb-5 h-5 w-5 text-[#b4a0ef]" /><h3 className="text-xl font-bold">{title}</h3><p className="mx-0 mt-3 text-sm text-[#c0b5cc]">{body}</p></article>)}</div>
        </div>
      </section>

      <section className="bg-[#211c2c] px-6 py-16 text-white sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div><p className="mb-2 text-sm font-bold uppercase tracking-[.15em] text-[#c4abe3]">Your system</p><h2 className="max-w-3xl text-3xl font-medium text-white">Define the result and evidence before choosing the implementation.</h2></div>
          <TrackedLink href="/book?source=results" source="results:final" className="rounded-[2px] bg-[#574064] px-6 py-3 font-semibold text-[#faf9fc]">Discuss your project</TrackedLink>
        </div>
      </section>
    </main>
  );
}
