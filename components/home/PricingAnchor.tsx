/**
 * PricingAnchor
 *
 * Purpose:
 *  - Anchor value perception by reminding visitors of time savings and ROI.
 */

import PrimaryCta from "@/components/ui/PrimaryCta";

export default function PricingAnchor() {
  return (
    <section className="surface-dark bg-[#0b1a34] px-6 py-20 text-white sm:px-8 sm:py-24">
      <div className="mx-auto max-w-5xl rounded-3xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur sm:p-12">
        <p className="mx-auto mb-7 max-w-3xl text-2xl font-semibold leading-tight text-white sm:text-4xl">
          Bookings grow when lead data is clean, routing is fast, and follow-up is automatic.
        </p>

        <p className="mx-auto mb-9 max-w-2xl text-base text-slate-200 sm:text-lg">
          We build and maintain the integration layer so marketing, sales, and ops work from one reliable pipeline.
        </p>

        <PrimaryCta href="/pricing" className="bg-[#FF9312] px-7 py-3.5 font-semibold text-slate-950 hover:bg-[#FFB14A]">
          See pricing and engagement options
        </PrimaryCta>
      </div>
    </section>
  );
}
