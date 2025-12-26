/**
 * Features
 *
 * Narrative:
 *  - This section is the proof wall for the offer: concise, tactile cards that read well on mobile and desktop.
 *  - Motion and gradients are subtle to keep attention on the benefit text, not the chrome.
 *  - Hotjar-friendly data attributes are placed on the section, grid, and CTAs to make click maps actionable without extra plumbing.
 */

import PrimaryCta from "@/components/ui/PrimaryCta";
import { BarChart3, FileText, Globe, Palette, Sparkles, Users, Zap } from "lucide-react";

const features = [
  {
    id: "A",
    title: "Automated branding tools",
    body: "Instant brand kits, typography, and palettes so launches do not stall on design decisions.",
    icon: Palette,
    accent: "from-brand-50 via-white to-white",
  },
  {
    id: "B",
    title: "Client management and simple CRM",
    body: "Pipeline, reminders, and shared notes—lightweight enough for founders, strong enough to hand off.",
    icon: Users,
    accent: "from-sky-50 via-white to-white",
  },
  {
    id: "C",
    title: "Done-for-you website",
    body: "Ship a high-converting site with analytics, forms, and SEO baked in from day one.",
    icon: Globe,
    accent: "from-purple-50 via-white to-white",
  },
  {
    id: "D",
    title: "Follow-up automation",
    body: "Sequences for demos, trials, and invoices that respect brand voice and timing.",
    icon: Zap,
    accent: "from-amber-50 via-white to-white",
  },
  {
    id: "E",
    title: "Lead tracking dashboard",
    body: "Unified view of traffic, source, and deal progress so decisions are evidence-backed.",
    icon: BarChart3,
    accent: "from-emerald-50 via-white to-white",
  },
  {
    id: "F",
    title: "Weekly reporting",
    body: "Clear rollups with blockers, shipped items, and next bets—no fishing through Slack threads.",
    icon: FileText,
    accent: "from-indigo-50 via-white to-white",
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
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50/70 px-3 py-1 text-xs font-semibold text-brand-800">Proof-led delivery</div>
            <h2 className="mt-4 text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900">
              What you get
            </h2>
            <p className="mt-3 max-w-2xl text-base sm:text-lg text-gray-600">
              Six tangible outcomes teams adopt in week one—each card links to a measurable interaction you can track in Hotjar.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3" data-hotjar-cta="features-actions">
            <PrimaryCta href="/pricing">Start for $1</PrimaryCta>
            <a
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:border-brand-200 hover:bg-brand-50/70 focus:outline-none focus:ring-2 focus:ring-brand-500"
              href="/case-studies"
            >
              <Sparkles className="h-4 w-4 text-brand-600" />
              View example build
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
                  <span>Ready in <strong className="font-semibold text-gray-800">48h</strong></span>
                </div>
              </div>
            </article>
          ))}
        </div>

      
      </div>
    </section>
  );
}
