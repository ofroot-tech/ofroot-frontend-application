/**
 * Faq
 *
 * Purpose:
 *  - Surface common objections and answers to increase conversion.
 */

import PrimaryCta from "@/components/ui/PrimaryCta";

export default function Faq() {
  return (
    <section className="py-24 px-6 sm:px-8 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-4xl sm:text-5xl font-extrabold mb-12 text-gray-900">FAQ</h2>

        <ul className="space-y-6 text-lg text-gray-700 mb-10">
          <li className="border-b border-gray-200 pb-6"><span className="font-semibold text-gray-900">Q. Who is this for?</span> <br /> A. Small service businesses.</li>
          <li className="border-b border-gray-200 pb-6"><span className="font-semibold text-gray-900">Q. How fast is setup?</span> <br /> A. 48 hours.</li>
          <li><span className="font-semibold text-gray-900">Q. Do I need technical skills?</span> <br /> A. No. We handle everything.</li>
        </ul>

        <PrimaryCta href="/pricing">Start for $1</PrimaryCta>
      </div>
    </section>
  );
}
