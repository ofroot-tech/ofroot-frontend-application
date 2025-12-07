/**
 * Services
 *
 * Purpose:
 *  - Alphabetized list of consulting competencies for quick scanning.
 */

import PrimaryCta from "@/components/ui/PrimaryCta";

export default function Services() {
  return (
    <section className="py-20">
      <h2 className="text-3xl font-semibold">What I Do</h2>

      <ul className="mt-6 space-y-3 text-lg">
        <li>A. Architecture</li>
        <li>B. Automation</li>
        <li>C. Code Delivery</li>
        <li>D. Data & Reporting</li>
        <li>E. Growth Systems</li>
        <li>F. Integration</li>
        <li>G. Stability</li>
      </ul>

      <div className="mt-6">
        <PrimaryCta href="/consulting/book">Book a Strategy Call</PrimaryCta>
      </div>
    </section>
  );
}
