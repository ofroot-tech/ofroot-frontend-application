import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { generateOrganizationSchema, generatePricingSchema } from '@/app/lib/schemas';
import { growthMetadata } from '@/app/lib/growth-content';
import { PageView, TrackedLink, TrackedSection } from '@/components/growth/Analytics';

export const metadata = growthMetadata(
  'AI Growth Systems Engagements and Pricing',
  'Review OfRoot engagement models for AI discoverability, revenue automation, private company AI, and ongoing growth-system optimization.',
  '/pricing',
);

const packages = [
  {
    name: 'AI Visibility Foundation',
    price: 'Scoped after audit',
    cadence: 'focused foundation',
    bestFor: 'Companies that need a clear discoverability baseline before investing in content or technical changes.',
    outcome: 'A prioritized implementation plan connecting search visibility, answer readiness, authority, and conversion.',
    points: ['AI visibility and technical assessment', 'Search-intent and content architecture', 'Schema, entity, and internal-linking plan', 'Measurement and conversion baseline'],
    cta: 'Book a Discoverability Audit',
    href: '/book?focus=discoverability&source=pricing',
  },
  {
    name: 'Growth Systems Build',
    price: 'From $3,500',
    cadence: 'one-time starting scope',
    bestFor: 'Teams with one visible conversion or automation bottleneck that needs a production-ready fix.',
    outcome: 'A scoped build connecting demand capture, routing, follow-up, reporting, or another priority workflow.',
    points: ['Current-state workflow and ownership map', 'One priority production implementation path', 'Validation, failure handling, and monitoring', 'Launch checklist and operator handoff'],
    cta: 'Scope a Growth Systems Build',
    href: '/book?focus=automation&source=pricing',
    featured: true,
  },
  {
    name: 'Company Intelligence System',
    price: 'Custom scope',
    cadence: 'milestone-based',
    bestFor: 'Organizations connecting approved documents, code, systems, and workflows to a permission-aware AI workspace.',
    outcome: 'A company-specific AI system designed around source access, user roles, citations, and measurable use.',
    points: ['Source, permission, and use-case mapping', 'Retrieval and answer-quality evaluation', 'Branded workspace and source citations', 'Audit logging, usage measures, and improvement plan'],
    cta: 'Plan a Company AI System',
    href: '/book?focus=private-ai&source=pricing',
  },
  {
    name: 'Ongoing Optimization',
    price: 'From $6,000',
    cadence: 'per month',
    bestFor: 'Teams operating multiple acquisition, automation, or AI workflows that need continuous ownership.',
    outcome: 'A measured operating cadence for improving visibility, conversion, reliability, and company-AI adoption.',
    points: ['Prioritized monthly implementation roadmap', 'Monitoring and workflow reliability', 'Content, conversion, and automation optimization', 'Weekly operator review and evidence tracking'],
    cta: 'Discuss Ongoing Ownership',
    href: '/book?focus=ongoing-optimization&source=pricing',
  },
];

const faq = [
  {
    question: 'Why is only some pricing published?',
    answer: 'The existing entry points are a focused build starting at $3,500 and ongoing ownership starting at $6,000 per month. Discoverability and private company AI depend more heavily on source quality, access rules, content volume, and implementation complexity, so those are scoped after the audit.',
  },
  {
    question: 'Can we start with one layer?',
    answer: 'Yes. Begin with the bottleneck that has the clearest business cost. The architecture should still account for how discovery, conversion, and operations connect later.',
  },
  {
    question: 'What is included before implementation?',
    answer: 'OfRoot maps the current system, ownership boundaries, measurable outcome, dependencies, and release risk before committing to the build plan.',
  },
  {
    question: 'What happens after launch?',
    answer: 'A focused build can end with documentation and handoff, or continue through ongoing optimization when the system needs monitoring, iteration, and operational ownership.',
  },
];

