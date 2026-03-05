import { Metadata } from 'next';
import Link from 'next/link';
import PrimaryCta from '@/components/ui/PrimaryCta';
import { generateOrganizationSchema, generatePricingSchema } from '@/app/lib/schemas';

export const metadata: Metadata = {
  title: 'Pricing | OfRoot Integrations',
  description:
    'Integration pricing for HubSpot, Meta API, Make, Zapier, and agent workflows. Choose a sprint, monthly partner model, or enterprise engagement.',
  keywords: [
    'integration pricing',
    'HubSpot integration cost',
    'Meta API pricing',
    'Make.com automation pricing',
    'Zapier automation pricing',
    'agent integration consulting',
  ],
  openGraph: {
    title: 'Pricing | OfRoot Integrations',
    description:
      'Choose an integration sprint, a monthly partner engagement, or enterprise implementation for lead and automation systems.',
    url: 'https://ofroot.technology/pricing',
    type: 'website',
  },
};

const packages = [
  {
    name: 'Integration Sprint',
    price: 'From $3,500',
    cadence: 'one-time',
    summary: 'For one priority workflow that must be fixed quickly.',
    points: [
      'Audit current lead flow and failure points',
      'Implement one production-ready integration path',
      'Validation, dedupe, and error handling',
      'Launch checklist and handoff docs',
    ],
    cta: 'Book sprint scoping call',
    href: '/consulting/book',
  },
  {
    name: 'Monthly Integration Partner',
    price: 'From $6,000',
    cadence: '/month',
    summary: 'Best for teams running ongoing campaigns and multiple systems.',
    points: [
      'HubSpot, Meta, Make, Zapier, and API orchestration',
      'Continuous optimization for lead quality and booking rate',
      'Monitoring, alerts, and workflow reliability hardening',
      'Weekly operator sync + implementation roadmap',
    ],
    cta: 'Start partner engagement',
    href: '/consulting/book',
    featured: true,
  },
  {
    name: 'Enterprise + LLM Ops',
    price: 'Custom',
    cadence: 'scope',
    summary: 'For multi-team environments, governance, and model-driven workflows.',
    points: [
      'Multi-pipeline architecture and environment controls',
      'Agent workflow safety, approvals, and auditability',
      'Data cleanup and model training pipeline support',
      'Security and compliance-aligned delivery model',
    ],
    cta: 'Talk to an engineer',
    href: 'https://form.jotform.com/252643426225151',
    external: true,
  },
];

const faq = [
  {
    q: 'Do you support existing HubSpot and Meta setups?',
    a: 'Yes. We map your current objects, events, and workflow logic first, then implement changes without breaking active systems.',
  },
  {
    q: 'Do you only build with Make and Zapier?',
    a: 'No. We use Make/Zapier when speed is the priority and move to direct API integrations when reliability and control matter more.',
  },
  {
    q: 'Can you include LLM or agent workflows in scope?',
    a: 'Yes. We include data sanity checks, permissions, and approval gates before allowing automated writes to business-critical systems.',
  },
  {
    q: 'What happens after implementation?',
    a: 'You can run with handoff documentation or continue on a monthly partner model for optimization and operational support.',
  },
];

