import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Check, CircleDollarSign, Clock3, Network, Sparkles } from 'lucide-react';
import JsonLd from '@/components/seo/JsonLd';
import { PageView, TrackedLink } from '@/components/growth/Analytics';
import { CANONICAL_SITE_URL, SITE } from '@/app/config/site';
import {
  AI_PROCESS_AUDIT_DELIVERABLES,
  AI_PROCESS_FAQS,
  AI_PROCESS_IMPLEMENTATION_EXAMPLES,
  AI_PROCESS_PHASES,
} from '@/app/lib/ai-process';
import { AI_PROCESS_GUIDE } from '@/app/lib/ai-process-guide';

const title = 'AI Process Audit and Implementation';
const description = 'Find expensive manual work, calculate its business cost, rank AI and automation opportunities, and build the systems with the clearest financial return.';

export const metadata: Metadata = {
  title,
  description,
  keywords: ['AI process audit', 'business process automation', 'AI implementation', 'automation ROI', 'workflow audit'],
  alternates: { canonical: '/ai-process' },
  openGraph: { title, description, url: `${CANONICAL_SITE_URL}/ai-process`, type: 'website' },
  twitter: { card: 'summary_large_image', title, description },
};

const problems = [
  'Duplicated data entry', 'Delayed lead follow-up', 'Manual reporting',
  'Repetitive document creation', 'Disconnected CRM workflows',
  'Inconsistent customer onboarding', 'Missed internal handoffs',
] as const;

