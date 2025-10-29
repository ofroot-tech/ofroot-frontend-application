// app/ontask/page.tsx
import Link from 'next/link';
import SectionSnapper from '@/components/SectionSnapper';

export const metadata = {
  title: 'OnTask — Simple Scheduling, Estimates, Invoices, and Payments for HVAC, Cleaning, and Plumbing',
  description:
    'Run your service business without the chaos. One calendar, fast estimates→invoices, and Stripe payments. Built for 1–10 person teams. $1 trial • Starter $25/mo.',
  alternates: { canonical: '/ontask' },
};

export default function OnTaskLanding() {
  return (
    <div className="alpha-scope mx-auto max-w-6xl px-4 md:px-6">
      {/* Snapper for graceful fades between full sections */}
      <SectionSnapper containerId="ontask-snap" />

      <div id="ontask-snap" className="snap-page">
      {/* Hero: full viewport height */}
      <section id="hero" data-snap-section className="section-full snap-fade relative flex items-center">
        <div className="w-full text-center max-w-3xl mx-auto reveal-in fade-only">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">Run your day without the chaos</h1>
          <p className="mt-3 text-lg text-gray-700">One clean calendar. Fast estimates → invoices. Stripe payments your customers trust. Built for 1–10 person HVAC, cleaning, and plumbing teams.</p>
          <div className="mt-5 flex items-center justify-center gap-3">
            <Link href="/subscribe?product=ontask" className="bg-black text-white hover:bg-gray-900 font-semibold py-3 px-6 rounded-full">Start your $1 trial</Link>
            <a href="#features" className="underline text-gray-800">See features</a>
          </div>
          <p className="mt-3 text-sm text-gray-600">Starter $25/month • Cancel anytime • No long setup</p>
        </div>
        {/* Scroll chevron indicator */}
        <div className="pointer-events-auto absolute inset-x-0 bottom-6 flex justify-center">
          <a href="#social-proof" className="scroll-indicator" aria-label="Scroll">
            <svg className="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </a>
        </div>
      </section>

  {/* Social Proof */}
  <section id="social-proof" data-snap-section className="section-full snap-fade scroll-target reveal-in">
        <div className="grid gap-6 md:grid-cols-3 items-center">
          <div className="md:col-span-2">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-900">Trusted by small teams</h2>
            <p className="mt-2 text-gray-700">Simple, reliable tools that get out of your way and help you get paid faster.</p>
          </div>
          <div className="flex items-center justify-center gap-4 opacity-80">
            <img src="/logos/stripe.svg" alt="Stripe" className="h-6" />
            <img src="/logos/nextjs.svg" alt="Next.js" className="h-6" />
            <img src="/logos/react.svg" alt="React" className="h-6" />
          </div>
        </div>
        <blockquote className="mt-6 rounded-xl border bg-white/90 backdrop-blur p-6 shadow-sm responsive-card">
          <p className="text-gray-900 text-lg">“We left spreadsheets and group texts. With OnTask, invoicing is <strong>40% faster*</strong> and the crew stays in sync.”</p>
          <footer className="mt-3 text-sm text-gray-600">— Sam R., HVAC Owner‑Operator</footer>
          <p className="mt-2 text-xs text-gray-500">*Based on internal time‑tracking and team feedback; results may vary.</p>
        </blockquote>
        <div className="mt-4">
          <Link href="/subscribe?product=ontask" className="inline-flex bg-black text-white hover:bg-gray-900 font-semibold py-2.5 px-5 rounded-full">Start your $1 trial</Link>
        </div>
      </section>

      {/* Problem & Promise */}
      <section id="problem" data-snap-section className="section-full snap-fade reveal-in">
        <h2 className="text-3xl font-semibold text-gray-900">From scattered to streamlined</h2>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 grid-gap-modern smart-flow">
          <div className="rounded-xl border p-6 bg-white/90 shadow-sm responsive-card">
            <h3 className="text-lg font-semibold text-gray-900">Before OnTask</h3>
            <ul className="mt-3 space-y-2 text-gray-700">
              <li>• Double‑booked jobs and missed messages</li>
              <li>• Late invoices and slow payments</li>
              <li>• Forgotten follow‑ups and fewer reviews</li>
            </ul>
          </div>
          <div className="rounded-xl border p-6 bg-white/90 shadow-sm responsive-card">
            <h3 className="text-lg font-semibold text-gray-900">After OnTask</h3>
            <ul className="mt-3 space-y-2 text-gray-700">
              <li>• One calendar that keeps everyone aligned</li>
              <li>• One‑click estimates → invoices</li>
              <li>• Stripe payments with instant receipts</li>
              <li>• Gentle automations for reminders and reviews</li>
            </ul>
          </div>
        </div>
        <div className="mt-6">
          <Link href="/subscribe?product=ontask" className="inline-flex bg-black text-white hover:bg-gray-900 font-semibold py-2.5 px-5 rounded-full">Start your $1 trial</Link>
        </div>
      </section>

      <section id="features" data-snap-section className="section-full snap-fade reveal-in">
        <h2 className="text-3xl font-semibold text-gray-900 text-center">Everything you need—without the bloat</h2>
        <p className="mt-2 text-gray-700 text-center max-w-2xl mx-auto">Clean scheduling, fast paperwork, and payments that just work. Simple, fast, and mobile‑friendly.</p>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 grid-gap-comfy smart-flow">
          <div className="rounded-xl border p-6 bg-white/90 shadow-sm responsive-card">
            <h3 className="text-xl font-semibold text-gray-900">Scheduling that keeps everyone aligned</h3>
            <p className="mt-1 text-gray-700">Drag‑and‑drop calendar with technician assignments and live availability.</p>
            <p className="mt-3"><span className="benefit-chip">Benefit</span> <span className="benefit-line">Book faster and prevent double‑bookings.</span></p>
          </div>
          <div className="rounded-xl border p-6 bg-white/90 shadow-sm responsive-card">
            <h3 className="text-xl font-semibold text-gray-900">Estimates & invoices—done fast</h3>
            <p className="mt-1 text-gray-700">Create estimates on‑site and convert to invoices instantly.</p>
            <p className="mt-3"><span className="benefit-chip">Benefit</span> <span className="benefit-line">Turn approvals into revenue without delays.</span></p>
          </div>
          <div className="rounded-xl border p-6 bg-white/90 shadow-sm responsive-card">
            <h3 className="text-xl font-semibold text-gray-900">Stripe‑powered payments</h3>
            <p className="mt-1 text-gray-700">Secure checkout links, receipts, and payment status in one view.</p>
            <p className="mt-3"><span className="benefit-chip">Benefit</span> <span className="benefit-line">Get paid faster with less chasing.</span></p>
          </div>
          <div className="rounded-xl border p-6 bg-white/90 shadow-sm responsive-card">
            <h3 className="text-xl font-semibold text-gray-900">Simple customer CRM</h3>
            <p className="mt-1 text-gray-700">Contact info, job history, notes, and activity in one place.</p>
            <p className="mt-3"><span className="benefit-chip">Benefit</span> <span className="benefit-line">Know every customer’s story at a glance.</span></p>
          </div>
          <div className="rounded-xl border p-6 bg-white/90 shadow-sm responsive-card">
            <h3 className="text-xl font-semibold text-gray-900">Automations that follow up for you</h3>
            <p className="mt-1 text-gray-700">Review requests, estimate reminders, and invoice nudges.</p>
            <p className="mt-3"><span className="benefit-chip">Benefit</span> <span className="benefit-line">Earn more reviews and reduce overdue invoices.</span></p>
          </div>
          <div className="rounded-xl border p-6 bg-white/90 shadow-sm responsive-card">
            <h3 className="text-xl font-semibold text-gray-900">Reporting that shows what’s working</h3>
            <p className="mt-1 text-gray-700">Revenue, unpaid invoices, job volume, and trends in one dashboard.</p>
            <p className="mt-3"><span className="benefit-chip">Benefit</span> <span className="benefit-line">See cash flow and plan your next week.</span></p>
          </div>
          <div className="rounded-xl border p-6 bg-white/90 shadow-sm responsive-card">
            <h3 className="text-xl font-semibold text-gray-900">Mobile‑friendly for the field</h3>
            <p className="mt-1 text-gray-700">Works great on phones and tablets, wherever work happens.</p>
            <p className="mt-3"><span className="benefit-chip">Benefit</span> <span className="benefit-line">Techs stay updated without calling in.</span></p>
          </div>
          <div className="rounded-xl border p-6 bg-white/90 shadow-sm responsive-card">
            <h3 className="text-xl font-semibold text-gray-900">Quick setup—start today</h3>
            <p className="mt-1 text-gray-700">Guided onboarding and smart defaults—no long calls required.</p>
            <p className="mt-3"><span className="benefit-chip">Benefit</span> <span className="benefit-line">Schedule your first job in minutes.</span></p>
          </div>
        </div>
        <div className="mt-8 text-center">
          <Link href="/subscribe?product=ontask" className="inline-flex bg-black text-white hover:bg-gray-900 font-semibold py-3 px-6 rounded-full">Start your $1 trial</Link>
        </div>
      </section>

      {/* Journey: Discovery → Try → Adopt */}
      <section id="journey" data-snap-section className="section-full snap-fade reveal-in">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-semibold text-gray-900">Try it. Feel the calm. Bring your team.</h2>
          <p className="mt-2 text-gray-700">A low‑risk path from first job to daily rhythm.</p>
        </div>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 grid-gap-modern smart-flow">
          {/* Discovery */}
          <div id="discovery" className="rounded-xl border p-6 bg-white/90 backdrop-blur shadow-sm responsive-card">
            <h3 className="text-lg font-semibold text-gray-900">1) Discover</h3>
            <p className="mt-2 text-gray-700">See the calendar, invoices, and payments in one place. OnTask feels lighter and moves faster than the tools you’ve tried.</p>
            <ul className="mt-3 space-y-1 text-sm text-gray-700">
              <li>• See clear benefits for scheduling, invoices, and follow‑ups</li>
              <li>• Skim real screenshots; confirm it fits 1–10 person crews</li>
            </ul>
            <div className="mt-4 flex gap-3">
              <a href="#features" className="underline text-gray-800">Browse features</a>
              <Link href="/subscribe?product=ontask" className="text-[#20b2aa] hover:underline">Start $1 trial</Link>
            </div>
          </div>
          {/* Try */}
          <div id="try" className="rounded-xl border p-6 bg-white/90 backdrop-blur shadow-sm responsive-card">
            <h3 className="text-lg font-semibold text-gray-900">2) Try</h3>
            <p className="mt-2 text-gray-700">Start the $1 trial. Add a customer and one job. Send an estimate, convert it, and take a payment. Feel the difference in a day.</p>
            <ul className="mt-3 space-y-1 text-sm text-gray-700">
              <li>• Drag‑and‑drop a job onto the calendar</li>
              <li>• Send a branded estimate; convert to invoice in one click</li>
              <li>• Watch automations send a review request and gentle reminders</li>
            </ul>
            <div className="mt-4 flex gap-3">
              <Link href="/subscribe?product=ontask" className="bg-black text-white hover:bg-gray-900 font-semibold py-2 px-4 rounded-full">Start trial</Link>
              <a href="#pricing" className="underline text-gray-800">See pricing</a>
            </div>
          </div>
          {/* Adopt */}
          <div id="adopt" className="rounded-xl border p-6 bg-white/90 backdrop-blur shadow-sm responsive-card">
            <h3 className="text-lg font-semibold text-gray-900">3) Adopt</h3>
            <p className="mt-2 text-gray-700">Invite techs, share the calendar, and run the same simple flow: lead → estimate → booked → complete → review.</p>
            <ul className="mt-3 space-y-1 text-sm text-gray-700">
              <li>• Unlimited invites on the Starter plan</li>
              <li>• Keep your data; cancel anytime</li>
              <li>• Typical teams save 3–5 hrs/week on admin</li>
            </ul>
            <div className="mt-4 flex gap-3">
              <Link href="/subscribe?product=ontask" className="text-[#20b2aa] hover:underline">Bring your team</Link>
              <a href="#features" className="underline text-gray-800">What’s included</a>
            </div>
          </div>
        </div>
      </section>

      {/* Discovery / Why teams choose OnTask */}
      <section id="discovery" data-snap-section className="section-full snap-fade reveal-in">
        <h2 className="text-3xl font-semibold text-gray-900 text-center">Why small teams switch to OnTask</h2>
        <p className="mt-2 text-gray-700 text-center max-w-2xl mx-auto">Essentials of <strong>home service business software</strong>—without the bloat in legacy tools like Jobber, Housecall Pro, and Workiz.</p>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 grid-gap-modern smart-flow">
          <div className="rounded-xl border p-6 bg-white/90 shadow-sm responsive-card">
            <h3 className="text-lg font-semibold text-gray-900">Fast setup, zero hassle</h3>
            <p className="mt-1 text-gray-700">Start the $1 trial, add a customer, and book your first job in minutes.</p>
          </div>
          <div className="rounded-xl border p-6 bg-white/90 shadow-sm responsive-card">
            <h3 className="text-lg font-semibold text-gray-900">Built for the field</h3>
            <p className="mt-1 text-gray-700">A modern, mobile‑friendly <strong>field service management app</strong> your techs will actually use.</p>
          </div>
          <div className="rounded-xl border p-6 bg-white/90 shadow-sm responsive-card">
            <h3 className="text-lg font-semibold text-gray-900">Clear value at $25/month</h3>
            <p className="mt-1 text-gray-700">No per‑technician fees. Cancel anytime. Keep your data if you leave.</p>
          </div>
        </div>
        <div className="mt-8 text-center">
          <Link href="/subscribe?product=ontask" className="inline-flex bg-black text-white hover:bg-gray-900 font-semibold py-3 px-6 rounded-full">Start your $1 trial</Link>
          <Link href="/marketing" className="ml-4 underline text-gray-900">See how we help teams grow</Link>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" data-snap-section className="section-full snap-fade reveal-in text-center">
        <h2 className="text-3xl font-semibold text-gray-900">Simple, transparent pricing</h2>
        <p className="mt-2 text-gray-700">Starter plan <span className="font-semibold text-gray-900">$25/month</span>. Cancel anytime.</p>
        <div className="mt-6 mx-auto max-w-2xl rounded-2xl border bg-white/90 backdrop-blur p-8 shadow-sm responsive-card">
          <ul className="text-gray-700 space-y-2 text-left max-w-sm mx-auto">
            <li>• Scheduling & dispatch</li>
            <li>• Estimates & invoices</li>
            <li>• Stripe payments</li>
            <li>• Simple CRM</li>
            <li>• Automations & reminders</li>
            <li>• Reporting</li>
          </ul>
          <div className="mt-5 flex items-center justify-center gap-3">
            <Link href="/subscribe?product=ontask" className="bg-black text-white hover:bg-gray-900 font-semibold py-3 px-6 rounded-full">Start your $1 trial</Link>
            <Link href="/helpr" className="underline text-gray-800">Get help setting up</Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" data-snap-section className="section-full snap-fade reveal-in">
        <h2 className="text-3xl font-semibold text-gray-900 text-center">FAQs</h2>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 grid-gap-modern smart-flow">
          <div className="rounded-xl border p-6 bg-white/90 shadow-sm responsive-card">
            <h3 className="text-lg font-semibold text-gray-900">Is there a free trial?</h3>
            <p className="mt-1 text-gray-700">Yes—start for $1. If it saves you an hour a day, it pays for itself.</p>
          </div>
          <div className="rounded-xl border p-6 bg-white/90 shadow-sm responsive-card">
            <h3 className="text-lg font-semibold text-gray-900">Do you charge per technician?</h3>
            <p className="mt-1 text-gray-700">No. The Starter plan is $25/month for small teams.</p>
          </div>
          <div className="rounded-xl border p-6 bg-white/90 shadow-sm responsive-card">
            <h3 className="text-lg font-semibold text-gray-900">Is it good for HVAC, cleaning, and plumbing?</h3>
            <p className="mt-1 text-gray-700">Yes—OnTask is optimized for <strong>cleaning, HVAC, and plumbing scheduling</strong> plus invoicing and payments.</p>
          </div>
          <div className="rounded-xl border p-6 bg-white/90 shadow-sm responsive-card">
            <h3 className="text-lg font-semibold text-gray-900">Can I cancel anytime?</h3>
            <p className="mt-1 text-gray-700">Yes. You can export your data and cancel whenever you like.</p>
          </div>
        </div>
        <div className="mt-8 text-center">
          <Link href="/subscribe?product=ontask" className="inline-flex bg-black text-white hover:bg-gray-900 font-semibold py-3 px-6 rounded-full">Start your $1 trial</Link>
        </div>
      </section>

  <section data-snap-section className="section-full snap-fade text-center reveal-in fade-only">
        <Link href="/subscribe?product=ontask" className="inline-flex items-center bg-[#20b2aa] text-white hover:bg-[#1a8f85] font-semibold py-3 px-6 rounded-full">Start your $1 trial</Link>
    <p className="mt-2 text-sm text-gray-600">Made for crews of 1–10. Save hours each week and never forget a follow‑up. Starter $25/month — try it for $1, cancel anytime.</p>
      </section>

      </div>

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
              'OnTask helps HVAC, plumbing, and other local pros schedule jobs, send estimates & invoices, take payments (Stripe), and automate reviews & reminders — simple to set up, mobile‑friendly, and affordable (Starter $25/month).',
          }),
        }}
      />
    </div>
  );
}