export default function PricingPage() {
  const pricingSchema = generatePricingSchema();
  const organizationSchema = generateOrganizationSchema();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />

      <main className="flex flex-col bg-white">
        <section className="surface-dark relative overflow-hidden bg-[#071225] px-6 pb-16 pt-28 text-white sm:px-8 sm:pb-20 sm:pt-32">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-[#FF9312]/20 blur-3xl" />
            <div className="absolute right-0 top-20 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
          </div>
          <div className="relative mx-auto max-w-6xl">
            <p className="mb-4 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#FFC46B]">
              Pricing for integration outcomes
            </p>
            <h1 className="mb-5 max-w-4xl text-4xl font-black leading-tight text-white sm:text-6xl">
              Choose the right engagement for your integration stack.
            </h1>
            <p className="max-w-3xl text-base text-slate-200 sm:text-xl">
              Focused on lead pipeline reliability, clean data handoffs, and booked-meeting workflows across HubSpot, Meta API, Make, Zapier, and agent systems.
            </p>
          </div>
        </section>

        <section className="bg-white px-6 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-3">
            {packages.map((item) => (
              <article
                key={item.name}
                className={`flex flex-col rounded-2xl border p-6 sm:p-7 ${
                  item.featured
                    ? 'border-slate-900 bg-slate-900 text-white shadow-lg'
                    : 'border-slate-200 bg-white text-slate-900'
                }`}
              >
                <p className={`mb-2 text-xs font-semibold uppercase tracking-[0.12em] ${item.featured ? 'text-[#FFC46B]' : 'text-[#E07F00]'}`}>
                  {item.name}
                </p>
                <div className="mb-3 flex items-end gap-2">
                  <span className="text-3xl font-black">{item.price}</span>
                  <span className={item.featured ? 'text-slate-300' : 'text-slate-500'}>{item.cadence}</span>
                </div>
                <p className={`mb-6 text-sm leading-relaxed ${item.featured ? 'text-slate-200' : 'text-slate-600'}`}>{item.summary}</p>

                <ul className="mb-7 space-y-2.5 text-sm">
                  {item.points.map((point) => (
                    <li key={point} className="flex items-start gap-2">
                      <span className={item.featured ? 'text-[#FFC46B]' : 'text-[#E07F00]'}>•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>

                {item.external ? (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`mt-auto inline-flex items-center justify-center rounded-md px-4 py-2.5 text-sm font-semibold transition ${
                      item.featured
                        ? 'bg-white text-slate-900 hover:bg-slate-100'
                        : 'bg-slate-900 text-white hover:bg-slate-800'
                    }`}
                  >
                    {item.cta}
                  </a>
                ) : (
                  <PrimaryCta
                    href={item.href}
                    className={`mt-auto px-4 py-2.5 text-sm font-semibold ${
                      item.featured
                        ? 'bg-white text-slate-900 hover:bg-slate-100'
                        : 'bg-slate-900 text-white hover:bg-slate-800'
                    }`}
                  >
                    {item.cta}
                  </PrimaryCta>
                )}
              </article>
            ))}
          </div>
        </section>

        <section className="bg-slate-50 px-6 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-7">
              <h2 className="mb-4 text-3xl font-black text-slate-900">What every engagement includes</h2>
              <ul className="space-y-3 text-sm text-slate-700 sm:text-base">
                <li>Scope mapping across systems and ownership boundaries</li>
                <li>Data quality controls (validation, dedupe, reconciliation)</li>
                <li>Workflow reliability (retry logic, fallback paths, monitoring)</li>
                <li>Launch docs for ops, marketing, and sales handoff</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-7">
              <h2 className="mb-4 text-3xl font-black text-slate-900">Need a phased rollout plan?</h2>
              <p className="mb-5 text-sm leading-relaxed text-slate-600 sm:text-base">
                We can phase your roadmap by priority: first lead capture, then routing, then pipeline reliability and agent workflows.
              </p>
              <Link
                href="/automations"
                className="inline-flex items-center justify-center rounded-md border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:border-slate-900 hover:bg-slate-100"
              >
                Review automation pillars
              </Link>
            </div>
          </div>
        </section>

        <section className="bg-white px-6 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-8 text-4xl font-black text-slate-900 sm:text-5xl">Pricing FAQ</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {faq.map((item) => (
                <article key={item.q} className="rounded-2xl border border-slate-200 p-6">
                  <h3 className="mb-2 text-lg font-semibold text-slate-900">{item.q}</h3>
                  <p className="text-sm leading-relaxed text-slate-600 sm:text-base">{item.a}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="surface-dark bg-[#0b1a34] px-6 py-16 text-white sm:px-8 sm:py-20">
          <div className="mx-auto max-w-5xl text-center">
            <h2 className="mb-4 text-4xl font-black text-white sm:text-5xl">Need help choosing a package?</h2>
            <p className="mx-auto mb-8 max-w-3xl text-base text-slate-200 sm:text-lg">
              Bring your current stack, lead flow, and bottlenecks. We will recommend the right scope and delivery model.
            </p>
            <PrimaryCta href="/consulting/book" className="bg-[#FF9312] px-8 py-3.5 font-semibold text-slate-950 hover:bg-[#FFB14A]">
              Book pricing and scope call
            </PrimaryCta>
          </div>
        </section>
      </main>
    </>
  );
}
