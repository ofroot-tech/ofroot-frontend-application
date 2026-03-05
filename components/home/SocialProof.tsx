/**
 * SocialProof
 *
 * Purpose:
 *  - Short testimonials and sector notes to reduce risk for buyers.
 */

export default function SocialProof() {
  return (
    <section className="bg-white px-6 py-20 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-4 text-4xl font-black text-slate-900 sm:text-5xl">Proof from live operations</h2>
        <p className="mb-10 max-w-3xl text-base leading-relaxed text-slate-600 sm:text-lg">
          Teams use OfRoot to stabilize lead capture pipelines, improve CRM integrity, and increase meetings from the same ad spend.
        </p>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">Response speed</p>
            <p className="mt-2 text-3xl font-black text-slate-900">&lt; 2 min</p>
            <p className="mt-3 text-sm text-slate-600">Automated first-touch DM and routing on qualified social triggers.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">Lead quality</p>
            <p className="mt-2 text-3xl font-black text-slate-900">+31%</p>
            <p className="mt-3 text-sm text-slate-600">Higher qualification rate after rule-based capture and CRM sanity checks.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">Pipeline reliability</p>
            <p className="mt-2 text-3xl font-black text-slate-900">99.9%</p>
            <p className="mt-3 text-sm text-slate-600">Monitored workflows with retries and alerting across critical handoffs.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
