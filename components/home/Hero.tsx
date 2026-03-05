/**
 * Hero
 *
 * Purpose:
 *  - Communicate the primary value prop quickly and present a clear CTA.
 *  - Keep markup minimal and Tailwind-ready so designers or Copilot can extend styles.
 *
 * Extension:
 *  - Make client-side for analytics by toggling `"use client"` when needed.
 */

import Link from "next/link";
import PrimaryCta from "@/components/ui/PrimaryCta";

export default function Hero() {
  return (
    <section className="surface-dark relative overflow-hidden bg-[#071225] px-6 pb-20 pt-28 text-white sm:px-8 sm:pb-24 sm:pt-32">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#FF9312]/20 blur-3xl" />
        <div className="absolute -right-20 top-24 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-emerald-400/15 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <p className="mb-5 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#FFC46B]">
          Integration Engineering for Revenue Teams
        </p>

        <h1 className="mb-6 max-w-4xl text-4xl font-black leading-[1.05] text-white sm:text-6xl">
          Build reliable pipelines for leads, bookings, and AI workflows.
        </h1>

        <p className="mb-10 max-w-3xl text-base leading-relaxed text-slate-200 sm:text-xl">
          We design and run HubSpot, Meta, Make, and Zapier integrations that keep data clean,
          route leads correctly, and convert demand into booked meetings.
        </p>

        <div className="mb-12 flex flex-col gap-4 sm:flex-row">
          <PrimaryCta href="/consulting/book" className="bg-[#FF9312] px-8 py-3.5 font-semibold text-slate-950 hover:bg-[#FFB14A]">
            Book an integration call
          </PrimaryCta>
          <Link
            href="/automations"
            className="inline-block rounded-md border border-white/30 px-8 py-3.5 font-semibold text-white transition hover:border-[#FFB14A] hover:text-[#FFC46B]"
          >
            See automation services
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-white/15 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-slate-300">Platforms</p>
            <p className="mt-2 text-lg font-semibold text-white">HubSpot, Meta, Make, Zapier</p>
          </div>
          <div className="rounded-xl border border-white/15 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-slate-300">Outcome</p>
            <p className="mt-2 text-lg font-semibold text-white">More qualified meetings, less data drift</p>
          </div>
          <div className="rounded-xl border border-white/15 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-slate-300">Delivery</p>
            <p className="mt-2 text-lg font-semibold text-white">Production-ready workflows with monitoring</p>
          </div>
        </div>
      </div>
    </section>
  );
}
