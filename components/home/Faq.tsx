/**
 * Faq
 *
 * Purpose:
 *  - Surface common objections and answers to increase conversion.
 */

import PrimaryCta from "@/components/ui/PrimaryCta";

export default function Faq() {
  const items = [
    {
      q: "Do you work with our existing HubSpot setup?",
      a: "Yes. We map your current properties, lifecycle stages, and workflows first, then implement changes without breaking active ops.",
    },
    {
      q: "Can you connect Meta lead flows directly to CRM and booking?",
      a: "Yes. We integrate lead capture and CAPI events, route contacts by rules, and trigger booking paths with validation.",
    },
    {
      q: "Do you only use Make and Zapier?",
      a: "No. We use Make/Zapier when speed is best, and direct API integrations when control and reliability are required.",
    },
    {
      q: "Can you support LLM or agent workflows safely?",
      a: "Yes. We add data quality gates, fallback logic, and approval boundaries before agents can write to critical systems.",
    },
  ];

  return (
    <section className="bg-slate-50 px-6 py-20 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-10 text-4xl font-black text-slate-900 sm:text-5xl">FAQ</h2>

        <div className="grid gap-4 md:grid-cols-2">
          {items.map((item) => (
            <article key={item.q} className="rounded-2xl border border-slate-200 bg-white p-6">
              <h3 className="mb-3 text-lg font-semibold text-slate-900">{item.q}</h3>
              <p className="text-sm leading-relaxed text-slate-600 sm:text-base">{item.a}</p>
            </article>
          ))}
        </div>

        <div className="mt-10">
          <PrimaryCta href="/consulting/book" className="bg-slate-950 px-6 py-3 text-sm font-semibold hover:bg-slate-800">
            Book your integration discovery call
          </PrimaryCta>
        </div>
      </div>
    </section>
  );
}
