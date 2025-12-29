// app/ontask/page.tsx
import Image from 'next/image';
import Link from 'next/link';
import SectionSnapper from '@/components/SectionSnapper';

export const metadata = {
  title: 'OnTask — Simple scheduling, estimates, invoices, and payments for home services',
  description:
    'One clean calendar, fast estimates → invoices, and Stripe payments your customers trust. Built for 1–10 person HVAC, cleaning, and plumbing teams. Starter $29/mo, Plus $299/mo. Add a 30-day AI intake/routing pilot when ready.',
  alternates: { canonical: '/ontask' },
};

export default function OnTaskLanding() {
  return (
    <div className="alpha-scope mx-auto max-w-6xl px-4 md:px-6">
      {/* Snapper for graceful fades between full sections */}
      <SectionSnapper containerId="ontask-snap" />

      <div id="ontask-snap" className="snap-page">
      {/* Hero: single promise and one clear CTA */}
      <section id="hero" data-snap-section className="section-full snap-fade relative flex items-center">
        <div className="w-full text-center max-w-3xl mx-auto reveal-in fade-only space-y-4">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">Run your crew from one screen.</h1>
          <p className="text-lg text-gray-700">OnTask keeps home service teams in sync: one calendar, fast estimates → invoices, Stripe payments customers trust, and a clear ladder to AI intake.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/subscribe?product=ontask" className="bg-black text-white hover:bg-gray-900 font-semibold py-3 px-6 rounded-full">Start OnTask</Link>
            <a href="#features" className="underline text-gray-800">See what’s included</a>
          </div>
          <p className="text-sm text-gray-600">Starter $29/month · Plus $299/month for integrations and higher volume · Annual saves ~2 months</p>
        </div>
      </section>

      {/* Pilot banner to bridge to the AI build */}
      <section data-snap-section className="section-full snap-fade reveal-in">
        <div className="rounded-2xl border bg-gray-900 text-white p-6 sm:p-7 shadow-card flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-emerald-200">Optional 30-day pilot</p>
            <h2 className="text-2xl font-bold">Add AI intake + routing on top of OnTask</h2>
            <p className="text-sm text-gray-100">We’ll build AI-assisted intake, qualification, and scheduling for your OnTask stack in 30 days. Priced for home services pilots.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/pricing#pilot" className="inline-flex items-center bg-white text-gray-900 hover:bg-gray-100 font-semibold py-2.5 px-4 rounded-full">See the pilot plan</Link>
            <Link href="/consulting/book" className="inline-flex items-center border border-white/40 text-white hover:bg-white/10 font-semibold py-2.5 px-4 rounded-full">Scope your pilot</Link>
          </div>
        </div>
      </section>

      {/* Pricing ladder: Starter → Plus → 30-day pilot */}
      <section id="pricing-ladder" data-snap-section className="section-full snap-fade reveal-in">
        <div className="rounded-2xl border bg-white/90 backdrop-blur p-6 sm:p-7 shadow-card">
          <h2 className="text-3xl font-semibold text-gray-900 text-center">A clear pricing ladder</h2>
          <p className="mt-2 text-gray-700 text-center">Start on Starter, move to Plus when you need integrations and higher volume, then graduate to a 30-day AI intake pilot.</p>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border p-5 bg-white shadow-sm text-left">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Starter</p>
              <h3 className="text-2xl font-bold text-gray-900">$29/mo</h3>
              <p className="mt-1 text-sm text-gray-700">Calendar, estimates → invoices, Stripe payments, basic automations. Annual: ~2 months free.</p>
              <div className="mt-3 flex gap-3">
                <Link href="/subscribe?product=ontask" className="bg-black text-white hover:bg-gray-900 font-semibold py-2 px-4 rounded-full">Start</Link>
              </div>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm text-left">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">OnTask Plus</p>
              <h3 className="text-2xl font-bold text-gray-900">$299/mo</h3>
              <p className="mt-1 text-sm text-gray-800">Integrations, higher volume, priority chat. Annual: ~2 months free. Best for crews ready to automate more.</p>
              <div className="mt-3 flex gap-3">
                <Link href="/subscribe?product=ontask" className="bg-gray-900 text-white hover:bg-black font-semibold py-2 px-4 rounded-full">Upgrade</Link>
                <Link href="/consulting/book" className="underline text-gray-900">Talk to sales</Link>
              </div>
            </div>
            <div className="rounded-xl border p-5 bg-white shadow-sm text-left">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">30-day pilot</p>
              <h3 className="text-2xl font-bold text-gray-900">From $12K</h3>
              <p className="mt-1 text-sm text-gray-700">AI intake + routing on top of OnTask. Weekly demos, guardrails, and conversion reporting.</p>
              <div className="mt-3 flex gap-3">
                <Link href="/pricing#pilot" className="bg-black text-white hover:bg-gray-900 font-semibold py-2 px-4 rounded-full">View pilot</Link>
                <Link href="/consulting/book" className="underline text-gray-900">Scope it</Link>
              </div>
            </div>
          </div>
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
            <Image src="/logos/stripe.svg" alt="Stripe" width={80} height={24} className="h-6 w-auto" />
            <Image src="/logos/nextjs.svg" alt="Next.js" width={80} height={24} className="h-6 w-auto" />
            <Image src="/logos/react.svg" alt="React" width={80} height={24} className="h-6 w-auto" />
          </div>
        </div>
        <blockquote className="mt-6 rounded-xl border bg-white/90 backdrop-blur p-6 shadow-sm responsive-card">
          <p className="text-gray-900 text-lg">“We left spreadsheets and group texts. With OnTask, invoicing is <strong>40% faster*</strong> and the crew stays in sync.”</p>
          <footer className="mt-3 text-sm text-gray-600">— Sam R., HVAC Owner‑Operator</footer>
          <p className="mt-2 text-xs text-gray-500">*Based on internal time‑tracking and team feedback; results may vary.</p>
        </blockquote>
        <div className="mt-4">
          <Link href="/subscribe?product=ontask" className="inline-flex bg-black text-white hover:bg-gray-900 font-semibold py-2.5 px-5 rounded-full">Start OnTask</Link>
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
          <Link href="/subscribe?product=ontask" className="inline-flex bg-black text-white hover:bg-gray-900 font-semibold py-2.5 px-5 rounded-full">Start OnTask</Link>
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
          <Link href="/subscribe?product=ontask" className="inline-flex bg-black text-white hover:bg-gray-900 font-semibold py-3 px-6 rounded-full">Start OnTask</Link>
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
              <Link href="/subscribe?product=ontask" className="text-[#20b2aa] hover:underline">Start OnTask</Link>
            </div>
          </div>
          {/* Try */}
          <div id="try" className="rounded-xl border p-6 bg-white/90 backdrop-blur shadow-sm responsive-card">
            <h3 className="text-lg font-semibold text-gray-900">2) Try</h3>
            <p className="mt-2 text-gray-700">Start your subscription. Add a customer and one job. Send an estimate, convert it, and take a payment. Feel the difference in a day.</p>
            <ul className="mt-3 space-y-1 text-sm text-gray-700">
              <li>• Drag‑and‑drop a job onto the calendar</li>
              <li>• Send a branded estimate; convert to invoice in one click</li>
              <li>• Watch automations send a review request and gentle reminders</li>
            </ul>
            <div className="mt-4 flex gap-3">
              <Link href="/subscribe?product=ontask" className="bg-black text-white hover:bg-gray-900 font-semibold py-2 px-4 rounded-full">Start OnTask</Link>
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
              <Link href="/subscribe?product=ontask" className="text-[#20b2aa] hover:underline">Bring your team on OnTask</Link>
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
            <p className="mt-1 text-gray-700">Start your subscription, add a customer, and book your first job in minutes.</p>
          </div>
          <div className="rounded-xl border p-6 bg-white/90 shadow-sm responsive-card">
            <h3 className="text-lg font-semibold text-gray-900">Built for the field</h3>
            <p className="mt-1 text-gray-700">A modern, mobile‑friendly <strong>field service management app</strong> your techs will actually use.</p>
          </div>
          <div className="rounded-xl border p-6 bg-white/90 shadow-sm responsive-card">
            <h3 className="text-lg font-semibold text-gray-900">Clear value at $29/month</h3>
            <p className="mt-1 text-gray-700">No per‑technician fees. Annual saves ~2 months. Keep your data if you leave.</p>
          </div>
        </div>
        <div className="mt-8 text-center">
          <Link href="/subscribe?product=ontask" className="inline-flex bg-black text-white hover:bg-gray-900 font-semibold py-3 px-6 rounded-full">Start OnTask</Link>
          <Link href="/marketing" className="ml-4 underline text-gray-900">See how we help teams grow</Link>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" data-snap-section className="section-full snap-fade reveal-in text-center">
        <h2 className="text-3xl font-semibold text-gray-900">Simple, transparent pricing</h2>
        <p className="mt-2 text-gray-700">Starter <span className="font-semibold text-gray-900">$29/month</span> · Plus <span className="font-semibold text-gray-900">$299/month</span>. Annual saves ~2 months.</p>
        <div className="mt-6 mx-auto max-w-2xl rounded-2xl border bg-white/90 backdrop-blur p-8 shadow-sm responsive-card">
          <ul className="text-gray-700 space-y-2 text-left max-w-sm mx-auto">
            <li>• Scheduling & dispatch</li>
            <li>• Estimates & invoices</li>
            <li>• Stripe payments</li>
            <li>• Simple CRM</li>
            <li>• Automations & reminders</li>
            <li>• Reporting</li>
            <li>• Plus: integrations, higher volumes, priority chat</li>
          </ul>
          <div className="mt-5 flex items-center justify-center gap-3">
            <Link href="/subscribe?product=ontask" className="bg-black text-white hover:bg-gray-900 font-semibold py-3 px-6 rounded-full">Start OnTask</Link>
            <Link href="/consulting/book" className="underline text-gray-800">Talk about Plus or pilot</Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" data-snap-section className="section-full snap-fade reveal-in">
        <h2 className="text-3xl font-semibold text-gray-900 text-center">FAQs</h2>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 grid-gap-modern smart-flow">
          <div className="rounded-xl border p-6 bg-white/90 shadow-sm responsive-card">
            <h3 className="text-lg font-semibold text-gray-900">Is there a trial?</h3>
            <p className="mt-1 text-gray-700">Start on Starter. Upgrade to Plus when you need integrations. Keep your data if you cancel.</p>
          </div>
          <div className="rounded-xl border p-6 bg-white/90 shadow-sm responsive-card">
            <h3 className="text-lg font-semibold text-gray-900">Do you charge per technician?</h3>
            <p className="mt-1 text-gray-700">No. The Starter plan is $29/month for the whole crew. Plus adds integrations and higher volume.</p>
          </div>
          <div className="rounded-xl border p-6 bg-white/90 shadow-sm responsive-card">
            <h3 className="text-lg font-semibold text-gray-900">Is it good for HVAC, cleaning, and plumbing?</h3>
            <p className="mt-1 text-gray-700">Yes—OnTask is optimized for <strong>cleaning, HVAC, and plumbing scheduling</strong> plus invoicing and payments.</p>
          </div>
          <div className="rounded-xl border p-6 bg-white/90 shadow-sm responsive-card">
            <h3 className="text-lg font-semibold text-gray-900">Can I cancel anytime?</h3>
            <p className="mt-1 text-gray-700">Yes. Export your data and cancel anytime. Annual options are available if you prefer predictable billing.</p>
          </div>
        </div>
        <div className="mt-8 text-center">
          <Link href="/subscribe?product=ontask" className="inline-flex bg-black text-white hover:bg-gray-900 font-semibold py-3 px-6 rounded-full">Start OnTask</Link>
        </div>
      </section>

  <section data-snap-section className="section-full snap-fade text-center reveal-in fade-only">
        <Link href="/subscribe?product=ontask" className="inline-flex items-center bg-[#20b2aa] text-white hover:bg-[#1a8f85] font-semibold py-3 px-6 rounded-full">Start OnTask</Link>
    <p className="mt-2 text-sm text-gray-600">Made for crews of 1–10. Save hours each week and never forget a follow‑up. Starter $29/month; Plus $299/month for integrations. Annual saves ~2 months.</p>
      </section>

      </div>

      {/* sticky CTA for small screens */}
      <div className="fixed inset-x-0 bottom-3 mx-auto w-full max-w-md px-4 sm:hidden z-40">
        <Link href="/subscribe?product=ontask" className="block text-center bg-black text-white hover:bg-gray-900 font-semibold py-3 px-6 rounded-full shadow-lg">Start OnTask</Link>
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
            offers: { '@type': 'Offer', price: '29', priceCurrency: 'USD' },
            provider: { '@type': 'Organization', name: 'OfRoot' },
            description:
              'OnTask helps HVAC, plumbing, and other local pros schedule jobs, send estimates & invoices, take payments (Stripe), and automate reviews & reminders — simple to set up, mobile‑friendly, and affordable (Starter $29/month; Plus for integrations).',
          }),
        }}
      />
    </div>
  );
}
