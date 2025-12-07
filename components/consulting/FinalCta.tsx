/**
 * FinalCta
 *
 * Purpose:
 *  - Strong closing CTA for consulting pages.
 */

import PrimaryCta from "@/components/ui/PrimaryCta";

export default function FinalCta() {
  return (
    <section className="py-20 text-center">
      <h2 className="text-3xl font-semibold">Let’s build something that moves your business forward.</h2>

      <div className="mt-6">
        <PrimaryCta href="/consulting/book">Book a Strategy Call</PrimaryCta>
      </div>
    </section>
  );
}
