import Link from 'next/link';
import { ArrowRight, CheckCircle2, ClipboardCheck, Link2, ShieldCheck } from 'lucide-react';
import { growthMetadata, SITE_URL } from '@/app/lib/growth-content';
import { TrackedLink, PageView } from '@/components/growth/Analytics';

const path = '/clinic-success';
const primary = 'inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#FF9312] px-6 py-3 font-semibold text-slate-950 transition hover:bg-[#ffad42] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FF9312]';
const secondary = 'inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/25 px-6 py-3 font-semibold text-white transition hover:border-white/50 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white';

export const metadata = growthMetadata(
  'Clinic Success Platform | Appointment Preparation Pilot',
  'A clinic-facing appointment preparation pilot with referral links and aggregate operational visibility—without automatic access to Health patient data.',
  path,
);

const benefits = [
  ['A clearer handoff', 'Give prospective patients a purpose-built referral path and give the clinic a shared way to review how that path is being used.'],
  ['Operational visibility', 'Use aggregate counts and trend signals to understand referral activity and follow-up operations without creating a patient-record dashboard in Technology.'],
  ['A measured pilot', 'Start with defined clinic questions, documented ownership, and a review cadence instead of a broad system rollout.'],
];

const servicePhases = [
  ['01', 'Align the pilot', 'Confirm the referral goal, clinic owner, launch scope, aggregate measures, and the boundaries that remain outside Technology.'],
  ['02', 'Set up the path', 'Configure referral links and the operational handoff, then verify the information available to the Technology reporting layer.'],
  ['03', 'Review the signal', 'Use aggregate activity to guide clinic operations conversations, surface questions, and decide whether the pilot should continue or change.'],
  ['04', 'Support the next cycle', 'Provide ongoing service for the agreed referral and operations work; any Health-data discussion begins separately, with separate approval.'],
];

