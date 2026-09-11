import Link from 'next/link';
import { ArrowRight, CheckCircle2, SearchCheck, Network, Bot, Wrench } from 'lucide-react';
import JsonLd from '@/components/seo/JsonLd';
import { SITE } from '@/app/config/site';
import { growthMetadata } from '@/app/lib/growth-content';

export const metadata = growthMetadata(
  'AI Growth and Automation Services',
  'Explore OfRoot services for AI discoverability, revenue automation, and private company AI—organized around measurable business outcomes.',
  '/services',
);

const services = [
  {
    href: '/services/ai-discoverability',
    icon: SearchCheck,
    stage: 'Discover',
    title: 'AI Discoverability',
    problem: 'Your expertise exists, but buyers and AI search systems do not reliably find or cite it.',
    outcome: 'Increase qualified visibility across search, answer engines, and AI-assisted research.',
    includes: ['Technical and AI visibility assessment', 'Content and answer architecture', 'Schema, entity, authority, and conversion improvements'],
    startingPoint: 'Scoped after audit',
  },
  {
    href: '/services/automation-systems',
    icon: Network,
    stage: 'Convert',
    title: 'Automation Systems',
    problem: 'Leads, context, and accountability disappear between forms, inboxes, CRM records, and follow-up.',
    outcome: 'Create a traceable revenue workflow that responds faster and loses fewer opportunities.',
    includes: ['Lead capture, qualification, and routing', 'CRM, API, and workflow integrations', 'Monitoring, failure handling, and reporting'],
    startingPoint: 'Builds from $3,500',
  },
  {
    href: '/services/private-company-ai',
    icon: Bot,
    stage: 'Operate',
    title: 'Private Company AI',
    problem: 'Teams repeatedly search for answers across documents, software, code, and internal experts.',
    outcome: 'Make approved company knowledge usable through permission-aware, source-backed AI.',
    includes: ['Knowledge and system connections', 'Access rules, citations, and approvals', 'Branded assistants, evaluation, and usage measurement'],
    startingPoint: 'Custom scope',
  },
];

const buyingSignals = [
  ['Choose AI Discoverability when…', 'Relevant buyers cannot consistently find you, search impressions are not turning into clicks, or your company is absent from AI-generated answers.'],
  ['Choose Automation Systems when…', 'Lead response is slow, CRM data is unreliable, staff copy information between tools, or pipeline handoffs fail silently.'],
  ['Choose Private Company AI when…', 'Employees lose time finding internal answers, knowledge is scattered, or teams need controlled AI assistance grounded in company sources.'],
];

