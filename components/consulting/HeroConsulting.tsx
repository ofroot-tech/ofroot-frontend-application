/**
 * HeroConsulting
 *
 * Purpose:
 *  - Position high-ticket consulting services and present a conversion path.
 *  - Keep messaging concise and authoritative.
 */

import PrimaryCta from "@/components/ui/PrimaryCta";

export default function HeroConsulting() {
  return (
    <section className="py-24 text-center">
      <div className="max-w-5xl mx-auto px-6 sm:px-8">
        <h1 className="text-4xl sm:text-5xl font-extrabold">
          <span className="block">Build Smarter. Scale Faster.</span>
          <span className="block">Senior Software Architect Consulting.</span>
        </h1>

        <p className="mt-4 text-lg sm:text-xl text-gray-700">
          For operators, founders, and technical leaders: I build scalable systems, remove bottlenecks with workflow optimization and AI automation,
          and improve system reliability so you can grow without breaking delivery.
        </p>

        <div className="mt-6">
          <PrimaryCta href="/consulting/book">Book a Strategy Call</PrimaryCta>
        </div>

        <p className="mt-3 text-sm text-gray-500">
          8+ years building and stabilizing platforms for high-growth teams across healthcare systems, energy, and SaaS.
        </p>
      </div>
    </section>
  );
}
