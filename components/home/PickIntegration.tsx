import Link from 'next/link';

const picks = [
  {
    title: 'HubSpot integration',
    desc: 'Lead routing, lifecycle sanity, dedupe, and meeting workflows.',
    href: '/hubspot-integration',
    badge: 'CRM',
  },
  {
    title: 'Meta Conversions API (CAPI)',
    desc: 'Validated server-side events, dedupe, monitoring, and attribution integrity.',
    href: '/meta-conversions-api',
    badge: 'Attribution',
  },
  {
    title: 'Make + Zapier automation',
    desc: 'Automations with guardrails: validation, retries, monitoring, and clear ownership.',
    href: '/make-zapier-automation',
    badge: 'Automation',
  },
  {
    title: 'Agent integrations',
    desc: 'Tool-connected agents with evaluations, observability, and safe fallbacks.',
    href: '/agent-integrations',
    badge: 'Agents',
  },
];

export default function PickIntegration() {
  return (
    <section className="py-20 px-6 sm:px-8 bg-white">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">
              Pick your integration
            </h2>
            <p className="mt-3 text-base sm:text-lg text-gray-600">
              Choose the entry point that matches your highest-leverage bottleneck. Each path ends in the same outcome: reliable data and more booked meetings.
            </p>
          </div>
          <div className="text-sm text-gray-600">
            Or start broad with <Link className="underline font-semibold" href="/automations">Automations</Link>.
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          {picks.map((p) => (
            <Link
              key={p.href}
              href={p.href}
              className="group rounded-2xl border border-gray-200 bg-white/90 p-6 shadow-card hover:shadow-lg hover:-translate-y-0.5 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0f766e]"
            >
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 group-hover:text-gray-950">
                  {p.title}
                </h3>
                <span className="shrink-0 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-900">
                  {p.badge}
                </span>
              </div>
              <p className="mt-2 text-sm sm:text-base text-gray-700 leading-relaxed">
                {p.desc}
              </p>
              <div className="mt-4 text-sm font-semibold text-gray-900 underline">
                Open this path
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

