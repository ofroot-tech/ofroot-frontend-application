/**
 * HowItWorks
 *
 * Purpose:
 *  - Show simple 3-step onboarding to reduce friction.
 *  - Easy to expand with icons or micro-animations later.
 */

import PrimaryCta from "@/components/ui/PrimaryCta";

export default function HowItWorks() {
  const steps = [
    {
      step: "01",
      title: "Map data and workflow risks",
      text: "Audit lead sources, routing rules, lifecycle stages, and downstream dependencies before we build.",
    },
    {
      step: "02",
      title: "Implement with guardrails",
      text: "Ship integrations with validation, dedupe logic, retries, and alerting so failures are visible.",
    },
    {
      step: "03",
      title: "Operate and improve",
      text: "Track conversion and sync quality, then optimize rules to increase qualified meetings over time.",
    },
  ];

  return (
    <section className="bg-white px-6 py-20 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-10 text-4xl font-black text-slate-900 sm:text-5xl">Delivery model built for reliability</h2>

        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((item) => (
            <article key={item.step} className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
              <p className="mb-4 text-xs font-bold tracking-[0.14em] text-[#E07F00]">{item.step}</p>
              <h3 className="mb-3 text-xl font-semibold text-slate-900">{item.title}</h3>
              <p className="text-sm leading-relaxed text-slate-600 sm:text-base">{item.text}</p>
            </article>
          ))}
        </div>

        <div className="mt-10">
          <PrimaryCta href="/landing/social-comment-dm-automation" className="bg-slate-950 px-6 py-3 text-sm font-semibold hover:bg-slate-800">
            Start with social automation intake
          </PrimaryCta>
        </div>
      </div>
    </section>
  );
}
