/**
 * Features
 *
 * Narrative:
 *  - Proof wall for the offer: three outcome-led builds operators can ship in 30 days.
 *  - Cards stay tactile but copy-first, tuned for quick scanning on mobile.
 *  - Hotjar-friendly attributes remain so we can see what resonates.
 */

import PrimaryCta from "@/components/ui/PrimaryCta";
import { Activity, CheckSquare, Shield, Sparkles, Workflow } from "lucide-react";

const features = [
  {
    id: "A",
    title: "HubSpot lead orchestration",
    body: "Inbound leads from forms, ads, chat, and social land in HubSpot with the right owner, lifecycle stage, and SLA rules from day one.",
    icon: Activity,
    accent: "from-brand-50 via-white to-white",
  },
  {
    id: "B",
    title: "Meta API integrations",
    body: "We wire Meta Conversions API and related event flows so campaign data, qualified leads, and attribution are reliable across systems.",
    icon: Workflow,
    accent: "from-amber-50 via-white to-white",
  },
  {
    id: "C",
    title: "Booking workflows",
    body: "Follow-up sequences, routing, and scheduler handoffs convert more qualified leads into meetings without manual copy/paste ops.",
    icon: Shield,
    accent: "from-sky-50 via-white to-white",
  },
];

export default function Features() {
  return (
    <section
      className="relative overflow-hidden bg-white py-24 px-6 sm:px-8"
      data-hotjar-section="features"
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-brand-50/70 via-white to-white" aria-hidden />
      <div className="pointer-events-none absolute right-[-10%] top-10 h-64 w-64 rounded-full bg-gradient-to-br from-brand-200/40 via-brand-100/20 to-transparent blur-3xl" aria-hidden />

      <div className="relative mx-auto max-w-6xl">
        <div className="flex flex-col gap-6 text-left md:flex-row md:items-center md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50/70 px-3 py-1 text-xs font-semibold text-brand-800">Integration-first systems</div>
            <h2 className="mt-4 text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900">
              What we build for revenue teams
            </h2>
            <p className="mt-3 max-w-2xl text-base sm:text-lg text-gray-600">
              Three workflow blocks that remove lead and sync failures, improve attribution quality, and drive more booked meetings.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3" data-hotjar-cta="features-actions">
            <PrimaryCta href="/pricing">Book an integration call</PrimaryCta>
            <a
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:border-brand-200 hover:bg-brand-50/70 focus:outline-none focus:ring-2 focus:ring-brand-500"
              href="/services/integration"
            >
              <Sparkles className="h-4 w-4 text-brand-600" />
              See integration details
            </a>
            <a
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:border-brand-200 hover:bg-brand-50/70 focus:outline-none focus:ring-2 focus:ring-brand-500"
              href="/automations"
            >
              <CheckSquare className="h-4 w-4 text-brand-600" />
              Browse automations
            </a>
          </div>
        </div>

        <div
          className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
          data-hotjar-grid="features-grid"
        >
          {features.map(({ id, title, body, icon: Icon, accent }) => (
            <article
              key={id}
              className="group relative overflow-hidden rounded-2xl border border-gray-100/80 bg-white/80 backdrop-blur shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lg focus-within:-translate-y-1"
              data-hotjar-card={title}
            >
              <div className={`absolute inset-x-0 top-0 h-28 bg-gradient-to-br ${accent} opacity-80`} aria-hidden />
              <div className="relative p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-white/90 text-sm font-bold text-gray-900 shadow-sm border border-gray-100">
                    {id}.
                  </span>
                  <div className="flex items-center gap-2 text-xs font-semibold text-brand-800 bg-brand-50/80 border border-brand-100 px-3 py-1 rounded-full">
                    <span className="inline-flex h-2 w-2 rounded-full bg-brand-500 animate-pulse" aria-hidden />
                    High engagement
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/90 text-brand-700 shadow-sm border border-gray-100">
                    <Icon className="h-5 w-5" aria-hidden />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                    <p className="mt-2 text-sm text-gray-600 leading-relaxed">{body}</p>
                  </div>
                </div>

                <div className="flex items-center text-xs text-gray-500">
                  <span>Built with <strong className="font-semibold text-gray-800">meeting-booking KPIs</strong></span>
                </div>
              </div>
            </article>
          ))}
        </div>


      </div>
    </section>
  );
}
