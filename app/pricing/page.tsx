/**
 * Pricing Page
 *
 * Purpose:
 *  - Display clear pricing tiers for two offerings: OfRoot Tech (SaaS) and Consulting.
 *  - Separate visual sections so visitors can choose their path.
 *  - Include comparison, FAQ, and strong CTAs.
 *
 * Structure:
 *  - Hero section explaining the two offerings.
 *  - OfRoot Tech SaaS pricing (self-serve, lower-ticket).
 *  - Consulting/retainer pricing (high-ticket, custom).
 *  - Feature comparison.
 *  - FAQ.
 *  - Final CTA.
 */

import { Metadata } from 'next';
import Link from "next/link";
import PrimaryCta from "@/components/ui/PrimaryCta";
import { generatePricingSchema, generateOrganizationSchema } from '@/app/lib/schemas';

export const metadata: Metadata = {
  title: 'Pricing — OfRoot',
  description: 'Clear, transparent pricing for OfRoot Tech SaaS ($29–$99/mo) and consulting services ($6K–$12K+/mo). Choose your path.',
  keywords: ['pricing', 'SaaS', 'consulting', 'engineering', 'automation'],
  openGraph: {
    title: 'Pricing — OfRoot',
    description: 'SaaS and consulting pricing. Self-serve platform or dedicated retainer.',
    url: 'https://ofroot.technology/pricing',
    type: 'website',
  },
};

