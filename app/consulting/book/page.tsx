/**
 * Consulting Book a Call
 *
 * Purpose:
 *  - Landing page for booking a discovery call with the consulting team.
 *  - Embed Calendly widget for easy scheduling.
 *  - Provide context about what to expect.
 *  - Reduce friction and set expectations.
 *
 * Notes:
 *  - Server component wrapper to handle metadata export.
 *  - Client component (BookingWidget) handles Calendly initialization.
 *  - Calendly URL: https://calendly.com/dimitri-mcdaniel-9oh/new-meeting
 */

import type { Metadata } from 'next';
import BookingWidget from '@/components/consulting/BookingWidget';
import PreCallBriefForm from '@/components/consulting/PreCallBriefForm';
import Link from 'next/link';
import { generateConsultingFaqSchema, generateOrganizationSchema } from '@/app/lib/schemas';

export const metadata: Metadata = {
  title: 'Book an Integration Call · OfRoot',
  description: 'Schedule a 20-minute integration call to review lead capture, meeting workflows, and pipeline automation priorities.',
  keywords: ['integration call', 'automation strategy', 'HubSpot integration', 'Meta API'],
  openGraph: {
    title: 'Book an Integration Call · OfRoot',
    description: 'Plan your lead, meeting, and pipeline automation scope.',
    url: 'https://ofroot.technology/consulting/book',
    type: 'website',
  },
};

export default function ConsultingBookPage() {
  const faqSchema = generateConsultingFaqSchema();
  const orgSchema = generateOrganizationSchema();

  return (
    <>
      {/* JSON-LD Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
      />

      <main className="flex flex-col w-full bg-white">
      {/* Hero */}
      <section className="py-24 px-6 sm:px-8 text-center bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-5xl sm:text-6xl font-extrabold mb-6 leading-tight text-gray-900">
            Let&apos;s map your automation stack.
          </h1>

          <p className="text-xl sm:text-2xl text-gray-600 mb-4">
            Book a 20-minute integration call to review your lead flow, meeting bottlenecks, and pipeline priorities.
          </p>

          <p className="text-lg text-gray-600">
            No generic pitch. We focus on what to automate first and what to fix next.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-24 px-6 sm:px-8 bg-white">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left: Context & Expectations */}
          <div>
            <h2 className="text-3xl font-extrabold mb-8 text-gray-900">What to Expect</h2>

            <div className="space-y-8">
              {/* What We'll Cover */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-2xl">📋</span> What We'll Cover
                </h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-3">
                    <span className="text-blue-600 font-bold mt-1">→</span>
                    <span>Your current lead flow and conversion bottlenecks</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-600 font-bold mt-1">→</span>
                    <span>Your stack (HubSpot, Meta, Make, Zapier, APIs)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-600 font-bold mt-1">→</span>
                    <span>Timeline, SLA, and budget expectations</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-600 font-bold mt-1">→</span>
                    <span>Priority order: meetings, leads, and pipeline sanity</span>
                  </li>
                </ul>
              </div>

              {/* What You Should Bring */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-2xl">🎯</span> What You Should Bring
                </h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-3">
                    <span className="text-green-600 font-bold mt-1">✓</span>
                    <span>Where leads are getting lost, delayed, or misrouted</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-600 font-bold mt-1">✓</span>
                    <span>An idea of your budget or timeline (no pressure)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-600 font-bold mt-1">✓</span>
                    <span>Any existing workflow maps, CRM fields, or webhook docs</span>
                  </li>
                </ul>
              </div>

              {/* After the Call */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-2xl">📧</span> After the Call
                </h3>
                <p className="text-gray-700 mb-4">
                  Within 2 days, you'll receive:
                </p>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-3">
                    <span className="text-purple-600 font-bold mt-1">✦</span>
                    <span>A clear architecture or roadmap for your project</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-purple-600 font-bold mt-1">✦</span>
                    <span>A proposal with scope, timeline, and cost</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-purple-600 font-bold mt-1">✦</span>
                    <span>Honest feedback on your approach</span>
                  </li>
                </ul>
              </div>

              {/* Who You'll Talk To */}
              <div className="p-6 rounded-lg bg-gray-50 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Who You'll Talk To</h3>
                <p className="text-gray-700">
                  <span className="font-semibold">Dimitri</span> — 8+ years building platforms for high-growth companies. Senior architect, not a salesperson.
                </p>
              </div>
            </div>
          </div>

          {/* Right: Calendly Widget */}
          <div>
            <BookingWidget />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-6 sm:px-8 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-extrabold mb-12 text-center text-gray-900">Common Questions</h2>

          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">How much does a discovery call cost?</h3>
              <p className="text-gray-700">It's free. No credit card required. We just want to understand your project.</p>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">What if I'm not ready to commit to a retainer?</h3>
              <p className="text-gray-700">
                That's fine. We can start with a scoped integration sprint to fix one high-impact workflow first.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Do you work with non-technical founders?</h3>
              <p className="text-gray-700">Yes. We've worked with founders, PMs, and non-technical co-founders. We'll translate technical concepts and be clear about tradeoffs.</p>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">How long until we can start?</h3>
              <p className="text-gray-700">After the call, typically 1–2 weeks. We'll align on the statement of work, then begin onboarding and project scoping.</p>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">What time zones do you work in?</h3>
              <p className="text-gray-700">US Eastern (ET). We can accommodate early/late calls if needed, but typically 9am–5pm ET works best.</p>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Can I send a project brief before the call?</h3>
              <p className="text-gray-700">
                Absolutely. After you book, you'll get a confirmation with a form to share context. The more you tell us, the better we can prepare.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pre-Call Brief Form */}
      <PreCallBriefForm />

      {/* Alternative CTAs */}
      <section className="py-24 px-6 sm:px-8 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold mb-8 text-gray-900">Not ready yet?</h2>

          <p className="text-xl text-gray-600 mb-8">
            Check out our pricing, read case studies, or explore OfRoot Tech SaaS first.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/pricing"
              className="inline-block rounded bg-black text-white px-8 py-3 font-semibold hover:bg-gray-900 transition"
            >
              View Pricing
            </Link>
            <Link
              href="/"
              className="inline-block rounded border border-gray-300 px-8 py-3 text-gray-900 font-semibold hover:border-gray-400 hover:bg-gray-50 transition"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </section>
    </main>
    </>
  );
}
