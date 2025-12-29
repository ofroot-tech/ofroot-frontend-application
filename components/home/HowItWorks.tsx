/**
 * HowItWorks
 *
 * Narrative:
 *  - Three-step story tuned for operator attention spans: review, build, run.
 *  - Hotjar hooks stay for scroll/click clarity.
 *  - Inline metrics set expectations for the 30-day build.
 */

import PrimaryCta from "@/components/ui/PrimaryCta";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { ArrowRight, Clock3, Rocket } from "lucide-react";

const steps = [
  {
    id: "01",
    title: "Review your stack",
    body: "30-minute call: current stack, constraints, and the revenue or ops outcome you need this quarter.",
    metric: "Day 0",
    accent: "from-brand-100/70 via-white to-white",
  },
  {
    id: "02",
    title: "Build the system",
    body: "We ship the AI workflow, routing, and guardrails in a 30-day sprint with weekly milestones and demos.",
    metric: "Days 1–30",
    accent: "from-sky-100/70 via-white to-white",
  },
  {
    id: "03",
    title: "Run and extend",
    body: "We operate the system, add surfaces, and tune prompts/guardrails as you scale. You stay on one thread; we ship weekly.",
    metric: "Week by week",
    accent: "from-amber-100/70 via-white to-white",
  },
];

export default function HowItWorks() {
  return (
    <section
      className="relative overflow-hidden bg-gradient-to-b from-brand-50/80 via-white to-sky-50/50 py-24 px-6 sm:px-8"
      data-hotjar-section="how-it-works"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(32,178,170,0.12),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(125,211,252,0.12),transparent_32%)]" aria-hidden />
      <div className="pointer-events-none absolute right-[-12%] bottom-[-10%] h-64 w-64 rounded-full bg-gradient-to-br from-brand-200/50 via-brand-100/30 to-transparent blur-3xl" aria-hidden />

      <div className="relative mx-auto max-w-6xl text-left">
        <ScrollReveal as="div" className="flex flex-col items-start gap-3 md:items-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-100 bg-white/90 px-3 py-1 text-xs font-semibold text-brand-800 shadow-sm">
            <Rocket className="h-4 w-4" aria-hidden />
            Build to live traffic fast
          </span>
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900">How it works</h2>
          <p className="max-w-3xl text-base sm:text-lg text-gray-600 leading-relaxed text-balance">
            Three beats, zero fluff: review, build, run. Cards stay wired to Hotjar so we can see what visitors care about.
          </p>
        </ScrollReveal>

        <div
          className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3"
          data-hotjar-grid="how-it-works-steps"
        >
          {steps.map((step) => (
            <article
              key={step.id}
              className="group relative overflow-hidden rounded-2xl border border-gray-100/80 bg-white/80 backdrop-blur shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lg focus-within:-translate-y-1"
              data-hotjar-step={step.title}
            >
              <div className={`absolute inset-x-0 top-0 h-28 bg-gradient-to-br ${step.accent}`} aria-hidden />
              <div className="relative flex h-full flex-col gap-4 p-6">
                <div className="flex items-center justify-between text-sm font-semibold text-gray-800">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white/90 text-lg shadow-sm border border-gray-100">
                    {step.id}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-brand-50/90 px-3 py-1 text-xs font-semibold text-brand-800 border border-brand-100">
                    <Clock3 className="h-3.5 w-3.5" aria-hidden />
                    {step.metric}
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  <h3 className="text-xl font-semibold text-gray-900 leading-tight">{step.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{step.body}</p>
                </div>

                <div className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-brand-800">
                  <ArrowRight className="h-4 w-4" aria-hidden />
                  Next milestone
                </div>
              </div>
            </article>
          ))}
        </div>

        <ScrollReveal delay={200} className="mt-12 flex flex-col items-center gap-3" data-hotjar-cta="how-it-works-cta">
          <PrimaryCta href="/pricing" className="h-12 px-7 text-base sm:text-lg">Scope a 30-day build</PrimaryCta>
          <p className="text-xs sm:text-sm text-gray-500 text-center">
            Scroll depth and click maps on every step and CTA help us remove friction fast.
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
