/**
 * PricingAnchor
 *
 * Purpose:
 *  - Anchor value perception around 30-day outcomes and weekly revenue impact.
 */

import PrimaryCta from "@/components/ui/PrimaryCta";

export default function PricingAnchor() {
  return (
    <section className="py-24 px-6 sm:px-8 bg-blue-50 text-center">
      <div className="max-w-5xl mx-auto">
        <p className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-8">30 days to a revenue-grade AI workflow. Weekly demos, zero mystery.</p>

        <PrimaryCta href="/pricing">View pricing & plan your build</PrimaryCta>
      </div>
    </section>
  );
}