export default function ServicesIndexPage() {
  return (
    <main id="main-content" className="pb-8">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'OfRoot Services',
          url: `${SITE.url}/services`,
          mainEntity: {
            '@type': 'ItemList',
            itemListElement: services.map((service, index) => ({
              '@type': 'Service',
              position: index + 1,
              name: service.title,
              description: service.outcome,
              url: `${SITE.url}${service.href}`,
              provider: { '@type': 'Organization', name: SITE.name, url: SITE.url },
            })),
          },
        }}
      />

      <header className="rounded-3xl bg-[#071225] px-6 py-14 text-white sm:px-10 sm:py-20">
        <p className="text-sm font-bold uppercase tracking-[.18em] text-[#FFC46B]">Discover → Convert → Operate</p>
        <h1 className="mt-4 max-w-4xl text-balance text-4xl font-black text-white sm:text-6xl">Three services tied to the way your business grows.</h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">OfRoot fixes the system between visibility, revenue conversion, and company execution. Start with the bottleneck that has the clearest cost; expand only when the evidence supports it.</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/book?source=services-hero" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#FF9312] px-6 py-3 font-semibold text-slate-950">Book a Growth Systems Audit <ArrowRight className="h-4 w-4" /></Link>
          <Link href="/pricing" className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/25 px-6 py-3 font-semibold text-white">Review starting ranges</Link>
        </div>
      </header>

      <section className="py-16" aria-labelledby="service-lines">
        <div className="grid gap-6 lg:grid-cols-[.72fr_1.28fr]">
          <div>
            <p className="text-sm font-bold uppercase tracking-[.16em] text-[#B55B00]">How we can help</p>
            <h2 id="service-lines" className="mt-3 text-3xl font-black sm:text-4xl">A clear offer for each operating problem.</h2>
          </div>
          <p className="text-lg text-slate-600">Each engagement starts with the desired business outcome, then defines the systems, evidence, ownership, and safeguards required to produce it.</p>
        </div>

        <div className="mt-10 grid gap-5">
          {services.map(({ href, icon: Icon, stage, title, problem, outcome, includes, startingPoint }, index) => (
            <article key={href} className="grid gap-7 rounded-3xl border border-slate-200 bg-white p-7 shadow-[0_16px_50px_rgba(15,23,42,.05)] lg:grid-cols-[.7fr_1.3fr] lg:p-9">
              <div>
                <div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FFF1DF] text-[#A94F00]"><Icon className="h-5 w-5" /></span><span className="text-xs font-bold uppercase tracking-[.16em] text-slate-500">0{index + 1} · {stage}</span></div>
                <h3 className="mt-6 text-3xl font-black">{title}</h3>
                <p className="mt-3 text-sm font-semibold text-[#8F4700]">{startingPoint}</p>
                <Link href={href} className="mt-6 inline-flex items-center gap-2 font-bold text-[#8F4700]">Explore the service <ArrowRight className="h-4 w-4" /></Link>
              </div>
              <div className="grid gap-6 sm:grid-cols-2">
                <div><h4 className="text-sm font-bold uppercase tracking-[.12em] text-slate-500">The problem</h4><p className="mt-3 text-sm leading-6 text-slate-700">{problem}</p><h4 className="mt-6 text-sm font-bold uppercase tracking-[.12em] text-slate-500">The outcome</h4><p className="mt-3 text-sm leading-6 text-slate-700">{outcome}</p></div>
                <div><h4 className="text-sm font-bold uppercase tracking-[.12em] text-slate-500">Typical scope</h4><ul className="mt-3 space-y-3">{includes.map(item => <li key={item} className="flex gap-3 text-sm leading-6 text-slate-700"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#0C7162]" />{item}</li>)}</ul></div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-3xl bg-[#efece5] px-6 py-12 sm:px-10" aria-labelledby="qualification">
        <div className="grid gap-6 lg:grid-cols-[.72fr_1.28fr]">
          <div><p className="text-sm font-bold uppercase tracking-[.16em] text-[#B55B00]">Choose your starting point</p><h2 id="qualification" className="mt-3 text-3xl font-black">Know where to start.</h2></div>
          <div className="space-y-4">{buyingSignals.map(([title, body]) => <div key={title} className="rounded-2xl bg-white p-6"><h3 className="font-black">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{body}</p></div>)}</div>
        </div>
      </section>

      <section className="py-16" aria-labelledby="free-tools">
        <div className="grid gap-8 lg:grid-cols-[.72fr_1.28fr]">
          <div><Wrench className="h-7 w-7 text-[#A94F00]" /><p className="mt-5 text-sm font-bold uppercase tracking-[.16em] text-[#B55B00]">Free diagnostic tools</p><h2 id="free-tools" className="mt-3 text-3xl font-black">Start with evidence.</h2></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Link href="/services/ai-audit" className="rounded-2xl border border-slate-200 bg-white p-6 hover:border-[#FF9312]"><h3 className="text-xl font-black">AI Website Readiness Scanner</h3><p className="mt-3 text-sm leading-6 text-slate-600">Enter a public URL and receive a technical readiness score, evidence, and prioritized fixes powered by Ora.</p><span className="mt-5 inline-flex items-center gap-2 font-bold text-[#8F4700]">Scan a website <ArrowRight className="h-4 w-4" /></span></Link>
            <Link href="/ai-agent-readiness-assessment" className="rounded-2xl border border-slate-200 bg-white p-6 hover:border-[#FF9312]"><h3 className="text-xl font-black">Business AI Agent Assessment</h3><p className="mt-3 text-sm leading-6 text-slate-600">Answer 12 questions about workflow, data, permissions, controls, measurement, and ownership.</p><span className="mt-5 inline-flex items-center gap-2 font-bold text-[#8F4700]">Assess the organization <ArrowRight className="h-4 w-4" /></span></Link>
          </div>
        </div>
      </section>

      <section className="rounded-3xl bg-[#071225] px-6 py-12 text-white sm:px-10">
        <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between"><div><p className="text-sm font-bold uppercase tracking-[.16em] text-[#FFC46B]">Start with your priority</p><h2 className="mt-3 max-w-3xl text-3xl font-black text-white">Bring the bottleneck. We will identify the smallest useful engagement.</h2></div><Link href="/book?source=services-final" className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-[#FF9312] px-6 py-3 font-semibold text-slate-950">Book a Growth Systems Audit <ArrowRight className="h-4 w-4" /></Link></div>
      </section>
    </main>
  );
}
