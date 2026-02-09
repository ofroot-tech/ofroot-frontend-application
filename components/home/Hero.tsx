/**
 * Hero
 *
 * Purpose:
 *  - State the ICP, promise, and proof in under 5 seconds for tired operators.
 *  - Spotlight a live case study to anchor credibility.
 *  - Keep motion subtle via ScrollReveal so copy stays the hero.
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
          HubSpot + Meta integrations that turn leads into booked meetings.
        </ScrollReveal>

        <ScrollReveal delay={200} as="p" className="text-xl sm:text-2xl text-gray-600 mb-10 leading-relaxed text-balance max-w-3xl mx-auto">
          We build and run workflow systems for lead capture, routing, follow-up, and scheduling so sales teams stop losing qualified demand.
        </ScrollReveal>

        <ScrollReveal delay={400} className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
          <PrimaryCta href="/consulting/book" className="h-12 px-8 text-lg">Book an integration strategy call</PrimaryCta>
          <Link href="/automations" className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-8 py-3 text-gray-900 font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 h-12 text-lg shadow-sm">Explore automations</Link>
        </ScrollReveal>

        <ScrollReveal delay={600} as="div" className="flex flex-col sm:flex-row items-center justify-center gap-3 text-sm font-medium text-gray-700">
          <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-gray-800 border border-gray-200">Integration-led delivery with senior engineers</span>
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-emerald-800 border border-emerald-100">HubSpot leads + Meta events + booking flows synced end to end</span>
        </ScrollReveal>
      </div>
    </section>
  );
}
