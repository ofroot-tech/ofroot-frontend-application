// app/ontask/page.tsx
import Link from 'next/link';

export const metadata = {
  title: 'OnTask — CRM & Automation Toolkit for Local Service Businesses | OfRoot',
  description:
    'Automate leads, follow‑ups, and reviews with built‑in CRM, invoicing, integrations, and reporting — designed for small teams.',
  alternates: { canonical: '/ontask' },
};

export default function OnTaskLanding() {
  return (
    <div className="mx-auto max-w-6xl px-4 md:px-6 section-pad">
      <header className="text-center max-w-3xl mx-auto reveal-in fade-only">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">OnTask</h1>
        <p className="mt-3 text-lg text-gray-700">CRM & automation toolkit for local service businesses — automate leads, follow‑ups, and reviews with built‑in CRM, invoicing, and reporting.</p>
        <p className="mt-2 text-sm text-gray-600">Trusted by crews across home services — roofers, landscapers, cleaners, more.</p>
        <p className="mt-3 text-base text-gray-800">Stop losing leads. Automate responses, reviews, and reminders — all in one place.</p>
        <div className="mt-5 flex items-center justify-center gap-3">
          <Link href="/subscribe?product=ontask" className="bg-black text-white hover:bg-gray-900 font-semibold py-3 px-6 rounded-full">Start $1 trial</Link>
          <a href="#features" className="underline text-gray-800">See features</a>
        </div>
      </header>

  <section id="features" className="mt-12 grid grid-cols-1 md:grid-cols-2 grid-gap-modern reveal-in">
        <div className="rounded-xl border p-6 bg-white/80 backdrop-blur shadow-sm">
          <h3 className="text-xl font-semibold">What you get</h3>
          <ul className="mt-2 space-y-2 text-gray-700 text-sm">
            <li>• SEO landing pages and blog</li>
            <li>• Email/SMS automations for follow‑ups and reviews</li>
            <li>• Lead inbox and estimates/invoices</li>
            <li>• Branding help and collateral templates</li>
          </ul>
        </div>
        <div className="rounded-xl border p-6 bg-white/80 backdrop-blur shadow-sm">
          <h3 className="text-xl font-semibold">Why teams pick OnTask</h3>
          <ul className="mt-2 space-y-2 text-gray-700 text-sm">
            <li>• Fast setup and paved paths</li>
            <li>• Reporting to see what’s working</li>
            <li>• Made for local pros — no fluff</li>
          </ul>
        </div>
      </section>

      {/* Depth sections: Automation, CRM, Integrations, Reporting, Pricing justification */}
  <section className="mt-10 grid grid-cols-1 md:grid-cols-2 grid-gap-modern reveal-in">
        <div className="rounded-xl border p-6 bg-white/80 backdrop-blur shadow-sm">
          <h3 className="text-lg font-semibold">⚙️ Automation depth</h3>
          <ul className="mt-2 space-y-2 text-gray-700 text-sm">
            <li>• Workflow triggers (new lead → intro SMS → follow‑up in 3 days)</li>
            <li>• Calendar integration for bookings and reminders</li>
          </ul>
        </div>
        <div className="rounded-xl border p-6 bg-white/80 backdrop-blur shadow-sm">
          <h3 className="text-lg font-semibold">💬 CRM & client management</h3>
          <ul className="mt-2 space-y-2 text-gray-700 text-sm">
            <li>• Customer profiles with notes, job history, and payments</li>
            <li>• Simple pipeline: new lead → estimate → booked → complete</li>
          </ul>
        </div>
        <div className="rounded-xl border p-6 bg-white/80 backdrop-blur shadow-sm">
          <h3 className="text-lg font-semibold">Integrations</h3>
          <ul className="mt-2 space-y-2 text-gray-700 text-sm">
            <li>• Google Business Profile, Stripe, QuickBooks</li>
            <li>• Zapier‑style hooks or API access for pros</li>
          </ul>
        </div>
        <div className="rounded-xl border p-6 bg-white/80 backdrop-blur shadow-sm">
          <h3 className="text-lg font-semibold">📊 Reporting</h3>
          <ul className="mt-2 space-y-2 text-gray-700 text-sm">
            <li>• Lead sources, review rates, and conversion</li>
            <li>• Month‑over‑month comparison dashboards</li>
          </ul>
        </div>
      </section>

  <section className="mt-12 text-center reveal-in fade-only">
        <Link href="/subscribe?product=ontask" className="inline-flex items-center bg-[#20b2aa] text-white hover:bg-[#1a8f85] font-semibold py-3 px-6 rounded-full">Start your $1 trial</Link>
        <p className="mt-2 text-sm text-gray-600">Built for small teams — saves 5+ hours/week and boosts reviews 2×. Normally $25/mo (replaces Mailchimp, Google Forms, etc.). Try it for $1 for 14 days — cancel anytime.</p>
      </section>

      {/* sticky CTA for small screens */}
      <div className="fixed inset-x-0 bottom-3 mx-auto w-full max-w-md px-4 sm:hidden z-40">
        <Link href="/subscribe?product=ontask" className="block text-center bg-black text-white hover:bg-gray-900 font-semibold py-3 px-6 rounded-full shadow-lg">Start $1 trial</Link>
      </div>

      {/* JSON-LD: SoftwareApplication */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'OnTask',
            applicationCategory: 'BusinessApplication',
            offers: { '@type': 'Offer', price: '25', priceCurrency: 'USD' },
            provider: { '@type': 'Organization', name: 'OfRoot' },
            description:
              'CRM & automation toolkit for local service businesses — automate leads, follow‑ups, reviews, and reminders with built‑in CRM, invoicing, integrations, and reporting.',
          }),
        }}
      />
    </div>
  );
}
