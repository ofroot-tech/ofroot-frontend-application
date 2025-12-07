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
      <div className="max-w-5xl mx-auto px-6 sm:px-8">
        <div className="flex flex-col items-center text-center">
          <h2 className="text-4xl sm:text-5xl font-extrabold">What I Do</h2>

          <ul className="mt-6 space-y-4 text-lg text-gray-700 list-none mx-auto max-w-lg">
            <li>A. Architecture</li>
            <li>B. Automation</li>
            <li>C. Code Delivery</li>
            <li>D. Data & Reporting</li>
            <li>E. Growth Systems</li>
            <li>F. Integration</li>
            <li>G. Stability</li>
          </ul>

          <div className="mt-8">
            <PrimaryCta href="/consulting/book">Book a Strategy Call</PrimaryCta>
          </div>
        </div>
      </div>
    </section>
  );
}
