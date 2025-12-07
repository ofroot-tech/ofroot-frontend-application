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
    <section className="py-32 px-6 sm:px-8 text-center bg-white">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-5xl sm:text-6xl font-extrabold mb-6 leading-tight text-gray-900">
          Your website. Your marketing. Your clients. All managed in one place.
        </h1>

        <p className="text-xl sm:text-2xl text-gray-600 mb-8 leading-relaxed">
          OfRoot Tech replaces 5–7 tools with one simple system.
          Get a fast website, branded assets, automations, and reporting. Launch in 48 hours.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
          <PrimaryCta href="/pricing">See Plans — Launch in 48 Hours</PrimaryCta>
          <Link href="/pricing" className="inline-block rounded border border-gray-300 px-8 py-3 text-gray-900 font-semibold hover:border-gray-400 hover:bg-gray-50 transition">Compare plans</Link>
        </div>

        <p className="text-sm text-gray-500">Trusted by home services teams, consultants, and local trades.</p>
      </div>
    </section>
  );
}
