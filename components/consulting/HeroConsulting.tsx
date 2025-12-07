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
      <h1 className="text-4xl font-bold">Build faster. Scale smarter. Work with a Senior Architect who delivers.</h1>

      <p className="mt-4 text-xl">
        I help growing companies modernize systems, ship faster, stabilize infra, and cut engineering cost through clean architecture and automation.
      </p>

      <div className="mt-6">
        <PrimaryCta href="/consulting/book">Book a Strategy Call</PrimaryCta>
      </div>

      <p className="mt-3 text-sm">8+ years building platforms for high-growth companies in healthcare, energy, and SaaS.</p>
    </section>
  );
}
