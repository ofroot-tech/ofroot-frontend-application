import Link from 'next/link';

export default function HowWeWork() {
  const steps = [
    {
      title: 'Audit the flow',
      body: 'We map lead sources, systems, and failure modes. Fields, owners, SLAs, dedupe rules, and what "good" looks like.',
      meta: 'Days 0 to 2',
    },
    {
      title: 'Ship the integration',
      body: 'We implement pipelines, webhooks, retries, and monitoring. Make/Zapier when it fits, direct APIs when it must.',
      meta: 'Week 1 to 2',
    },
    {
      title: 'Prove reliability',
      body: 'We add validation, dashboards, and runbooks so leads do not drop silently and teams can trust the data.',
      meta: 'Week 2 to 4',
    },
  ];

  return (
    <section className="rounded-2xl border border-gray-200 bg-white/90 p-8 shadow-card space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">How we work</h2>
        <p className="text-sm text-gray-700 max-w-3xl">
          Integrations fail in the gaps. We ship with guardrails: retries, dedupe, validation, and observability from day one.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {steps.map((s) => (
          <article key={s.title} className="rounded-xl border border-gray-200 bg-white p-6 space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wide text-emerald-800">{s.meta}</div>
            <h3 className="text-lg font-semibold text-gray-900">{s.title}</h3>
            <p className="text-sm text-gray-700 leading-relaxed">{s.body}</p>
          </article>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/consulting/book"
          className="inline-flex items-center justify-center rounded-lg bg-[#0f766e] px-5 py-3 text-white font-semibold shadow-sm hover:bg-[#115e59] transition-colors"
        >
          Book an integration call
        </Link>
        <Link
          href="/automations"
          className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-5 py-3 text-gray-900 font-semibold shadow-sm hover:bg-gray-50 transition-colors"
        >
          Explore automations
        </Link>
      </div>
    </section>
  );
}