export default function PricingPage() {
  return (
    <main id="main-content" className="bg-[#f7f6f2] text-slate-950">
      <PageView kind="pricing" name="engagement_models" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(generatePricingSchema()) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(generateOrganizationSchema()) }} />

      <section className="relative overflow-hidden bg-[#071225] px-6 py-20 text-white sm:px-8 sm:py-28">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true" style={{ background: 'radial-gradient(circle at 82% 18%, rgba(55,255,224,.14), transparent 28%), radial-gradient(circle at 12% 88%, rgba(255,147,18,.2), transparent 30%)' }} />
        <div className="relative mx-auto max-w-6xl">
          <p className="mb-5 text-sm font-bold uppercase tracking-[.18em] text-[#FFC46B]">Engagements</p>
          <h1 className="max-w-5xl text-balance text-4xl font-black text-white sm:text-6xl">Choose the smallest engagement that can change the business outcome.</h1>
          <p className="mx-0 mt-6 max-w-3xl text-lg text-slate-200">Start with a focused foundation, a production build, a company intelligence system, or ongoing optimization. Final scope follows the system complexity and evidence required.</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row"><TrackedLink href="/book?source=pricing-hero" source="pricing:hero" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#FF9312] px-6 py-3 font-semibold text-slate-950">Book a Growth Systems Audit<ArrowRight className="h-4 w-4" /></TrackedLink><TrackedLink href="#engagements" source="pricing:compare" event="secondary_cta_clicked" className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/25 px-6 py-3 font-semibold text-white">Compare engagements</TrackedLink></div>
        </div>
      </section>

      <TrackedSection className="px-6 py-20 sm:px-8">
        <div id="engagements" className="mx-auto max-w-6xl scroll-mt-24">
          <div className="mb-10 grid gap-6 lg:grid-cols-[.75fr_1.25fr]"><div><p className="mb-3 text-sm font-bold uppercase tracking-[.16em] text-[#B55B00]">Starting points</p><h2 className="text-3xl font-black sm:text-4xl">Clear enough to budget. Flexible enough to fit the system.</h2></div><p className="mx-0 text-lg text-slate-600">Published ranges are starting anchors, not fixed bids. The audit establishes dependencies, implementation risk, and the measurable result before final scope.</p></div>
          <div className="grid gap-5 lg:grid-cols-2">
            {packages.map((item) => (
              <article key={item.name} className={`relative flex flex-col rounded-3xl border p-7 ${item.featured ? 'border-[#FF9312] bg-[#071225] text-white shadow-[0_20px_70px_rgba(7,18,37,.18)]' : 'border-slate-200 bg-white'}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <p className={`mx-0 text-xs font-bold uppercase tracking-[.15em] ${item.featured ? 'text-[#FFC46B]' : 'text-[#B55B00]'}`}>{item.name}</p>
                  {item.featured && <span className="rounded-full bg-[#FF9312] px-3 py-1 text-xs font-bold text-slate-950">Focused starting point</span>}
                </div>
                <div className="mt-8"><p className={`mx-0 text-3xl font-black ${item.featured ? 'text-white' : 'text-slate-950'}`}>{item.price}</p><p className={`mx-0 mt-1 text-xs ${item.featured ? 'text-slate-400' : 'text-slate-500'}`}>{item.cadence}</p></div>
                <div className="mt-7 space-y-5"><div><h3 className={`text-sm font-bold ${item.featured ? 'text-white' : 'text-slate-950'}`}>Best for</h3><p className={`mx-0 mt-2 text-sm ${item.featured ? 'text-slate-300' : 'text-slate-600'}`}>{item.bestFor}</p></div><div><h3 className={`text-sm font-bold ${item.featured ? 'text-white' : 'text-slate-950'}`}>Business outcome</h3><p className={`mx-0 mt-2 text-sm ${item.featured ? 'text-slate-300' : 'text-slate-600'}`}>{item.outcome}</p></div></div>
                <ul className="mt-7 flex-1 space-y-3">{item.points.map(point => <li key={point} className={`flex gap-3 text-sm ${item.featured ? 'text-slate-200' : 'text-slate-700'}`}><CheckCircle2 className={`mt-0.5 h-4 w-4 shrink-0 ${item.featured ? 'text-[#37FFE0]' : 'text-[#C96800]'}`} />{point}</li>)}</ul>
                <TrackedLink href={item.href} source={`pricing:${item.name.toLowerCase().replaceAll(' ', '_')}`} className={`mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 py-3 font-semibold ${item.featured ? 'bg-[#FF9312] text-slate-950' : 'bg-slate-950 text-white'}`}>{item.cta}<ArrowRight className="h-4 w-4" /></TrackedLink>
              </article>
            ))}
          </div>
        </div>
      </TrackedSection>

      <section className="border-y border-slate-200 bg-white px-6 py-20 sm:px-8">
        <div className="mx-auto max-w-6xl"><div className="grid gap-6 lg:grid-cols-[.75fr_1.25fr]"><h2 className="text-3xl font-black sm:text-4xl">Questions before scope.</h2><p className="mx-0 text-lg text-slate-600">The useful pricing question is not only “what does it cost?” It is also “what must be true for the system to create and preserve value?”</p></div><div className="mt-10 grid gap-4 md:grid-cols-2">{faq.map(item => <details key={item.question} className="rounded-2xl border border-slate-200 p-6"><summary className="cursor-pointer font-bold text-slate-950">{item.question}</summary><p className="mx-0 mt-4 text-sm text-slate-600">{item.answer}</p></details>)}</div></div>
      </section>

      <section className="bg-[#071225] px-6 py-16 text-white sm:px-8"><div className="mx-auto flex max-w-6xl flex-col gap-7 lg:flex-row lg:items-center lg:justify-between"><div><p className="mb-2 text-sm font-bold uppercase tracking-[.15em] text-[#FFC46B]">Recommendation first</p><h2 className="max-w-3xl text-3xl font-black text-white">Bring the bottleneck. Leave with the next useful scope.</h2></div><TrackedLink href="/book?source=pricing-final" source="pricing:final" className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#FF9312] px-6 py-3 font-semibold text-slate-950">Book a Growth Systems Audit</TrackedLink></div></section>
    </main>
  );
}
