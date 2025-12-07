/**
 * PricingAnchor
 *
 * Purpose:
 *  - Anchor value perception by reminding visitors of time savings and ROI.
 */

import PrimaryCta from "@/components/ui/PrimaryCta";

export default function PricingAnchor() {
  return (
    <section className="py-24 px-6 sm:px-8 bg-blue-50 text-center">
      <div className="max-w-2xl mx-auto">
        <p className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-8">Most businesses save 5–10 hours a week. That alone pays for the platform.</p>

        <PrimaryCta href="/pricing">See Full Pricing</PrimaryCta>
      </div>
    </section>
  );
}