export default function ClinicSuccessPage() {
  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Clinic Success Platform Appointment Preparation Pilot',
    serviceType: 'Clinic growth and aggregate operations pilot',
    provider: { '@type': 'Organization', name: 'OfRoot Technology', url: SITE_URL },
    url: `${SITE_URL}${path}`,
    description: 'A clinic-facing pilot for referral links and aggregate operations visibility. Technology does not receive Health patient data automatically.',
    areaServed: 'US',
  };
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Clinic Success Platform', item: `${SITE_URL}${path}` },
    ],
  };

  return (
    <main id="main-content" className="growth-page-full-bleed relative left-1/2 w-screen -translate-x-1/2 bg-[#f7f6f2] text-slate-950">
      <PageView kind="service" name="clinic_success_pilot" />
      {[serviceSchema, breadcrumbSchema].map((schema, index) => (
        <script key={index} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}

      <section className="relative overflow-hidden bg-[#071225] px-6 py-20 text-white sm:px-8 sm:py-28">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true" style={{ background: 'radial-gradient(circle at 84% 16%, rgba(55,255,224,.16), transparent 27%), radial-gradient(circle at 12% 84%, rgba(255,147,18,.17), transparent 30%)' }} />
        <div className="relative mx-auto max-w-6xl">
          <nav aria-label="Breadcrumb" className="mb-10 flex flex-wrap items-center gap-2 text-sm text-slate-300"><Link href="/" className="hover:text-white">Home</Link><span aria-hidden="true">/</span><span className="text-white">Clinic Success Platform</span></nav>
          <div className="grid gap-12 lg:grid-cols-[1.2fr_.8fr] lg:items-end">
            <div>
              <p className="mb-5 text-sm font-bold uppercase tracking-[.18em] text-[#FFC46B]">Appointment Preparation Pilot</p>
              <h1 className="max-w-5xl text-balance text-4xl font-black leading-[1.02] text-white sm:text-6xl">Make the path to a prepared appointment easier to operate.</h1>
              <p className="mx-0 mt-6 max-w-3xl text-lg text-slate-200 sm:text-xl">The Clinic Success Platform pilot gives clinics a focused referral path and aggregate operational visibility, so the team can improve the work around appointment preparation with clear ownership.</p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <TrackedLink href="/book?focus=clinic-success-pilot&source=clinic-success-hero" source="clinic-success:hero" className={primary}>Discuss the pilot<ArrowRight className="h-4 w-4" /></TrackedLink>
                <Link href="#boundaries" className={secondary}>Review the data boundary</Link>
              </div>
              <p className="mx-0 mt-8 max-w-3xl border-l-2 border-[#37FFE0] pl-4 text-sm leading-relaxed text-slate-300">This is a Technology service for clinic growth, referral links, and aggregate operations. It does not provide automatic access to Health patient data.</p>
            </div>
            <aside className="rounded-3xl border border-white/15 bg-white/[.06] p-6 shadow-[0_18px_60px_rgba(0,0,0,.18)] backdrop-blur-sm">
              <p className="text-sm font-bold uppercase tracking-[.15em] text-[#FFC46B]">Pilot focus</p>
              <ul className="mt-5 space-y-4 text-sm leading-relaxed text-slate-200">
                <li className="flex gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#37FFE0]" aria-hidden="true" />Referral links with a defined clinic handoff</li>
                <li className="flex gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#37FFE0]" aria-hidden="true" />Aggregate-only reporting for operational review</li>
                <li className="flex gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#37FFE0]" aria-hidden="true" />A phased implementation and ongoing service model</li>
              </ul>
            </aside>
          </div>
        </div>
      </section>

      <section className="px-6 py-16 sm:px-8" aria-labelledby="pilot-purpose">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[.7fr_1.3fr] lg:items-start">
          <p className="text-sm font-bold uppercase tracking-[.16em] text-[#B55B00]">The plain-language answer</p>
          <div><h2 id="pilot-purpose" className="text-balance text-3xl font-black leading-tight text-slate-900 sm:text-4xl">A small, visible system for the work before the appointment.</h2><p className="mx-0 mt-5 max-w-3xl text-lg leading-relaxed text-slate-600">The pilot is designed for clinics that want a clearer referral experience and an operations conversation grounded in agreed aggregate signals. It is not a replacement for clinical judgment, care delivery, or a Health patient-record system.</p></div>
        </div>
        <div className="mx-auto mt-12 grid max-w-6xl gap-4 md:grid-cols-3">
          {benefits.map(([title, body]) => <article key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,.05)]"><CheckCircle2 className="mb-5 h-5 w-5 text-[#C96800]" aria-hidden="true" /><h3 className="text-xl font-bold text-slate-950">{title}</h3><p className="mx-0 mt-3 text-sm leading-relaxed text-slate-600">{body}</p></article>)}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white px-6 py-20 sm:px-8" aria-labelledby="referral-flow">
        <div className="mx-auto max-w-6xl"><div className="grid gap-6 lg:grid-cols-[.75fr_1.25fr]"><div><p className="text-sm font-bold uppercase tracking-[.16em] text-[#B55B00]">Referral flow</p><h2 id="referral-flow" className="mt-3 text-balance text-3xl font-black sm:text-4xl">Every handoff has a clear home.</h2></div><p className="mx-0 max-w-2xl text-lg leading-relaxed text-slate-600">The pilot keeps clinic-growth activity legible. Technology manages the referral-link layer and aggregate operations view. Health remains the system for patient information and care.</p></div>
          <ol className="mt-10 grid gap-3 md:grid-cols-2 xl:grid-cols-4" aria-label="Pilot referral flow">
            {[[Link2, 'Referral link', 'Technology creates a clinic-approved referral path.'], [ClipboardCheck, 'Clinic handoff', 'The clinic defines how the referral is handled in its own workflow.'], [ShieldCheck, 'Aggregate operations', 'Technology reports agreed aggregate activity, not patient records.'], [ArrowRight, 'Clinic review', 'The team reviews the signal and agrees the next operational step.']].map(([Icon, title, body], index) => { const StepIcon = Icon as typeof Link2; return <li key={title as string} className="rounded-2xl border border-slate-200 bg-[#f7f6f2] p-5"><span className="text-xs font-bold text-[#B55B00]">{String(index + 1).padStart(2, '0')}</span><StepIcon className="mt-6 h-6 w-6 text-[#C96800]" aria-hidden="true" /><h3 className="mt-5 text-xl font-bold text-slate-950">{title as string}</h3><p className="mx-0 mt-3 text-sm leading-relaxed text-slate-600">{body as string}</p></li>; })}
          </ol>
        </div>
      </section>

      <section id="boundaries" className="px-6 py-20 sm:px-8" aria-labelledby="data-boundaries">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[.8fr_1.2fr]"><div><p className="text-sm font-bold uppercase tracking-[.16em] text-[#B55B00]">Data boundary</p><h2 id="data-boundaries" className="mt-3 text-balance text-3xl font-black sm:text-4xl">Operations visibility without automatic patient-data access.</h2></div><div className="rounded-3xl border border-[#20B2AA]/25 bg-[#eaf9f7] p-7 sm:p-8"><div className="grid gap-6 sm:grid-cols-2"><div><p className="text-sm font-bold uppercase tracking-[.14em] text-[#176f6b]">Technology owns</p><ul className="mt-4 space-y-3 text-sm leading-relaxed text-slate-700"><li>Clinic-growth work and referral links</li><li>Aggregate operations views and reporting</li><li>The agreed implementation and service cadence</li></ul></div><div><p className="text-sm font-bold uppercase tracking-[.14em] text-[#176f6b]">Health owns</p><ul className="mt-4 space-y-3 text-sm leading-relaxed text-slate-700"><li>Patient data and patient records</li><li>Clinical workflows and care decisions</li><li>Approval for any proposed Health-data access</li></ul></div></div><p className="mx-0 mt-7 border-t border-[#20B2AA]/20 pt-6 text-sm font-semibold leading-relaxed text-slate-800">Technology does not receive Health patient data through this pilot by default. If a future workflow needs Health-data access, it begins as a separate, documented approval and architecture conversation.</p></div></div>
      </section>

      <section className="border-y border-slate-200 bg-white px-6 py-20 sm:px-8" aria-labelledby="service-model">
        <div className="mx-auto max-w-6xl"><div className="grid gap-6 lg:grid-cols-[.75fr_1.25fr]"><div><p className="text-sm font-bold uppercase tracking-[.16em] text-[#B55B00]">Implementation and service</p><h2 id="service-model" className="mt-3 text-balance text-3xl font-black sm:text-4xl">Start small. Review what is visible. Continue deliberately.</h2></div><p className="mx-0 max-w-2xl text-lg leading-relaxed text-slate-600">The service model is deliberately phased so the clinic can evaluate the operational fit of the pilot before discussing broader work.</p></div><div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">{servicePhases.map(([number, title, body]) => <article key={number} className="rounded-2xl border border-slate-200 bg-[#f7f6f2] p-6"><p className="text-sm font-bold text-[#B55B00]">{number}</p><h3 className="mt-6 text-xl font-bold text-slate-950">{title}</h3><p className="mx-0 mt-3 text-sm leading-relaxed text-slate-600">{body}</p></article>)}</div></div>
      </section>

      <section className="bg-[#071225] px-6 py-16 text-white sm:px-8"><div className="mx-auto flex max-w-6xl flex-col gap-8 lg:flex-row lg:items-end lg:justify-between"><div><p className="mb-3 text-sm font-bold uppercase tracking-[.16em] text-[#FFC46B]">Clinic conversation</p><h2 className="max-w-3xl text-balance text-3xl font-black sm:text-4xl">See whether the pilot fits your clinic&apos;s referral and appointment-preparation workflow.</h2><p className="mx-0 mt-4 max-w-2xl text-slate-300">We will start with the clinic&apos;s operating question, existing referral path, and the boundary the pilot must respect.</p></div><TrackedLink href="/book?focus=clinic-success-pilot&source=clinic-success-final" source="clinic-success:final" className={primary}>Discuss the pilot<ArrowRight className="h-4 w-4" /></TrackedLink></div><div className="mx-auto mt-10 flex max-w-6xl flex-wrap gap-x-6 gap-y-2 border-t border-white/10 pt-6 text-sm text-slate-300"><Link href="/security" className="hover:text-white">Review our security approach <span aria-hidden="true">→</span></Link><Link href="/legal/privacy" className="hover:text-white">Read the privacy policy <span aria-hidden="true">→</span></Link><Link href="/book?focus=clinic-success-pilot&source=clinic-success-links" className="hover:text-white">Book a conversation <span aria-hidden="true">→</span></Link></div></section>
    </main>
  );
}