export default function AiProcessPage() {
  const breadcrumbs = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${CANONICAL_SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'AI Process', item: `${CANONICAL_SITE_URL}/ai-process` },
    ],
  };
  const service = {
    '@context': 'https://schema.org', '@type': 'Service', name: 'AI Process Audit',
    provider: { '@type': 'Organization', name: SITE.name, url: SITE.url, sameAs: SITE.socials },
    areaServed: 'US', url: `${CANONICAL_SITE_URL}/ai-process`,
    serviceType: ['Business process audit', 'AI opportunity assessment', 'Automation roadmap', 'AI implementation'],
    description,
  };
  const faqSchema = {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: AI_PROCESS_FAQS.map((faq) => ({
      '@type': 'Question', name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };
  const primaryCta = 'inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#FF9312] px-6 py-3 font-extrabold text-slate-950 shadow-[0_12px_30px_rgba(255,147,18,.22)] transition hover:-translate-y-0.5 hover:bg-[#ffad42] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#37FFE0] focus-visible:ring-offset-2 focus-visible:ring-offset-[#071225] motion-reduce:transform-none';

  return (
    <main id="main-content" className="bg-[#f7f6f2] text-slate-950">
      <JsonLd data={[breadcrumbs, service, faqSchema]} />
      <PageView kind="ai_process" name="public" />

      <section className="relative isolate overflow-hidden bg-[#071225] px-6 py-20 text-white sm:px-8 sm:py-28">
        <div className="absolute inset-0 -z-10 opacity-70 [background:radial-gradient(circle_at_80%_20%,rgba(55,255,224,.14),transparent_34%),radial-gradient(circle_at_20%_90%,rgba(255,147,18,.16),transparent_32%)]" />
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.2fr_.8fr] lg:items-end">
          <div>
            <p className="mb-5 text-sm font-bold uppercase tracking-[.2em] text-[#FFC46B]">AI process audits and implementation</p>
            <h1 className="max-w-5xl text-balance text-5xl font-black leading-[.98] text-white sm:text-7xl">Find the expensive work hiding inside your business.</h1>
            <p className="mx-0 mt-7 max-w-3xl text-lg text-slate-200 sm:text-xl">OfRoot maps your workflows, calculates the cost of manual work, and builds the AI and automation systems with the clearest financial return.</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <TrackedLink href="/book?focus=ai-process-audit&source=ai-process-hero" source="ai-process:hero" event="ai_process_audit_cta_clicked" className={primaryCta}>Book an AI Process Audit<ArrowRight className="h-4 w-4" /></TrackedLink>
              <TrackedLink href="#process" source="ai-process:hero-process" event="secondary_cta_clicked" className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/25 px-6 py-3 font-bold text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#37FFE0]">See the process</TrackedLink>
            </div>
          </div>
          <div className="rounded-3xl border border-white/15 bg-white/[.06] p-6 backdrop-blur-sm sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[.18em] text-[#37FFE0]">The decision before the software</p>
            <p className="mx-0 mt-4 text-2xl font-black text-white">Which process is worth changing first?</p>
            <div className="mt-7 space-y-4 text-sm text-slate-200">
              <p className="flex gap-3"><Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-[#FFC46B]" />Measure recurring time and delay.</p>
              <p className="flex gap-3"><CircleDollarSign className="mt-0.5 h-5 w-5 shrink-0 text-[#FFC46B]" />Translate the work into annual cost.</p>
              <p className="flex gap-3"><Network className="mt-0.5 h-5 w-5 shrink-0 text-[#FFC46B]" />Rank the opportunities before building.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-16 sm:px-8 sm:py-24" aria-labelledby="problem-heading">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr]">
            <div>
              <p className="mb-3 text-sm font-bold uppercase tracking-[.16em] text-[#9A4D00]">Start with the work</p>
              <h2 id="problem-heading" className="text-balance text-4xl font-black sm:text-5xl">Most companies do not need more software.</h2>
              <p className="mx-0 mt-5 text-lg text-slate-600">They need cleaner processes, connected systems, and fewer manual handoffs. The audit makes the operating problem visible before anyone chooses a tool.</p>
              <Link href={AI_PROCESS_GUIDE.href} className="mt-6 inline-flex items-center gap-2 font-bold text-[#8F4700] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B55B00] focus-visible:ring-offset-4">Read how to find the right work first<ArrowRight className="h-4 w-4" /></Link>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2" aria-label="Common process problems">
              {problems.map((problem) => <li key={problem} className="flex min-h-16 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 font-semibold shadow-sm"><span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#FF9312]" aria-hidden="true" />{problem}</li>)}
            </ul>
          </div>
        </div>
      </section>

      <section id="process" className="scroll-mt-24 bg-white px-6 py-16 sm:px-8 sm:py-24" aria-labelledby="process-heading">
        <div className="mx-auto max-w-6xl">
          <p className="mb-3 text-sm font-bold uppercase tracking-[.16em] text-[#9A4D00]">Five evidence-backed phases</p>
          <h2 id="process-heading" className="max-w-4xl text-balance text-4xl font-black sm:text-5xl">From operating friction to measured improvement.</h2>
          <div className="mt-12 divide-y divide-slate-200 border-y border-slate-200">
            {AI_PROCESS_PHASES.map((phase) => (
              <article key={phase.id} data-ai-public-phase={phase.id} className="grid gap-6 py-8 md:grid-cols-[8rem_1fr_1fr] md:py-10">
                <p className="mx-0 font-mono text-sm font-bold text-[#9A4D00]">0{phase.number}</p>
                <div><h3 className="text-3xl font-black">{phase.title}</h3><p className="mx-0 mt-3 text-slate-600">{phase.description}</p></div>
                <ul className="space-y-2 text-sm font-semibold text-slate-700">{phase.deliverables.map((item) => <li key={item} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />{item}</li>)}</ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-16 sm:px-8 sm:py-24" aria-labelledby="deliverables-heading">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[.8fr_1.2fr]">
          <div><p className="mb-3 text-sm font-bold uppercase tracking-[.16em] text-[#9A4D00]">Audit deliverables</p><h2 id="deliverables-heading" className="text-balance text-4xl font-black">A decision package your team can use.</h2><p className="mx-0 mt-5 text-slate-600">The audit separates observed facts, working assumptions, and recommendations so the roadmap can be reviewed before implementation begins.</p></div>
          <ul className="grid gap-3 sm:grid-cols-2">{AI_PROCESS_AUDIT_DELIVERABLES.map((item) => <li key={item} className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-4 font-semibold"><Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />{item}</li>)}</ul>
        </div>
      </section>

      <section className="bg-[#071225] px-6 py-16 text-white sm:px-8 sm:py-24" aria-labelledby="roi-heading">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
          <div><p className="mb-3 text-sm font-bold uppercase tracking-[.16em] text-[#FFC46B]">Illustrative example — not a customer result</p><h2 id="roi-heading" className="text-balance text-4xl font-black text-white">Make the value assumption inspectable.</h2><p className="mx-0 mt-5 text-slate-300">Actual outcomes depend on the client’s data, systems, adoption, and process quality.</p></div>
          <dl className="grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 sm:grid-cols-2">
            {[['Reporting work', '10 hours / week'], ['Loaded labor cost', '$50 / hour'], ['Estimated annual manual cost', '$26,000'], ['Potentially automatable', '70%'], ['Estimated annual opportunity', '$18,200']].map(([term, value], index) => <div key={term} className={`bg-[#0b172b] p-6 ${index === 4 ? 'sm:col-span-2' : ''}`}><dt className="text-sm text-slate-400">{term}</dt><dd className="mt-2 text-2xl font-black text-white">{value}</dd></div>)}
          </dl>
        </div>
      </section>

      <section className="bg-white px-6 py-16 sm:px-8 sm:py-24" aria-labelledby="implement-heading">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl"><p className="mb-3 text-sm font-bold uppercase tracking-[.16em] text-[#9A4D00]">What we may implement</p><h2 id="implement-heading" className="text-balance text-4xl font-black">The recommendation follows the process.</h2><p className="mx-0 mt-5 text-slate-600">The answer may be automation, AI, an integration, or a simpler operating rule. The audit determines the smallest reliable intervention.</p></div>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{AI_PROCESS_IMPLEMENTATION_EXAMPLES.map((item) => <li key={item} className="flex min-h-24 items-start gap-3 rounded-2xl border border-slate-200 bg-[#f7f6f2] p-5 font-bold"><Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-[#9A4D00]" />{item}</li>)}</ul>
        </div>
      </section>

      <section className="px-6 py-16 sm:px-8 sm:py-24" aria-labelledby="faq-heading">
        <div className="mx-auto max-w-4xl"><p className="mb-3 text-sm font-bold uppercase tracking-[.16em] text-[#9A4D00]">FAQ</p><h2 id="faq-heading" className="text-4xl font-black">Questions before the audit.</h2><div className="mt-10 divide-y divide-slate-300 border-y border-slate-300">{AI_PROCESS_FAQS.map((faq) => <article key={faq.question} className="py-7"><h3 className="text-xl font-black">{faq.question}</h3><p className="mx-0 mt-3 text-slate-600">{faq.answer}</p></article>)}</div></div>
      </section>

      <section className="bg-[#071225] px-6 py-16 text-white sm:px-8 sm:py-20">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 lg:flex-row lg:items-end lg:justify-between"><div><p className="mb-3 text-sm font-bold uppercase tracking-[.16em] text-[#FFC46B]">Start with evidence</p><h2 className="max-w-4xl text-balance text-4xl font-black text-white sm:text-5xl">Turn manual work into measurable capacity.</h2><p className="mx-0 mt-5 max-w-3xl text-slate-300">Start with a structured audit. Leave with a ranked roadmap, clear ROI assumptions, and a practical implementation plan.</p></div><TrackedLink href="/book?focus=ai-process-audit&source=ai-process-final" source="ai-process:final" event="ai_process_audit_cta_clicked" className={`${primaryCta} shrink-0`}>Book an AI Process Audit<ArrowRight className="h-4 w-4" /></TrackedLink></div>
      </section>

    </main>
  );
}
