/**
 * Features
 *
 * Purpose:
 *  - Alphabetized feature list for quick scanning.
 *  - Minimal styling so the list can be consumed by other pages or components.
 */

import PrimaryCta from "@/components/ui/PrimaryCta";

export default function Features() {
  return (
    <section className="py-24 px-6 sm:px-8 bg-white">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-4xl sm:text-5xl font-extrabold mb-12 text-gray-900">What You Get</h2>

        <ul className="space-y-4 text-lg text-gray-700 mb-10">
          <li className="flex items-start gap-4"><span className="font-semibold text-gray-900 min-w-fit">A.</span> Automated branding tools</li>
          <li className="flex items-start gap-4"><span className="font-semibold text-gray-900 min-w-fit">B.</span> Client management and simple CRM</li>
          <li className="flex items-start gap-4"><span className="font-semibold text-gray-900 min-w-fit">C.</span> Done-for-you website</li>
          <li className="flex items-start gap-4"><span className="font-semibold text-gray-900 min-w-fit">D.</span> Follow-up automation</li>
          <li className="flex items-start gap-4"><span className="font-semibold text-gray-900 min-w-fit">E.</span> Lead tracking dashboard</li>
          <li className="flex items-start gap-4"><span className="font-semibold text-gray-900 min-w-fit">F.</span> Weekly reporting</li>
        </ul>

        <PrimaryCta href="/pricing">Start for $1</PrimaryCta>
      </div>
    </section>
  );
}
