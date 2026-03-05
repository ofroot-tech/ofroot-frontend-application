/**
 * Faq
 *
 * Narrative:
 *  - Gives the FAQ the same proof-led, tactile styling as Features/HowItWorks so the page feels cohesive.
 *  - Adds Hotjar hooks on the section, grid, and each question to observe hesitations and rage-clicks.
 *  - Uses a concise grid with inline badges to pre-empt objections about speed, ownership, and support.
 */

import PrimaryCta from "@/components/ui/PrimaryCta";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { CheckCircle2, Clock3, ShieldCheck } from "lucide-react";

const faqs = [
  {
    q: "Who is this for?",
    a: "Teams that rely on HubSpot and Meta campaigns and need reliable lead sync plus more booked meetings from existing demand.",
    badge: "Revenue and ops teams",
  },
  {
    q: "What do you implement first?",
    a: "We start with lead capture and routing reliability, then wire follow-up workflows and meeting-booking handoffs so qualified leads move fast.",
    badge: "Lead flow first",
  },
  {
    q: "Can you fix broken lead sync?",
    a: "Yes. We diagnose duplicate, dropped, and delayed lead events across Meta, forms, and HubSpot, then add retries, validation, and monitoring.",
    badge: "Sync reliability",
  },
  {
    q: "Do you support meeting-booking workflows?",
    a: "Yes. We design routing rules, follow-up sequences, and scheduler integrations so reps spend time in qualified meetings, not manual triage.",
    badge: "Booking workflows",
  },
  {
    q: "Who owns the integrations?",
    a: "You do. Your team keeps access, documentation, and workflow logic. If you pause service, the system remains in your accounts.",
    badge: "You keep the keys",
  },
];

export default function Faq() {
  return (
    <section
      className="relative overflow-hidden bg-gradient-to-b from-white via-brand-50/60 to-sky-50/60 py-24 px-6 sm:px-8"
      data-hotjar-section="faq"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(32,178,170,0.12),transparent_32%),radial-gradient(circle_at_80%_10%,rgba(125,211,252,0.14),transparent_30%)]" aria-hidden />
      <div className="pointer-events-none absolute left-[-12%] bottom-[-10%] h-64 w-64 rounded-full bg-gradient-to-br from-brand-200/50 via-brand-100/30 to-transparent blur-3xl" aria-hidden />

      <div className="relative mx-auto max-w-6xl text-left">
        <ScrollReveal as="div" className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl space-y-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-100 bg-white/90 px-3 py-1 text-xs font-semibold text-brand-800 shadow-sm">
              <ShieldCheck className="h-4 w-4" aria-hidden />
              Integration answers without the spin
            </span>
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900">FAQ</h2>
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed text-balance">
              These are the key objections around lead routing, API sync, and booking workflows. We answer them clearly so buying decisions move faster.
            </p>
          </div>

          <div className="flex items-center gap-3 text-sm font-semibold text-gray-700" data-hotjar-cta="faq-meta">
            <Clock3 className="h-4 w-4 text-brand-700" aria-hidden />
            Updated weekly based on conversations
          </div>
        </ScrollReveal>

        <div
          className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2"
          data-hotjar-grid="faq-grid"
        >
          {faqs.map((item) => (
            <article
              key={item.q}
              className="group relative overflow-hidden rounded-2xl border border-gray-100/80 bg-white/90 backdrop-blur shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lg focus-within:-translate-y-1"
              data-hotjar-question={item.q}
            >
              <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-br from-white via-brand-50 to-white opacity-90" aria-hidden />
              <div className="relative flex flex-col gap-3 p-6">
                <div className="flex items-center justify-start gap-2 text-xs font-semibold text-brand-800">
                  <span className="inline-flex items-center gap-1 rounded-full bg-brand-50/90 px-3 py-1 border border-brand-100">
                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                    {item.badge}
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 leading-tight">{item.q}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{item.a}</p>
              </div>
            </article>
          ))}
        </div>

        <ScrollReveal delay={200} className="mt-12 flex flex-col items-center gap-3" data-hotjar-cta="faq-cta">
          <PrimaryCta href="/pricing" className="h-12 px-7 text-base sm:text-lg">Book an integration strategy call</PrimaryCta>
          <p className="text-xs sm:text-sm text-gray-500 text-center">
            Hotjar collects scroll depth, click maps on each question, and rage-clicks so we can tighten answers quickly.
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
