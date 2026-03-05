/**
 * Why
 *
 * Purpose:
 *  - Explain the problem OfRoot solves in plain language.
 *  - Short, scannable paragraphs to reduce bounce and reinforce relevance.
 */

export default function Why() {
  return (
    <section className="bg-white px-6 py-20 sm:px-8 sm:py-24">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-start">
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#E07F00]">Why teams switch to OfRoot</p>
          <h2 className="mb-6 text-4xl font-black leading-tight text-slate-900 sm:text-5xl">
            Most integration stacks break at the handoff layer.
          </h2>
          <p className="text-lg leading-relaxed text-slate-700">
            Leads get dropped between forms, social DMs, and CRM. Lifecycle stages drift, owner routing fails,
            and reporting stops matching reality. We fix these system seams and build guardrails so revenue teams can trust the data.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 sm:p-7">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">Common problems we solve</p>
          <ul className="space-y-3 text-sm text-slate-700 sm:text-base">
            <li className="rounded-lg bg-white px-4 py-3">Dropped or duplicated leads across Meta, forms, and HubSpot</li>
            <li className="rounded-lg bg-white px-4 py-3">Misrouted owners and incorrect lifecycle stage updates</li>
            <li className="rounded-lg bg-white px-4 py-3">Brittle automation chains without retries or visibility</li>
            <li className="rounded-lg bg-white px-4 py-3">LLM or agent actions running without data sanity checks</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
