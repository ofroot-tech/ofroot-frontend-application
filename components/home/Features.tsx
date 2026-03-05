/**
 * Features
 *
 * Purpose:
 *  - Alphabetized feature list for quick scanning.
 *  - Minimal styling so the list can be consumed by other pages or components.
 */

import PrimaryCta from "@/components/ui/PrimaryCta";
import Link from "next/link";

export default function Features() {
  const cards = [
    {
      title: "HubSpot integrations",
      text: "Contact sync, lifecycle mapping, owner assignment, and workflow triggers built for clean handoffs.",
      href: "/hubspot-integration",
    },
    {
      title: "Meta API + CAPI",
      text: "Event pipelines that improve attribution quality and support lead routing and campaign optimization.",
      href: "/meta-conversions-api",
    },
    {
      title: "Make + Zapier automation",
      text: "Fast delivery when speed matters, with retries, validation, and monitoring so flows stay reliable.",
      href: "/make-zapier-automation",
    },
    {
      title: "Agent + LLM workflows",
      text: "Safe operator loops with strict input validation, approval gates, and audit-ready action logs.",
      href: "/agent-integrations",
    },
  ];

  return (
    <section className="bg-slate-50 px-6 py-20 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#E07F00]">Pick your integration</p>
            <h2 className="text-4xl font-black text-slate-900 sm:text-5xl">Build the right pipeline, first.</h2>
          </div>
          <PrimaryCta href="/consulting/book" className="bg-slate-950 px-6 py-3 text-sm font-semibold hover:bg-slate-800">
            Talk to an engineer
          </PrimaryCta>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {cards.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-0.5 hover:border-[#FFB14A] hover:shadow-lg"
            >
              <h3 className="mb-3 text-xl font-semibold text-slate-900">{card.title}</h3>
              <p className="mb-5 text-sm leading-relaxed text-slate-600 sm:text-base">{card.text}</p>
              <span className="text-sm font-semibold text-[#E07F00] transition group-hover:text-[#FF9312]">Explore service {'->'}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
