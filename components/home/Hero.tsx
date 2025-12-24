/**
 * Hero
 *
 * Purpose:
 *  - Communicate the primary value prop quickly and present a clear CTA.
 *  - Uses ScrollReveal for modern entrance animations.
 */

import Link from "next/link";
import PrimaryCta from "@/components/ui/PrimaryCta";
import ScrollReveal from "@/components/ui/ScrollReveal";

export default function Hero() {
  return (
    <section className="relative py-32 sm:py-48 px-6 sm:px-8 text-center bg-white overflow-hidden">
      {/* Background Gradient Blob */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none opacity-40">
        <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] bg-sky-100 rounded-full blur-[120px] mix-blend-multiply filter" />
        <div className="absolute top-[-10%] right-[20%] w-[500px] h-[500px] bg-teal-50 rounded-full blur-[120px] mix-blend-multiply filter animation-delay-2000" />
      </div>

      <div className="relative max-w-5xl mx-auto z-10">
        <ScrollReveal as="h1" className="text-5xl sm:text-7xl font-extrabold mb-8 leading-[1.1] tracking-tight text-gray-900 text-balance">
          Your website. Your marketing. Your clients. <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600">All managed in one place.</span>
        </ScrollReveal>

        <ScrollReveal delay={200} as="p" className="text-xl sm:text-2xl text-gray-600 mb-10 leading-relaxed text-balance max-w-3xl mx-auto">
          OfRoot Tech replaces 5–7 tools with one simple system.
          Get a fast website, branded assets, automations, and reporting. Launch in 48 hours.
        </ScrollReveal>

        <ScrollReveal delay={400} className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
          <PrimaryCta href="/pricing" className="h-12 px-8 text-lg">See Plans — Launch in 48 Hours</PrimaryCta>
          <Link href="/pricing" className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-8 py-3 text-gray-900 font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 h-12 text-lg shadow-sm">Compare plans</Link>
        </ScrollReveal>

        <ScrollReveal delay={600} as="p" className="text-sm font-medium text-gray-500 uppercase tracking-wider">
          Trusted by home services teams, consultants, and local trades
        </ScrollReveal>
      </div>
    </section>
  );
}
