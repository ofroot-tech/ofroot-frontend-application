/**
 * HowItWorks
 *
 * Purpose:
 *  - Show simple 3-step onboarding to reduce friction.
 *  - Easy to expand with icons or micro-animations later.
 */

import PrimaryCta from "@/components/ui/PrimaryCta";

export default function HowItWorks() {
  return (
    <section className="py-24 px-6 sm:px-8 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-4xl sm:text-5xl font-extrabold mb-12 text-gray-900">How It Works</h2>

        <ol className="space-y-6 text-lg text-gray-700 mb-10">
          <li className="flex items-start gap-4"><span className="font-bold text-2xl text-gray-900 min-w-fit">1</span> <span>You pick a plan.</span></li>
          <li className="flex items-start gap-4"><span className="font-bold text-2xl text-gray-900 min-w-fit">2</span> <span>We set everything up for you.</span></li>
          <li className="flex items-start gap-4"><span className="font-bold text-2xl text-gray-900 min-w-fit">3</span> <span>You run your business with less friction.</span></li>
        </ol>

        <PrimaryCta href="/pricing">Choose a Plan</PrimaryCta>
      </div>
    </section>
  );
}