export default function PricingPage() {
  const pricingSchema = generatePricingSchema();
  const orgSchema = generateOrganizationSchema();

  return (
    <>
      {/* JSON-LD Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
      />

      <main className="flex flex-col w-full bg-white">
      {/* Hero */}
      <section className="py-32 px-6 sm:px-8 text-center bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-6 leading-tight text-gray-900">
            Simple, transparent pricing.
          </h1>

          <p className="text-xl sm:text-2xl text-gray-700 mb-8">
            Choose your path: self-serve SaaS or dedicated consulting retainer.
          </p>

          <p className="text-lg text-gray-700">
            Both options include hands-on support and a clear roadmap to success.
          </p>
        </div>
      </section>

      {/* OfRoot Tech SaaS Pricing */}
      <section className="py-24 px-6 sm:px-8 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="mb-16 text-center">
            <h2 className="text-4xl sm:text-5xl font-extrabold mb-4 text-gray-900">OfRoot Tech</h2>
            <p className="text-xl text-gray-700">Self-serve SaaS for home services, consultants, and local trades.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {/* Starter Tier */}
            <div className="rounded-lg border border-gray-200 p-8 bg-white shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Starter</h3>
              <p className="text-gray-600 mb-6">Perfect for getting started.</p>

              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">$29</span>
                <span className="text-gray-600">/month</span>
              </div>

              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-start gap-3">
                  <span className="text-green-600 font-bold mt-1">✓</span>
                  <span className="text-gray-700">Landing page + blog</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 font-bold mt-1">✓</span>
                  <span className="text-gray-700">Basic CRM (leads, contacts)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 font-bold mt-1">✓</span>
                  <span className="text-gray-700">Email automations</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 font-bold mt-1">✓</span>
                  <span className="text-gray-700">Basic reporting</span>
                </li>
              </ul>

              <PrimaryCta href="/subscribe">Start Free Trial</PrimaryCta>
            </div>

            {/* Pro Tier (Featured) */}
            <div className="rounded-lg border-2 border-black p-8 bg-black text-white shadow-lg flex flex-col relative">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black px-4 py-1 rounded-full text-sm font-semibold">
                Most Popular
              </div>

              <h3 className="text-2xl font-bold mb-2">Pro</h3>
              <p className="text-gray-300 mb-6">Best for growing teams.</p>

              <div className="mb-6">
                <span className="text-4xl font-bold">$99</span>
                <span className="text-gray-300">/month</span>
              </div>

              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-start gap-3">
                  <span className="text-green-400 font-bold mt-1">✓</span>
                  <span>Everything in Starter</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-400 font-bold mt-1">✓</span>
                  <span>Scheduling + dispatch</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-400 font-bold mt-1">✓</span>
                  <span>Invoicing + payments</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-400 font-bold mt-1">✓</span>
                  <span>Advanced automations</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-400 font-bold mt-1">✓</span>
                  <span>Priority support</span>
                </li>
              </ul>

              <Link
                href="/subscribe"
                className="inline-block w-full text-center rounded bg-white text-black px-8 py-3 font-semibold hover:bg-gray-100 transition"
              >
                Start Free Trial
              </Link>
            </div>

            {/* Enterprise Tier */}
            <div className="rounded-lg border border-gray-200 p-8 bg-white shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Enterprise</h3>
              <p className="text-gray-600 mb-6">For large teams and integrations.</p>

              <div className="mb-6">
                <span className="text-gray-900 font-bold">Custom pricing</span>
              </div>

              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-start gap-3">
                  <span className="text-green-600 font-bold mt-1">✓</span>
                  <span className="text-gray-700">Everything in Pro</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 font-bold mt-1">✓</span>
                  <span className="text-gray-700">Custom integrations</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 font-bold mt-1">✓</span>
                  <span className="text-gray-700">Dedicated account manager</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 font-bold mt-1">✓</span>
                  <span className="text-gray-700">SLA + uptime guarantee</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 font-bold mt-1">✓</span>
                  <span className="text-gray-700">White-label options</span>
                </li>
              </ul>

              <Link
                href="https://form.jotform.com/252643426225151"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-center rounded bg-black text-white px-8 py-3 font-semibold hover:bg-gray-900 transition"
              >
                Contact Sales
              </Link>
            </div>
          </div>

          <p className="text-center text-gray-700 text-sm">
            All plans include a free 14-day trial. No credit card required.
          </p>
        </div>
      </section>

      {/* Consulting/Retainer Pricing */}
      <section className="py-24 px-6 sm:px-8 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="mb-16 text-center">
            <h2 className="text-4xl sm:text-5xl font-extrabold mb-4 text-gray-900">Consulting & Retainers</h2>
            <p className="text-xl text-gray-700">Dedicated engineering support for custom builds, architecture, and automation.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Discovery Call */}
            <div className="rounded-lg border border-gray-200 p-8 bg-white shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Discovery Call</h3>
              <p className="text-gray-600 mb-6">Understand your needs and scope the engagement.</p>

              <div className="mb-6">
                <span className="text-3xl font-bold text-gray-900">Free</span>
                <span className="text-gray-600 ml-2">20 minutes</span>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 font-bold mt-1">→</span>
                  <span className="text-gray-700">Understand your goals and constraints</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 font-bold mt-1">→</span>
                  <span className="text-gray-700">Review architecture and tech stack</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 font-bold mt-1">→</span>
                  <span className="text-gray-700">Discuss timeline and engagement model</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 font-bold mt-1">→</span>
                  <span className="text-gray-700">Next steps and proposal</span>
                </li>
              </ul>

              <Link
                href="/consulting/book"
                className="inline-block w-full text-center rounded bg-black text-white px-6 py-3 font-semibold hover:bg-gray-900 transition"
              >
                Book a Call
              </Link>
            </div>

            {/* Retainer Model */}
            <div className="rounded-lg border-2 border-black p-8 bg-black text-white shadow-lg">
              <h3 className="text-2xl font-bold mb-2">Monthly Retainer</h3>
              <p className="text-gray-300 mb-6">Ongoing engineering support with predictable outcomes.</p>

              <div className="mb-6">
                <span className="text-3xl font-bold">$6K–$12K+</span>
                <span className="text-gray-300 ml-2">/month</span>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <span className="text-green-400 font-bold mt-1">✓</span>
                  <span>40 hours/month dedicated time</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-400 font-bold mt-1">✓</span>
                  <span>Sprint planning + weekly demos</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-400 font-bold mt-1">✓</span>
                  <span>Architecture + code review</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-400 font-bold mt-1">✓</span>
                  <span>Automation + AI integrations</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-400 font-bold mt-1">✓</span>
                  <span>Slack channel + priority support</span>
                </li>
              </ul>

              <Link
                href="/consulting/book"
                className="inline-block w-full text-center rounded bg-white text-black px-6 py-3 font-semibold hover:bg-gray-100 transition"
              >
                Book Discovery Call
              </Link>
            </div>
          </div>

          <div className="mt-12 p-8 rounded-lg bg-white border border-gray-200">
            <h4 className="text-lg font-bold text-gray-900 mb-4">What&apos;s included in every retainer:</h4>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="text-blue-600 font-bold">•</span> Full-stack development (frontend, backend, infra)
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-600 font-bold">•</span> Architecture & code review
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-600 font-bold">•</span> Performance optimization & monitoring
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-600 font-bold">•</span> Workflow automation & AI integrations
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-600 font-bold">•</span> Testing & reliability improvements
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-600 font-bold">•</span> Deploy confidence & observability
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="py-24 px-6 sm:px-8 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-extrabold mb-12 text-center text-gray-900">
            Which option is right for you?
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-900">
                  <th className="text-left py-4 px-4 font-bold text-gray-900">Feature</th>
                  <th className="text-center py-4 px-4 font-bold text-gray-900">OfRoot Tech SaaS</th>
                  <th className="text-center py-4 px-4 font-bold text-gray-900">Consulting Retainer</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="py-4 px-4 text-gray-900 font-semibold">Website + landing pages</td>
                  <td className="text-center py-4 px-4">✓</td>
                  <td className="text-center py-4 px-4">✓ (custom)</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-4 px-4 text-gray-900 font-semibold">CRM + lead tracking</td>
                  <td className="text-center py-4 px-4">✓</td>
                  <td className="text-center py-4 px-4">✓ (custom)</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-4 px-4 text-gray-900 font-semibold">Automations</td>
                  <td className="text-center py-4 px-4">✓ (pre-built)</td>
                  <td className="text-center py-4 px-4">✓ (bespoke)</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-4 px-4 text-gray-900 font-semibold">Dedicated architect</td>
                  <td className="text-center py-4 px-4">—</td>
                  <td className="text-center py-4 px-4">✓</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-4 px-4 text-gray-900 font-semibold">Custom integrations</td>
                  <td className="text-center py-4 px-4">Limited</td>
                  <td className="text-center py-4 px-4">✓</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-4 px-4 text-gray-900 font-semibold">Weekly demos</td>
                  <td className="text-center py-4 px-4">—</td>
                  <td className="text-center py-4 px-4">✓</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-4 px-4 text-gray-900 font-semibold">Support tier</td>
                  <td className="text-center py-4 px-4">Email</td>
                  <td className="text-center py-4 px-4">Slack + priority</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-gray-900 font-semibold">Setup time</td>
                  <td className="text-center py-4 px-4">Days</td>
                  <td className="text-center py-4 px-4">Weeks (custom)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-6 sm:px-8 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-extrabold mb-12 text-center text-gray-900">Pricing FAQ</h2>

          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Do you offer discounts for annual billing?</h3>
              <p className="text-gray-700">Yes. Pay annually and save 20%. Contact us for details.</p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Can I switch between SaaS and consulting?</h3>
              <p className="text-gray-700">Absolutely. Many clients start with SaaS, then add consulting for custom work or integrations.</p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">What if I need more than 40 hours/month?</h3>
              <p className="text-gray-700">We scale up. Additional hours are billed at $150/hr, or upgrade to a higher retainer tier.</p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Do you offer refunds or money-back guarantees?</h3>
              <p className="text-gray-700">SaaS: 14-day money-back guarantee on your first month. Consulting: 30-day cancellation window with 50% refund if unsatisfied.</p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">What about hidden fees?</h3>
              <p className="text-gray-700">None. Pricing is all-inclusive. No setup fees, no hidden charges, no surprises.</p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Can I cancel anytime?</h3>
              <p className="text-gray-700">SaaS: Cancel anytime, no lock-in. Consulting: 30-day notice preferred.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 sm:px-8 bg-gradient-to-b from-white to-gray-50 text-center">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-extrabold mb-6 text-gray-900">
            Ready to get started?
          </h2>

            <p className="text-xl text-gray-700 mb-10">
            Pick a plan or book a call with our team. We&apos;re here to help.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <PrimaryCta href="/subscribe">Start SaaS Free Trial</PrimaryCta>
            <Link
              href="/consulting/book"
              className="inline-block rounded border border-gray-300 px-8 py-3 text-gray-900 font-semibold hover:border-gray-400 hover:bg-gray-50 transition"
            >
              Book Discovery Call
            </Link>
          </div>
        </div>
      </section>
    </main>
    </>
  );
}
