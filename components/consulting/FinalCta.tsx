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
      <div className="max-w-5xl mx-auto px-6 sm:px-8">
        <h2 className="text-3xl sm:text-4xl font-extrabold">Let’s build something that moves your business forward.</h2>

        <div className="mt-6">
          <PrimaryCta href="/consulting/book">Book a Strategy Call</PrimaryCta>
        </div>
      </div>
    </section>
  );
}
