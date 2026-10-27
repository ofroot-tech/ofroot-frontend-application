import type { Metadata } from 'next';
import type { CSSProperties } from 'react';
import Link from 'next/link';
import { ArrowRight, Bot, Code2, Network, SearchCheck } from 'lucide-react';
import { TrackedLink } from '@/components/growth/Analytics';
import HomeHero from '@/components/growth/HomeHero';
import { SITE_URL } from '@/app/lib/growth-content';
import { caseStudies } from '@/app/lib/proof-content';
import { serviceOffers } from '@/app/lib/service-offers';

const description = 'OfRoot builds marketing websites, SEO and AI discoverability, integrations, internal tools, and AI systems with practical deployment support.';
export const metadata: Metadata = {
  title: 'Websites, Integrations & AI Systems',
  description,
  alternates: { canonical: '/' },
  openGraph: { title: 'OfRoot — Websites, Integrations & AI Systems', description, url: SITE_URL, type: 'website', images: [{ url: `${SITE_URL}/og.jpg`, width: 1200, height: 630, alt: 'OfRoot — technology for your business' }] },
  twitter: { card: 'summary_large_image', title: 'OfRoot — Websites, Integrations & AI Systems', description, images: [`${SITE_URL}/og.jpg`] },
};

const motionDelay = (index: number) => ({ '--motion-delay': `${index * 70}ms` } as CSSProperties);
const icons = [SearchCheck, Network, Bot];
const primaryCtaClass = 'inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#FF9312] px-6 py-3 text-base font-semibold text-slate-950 transition hover:bg-[#ffad42] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fff0d7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#071225]';

export default function HomePage() {
  const schema = { '@context': 'https://schema.org', '@type': 'ProfessionalService', name: 'OfRoot', url: SITE_URL, description, serviceType: serviceOffers.map(offer => offer.title), areaServed: 'US' };
  return (
    <main id="main-content" className="bg-[#f7f6f2] text-slate-950">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <HomeHero />

      <section id="systems" className="px-6 py-20 sm:px-8 sm:py-24" aria-labelledby="offers-heading">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 grid gap-5 lg:grid-cols-[.75fr_1.25fr]">
            <p className="motion-reveal text-sm font-bold uppercase tracking-[.16em] text-[#B55B00]">Attract · Connect · Enable</p>
            <div className="motion-reveal" style={motionDelay(1)}>
              <h2 id="offers-heading" className="text-balance text-3xl font-black sm:text-5xl">Three ways to move your business forward.</h2>
              <p className="mx-0 mt-4 max-w-2xl text-lg text-slate-600">Start with the website, workflow, or product that needs attention. Bring in the engineering to make it work.</p>
            </div>
          </div>
          <div className="grid gap-5 lg:grid-cols-3">
            {serviceOffers.map((offer, i) => {
              const Icon = icons[i];
              return (
                <article key={offer.id} className="motion-reveal flex flex-col rounded-3xl border border-slate-200 bg-white p-7 shadow-[0_16px_50px_rgba(15,23,42,.06)]" style={motionDelay(i)}>
                  <div className="mb-8 flex items-center justify-between"><span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FFF1DF] text-[#A94F00]"><Icon className="h-6 w-6" aria-hidden="true" /></span><span className="text-xs font-bold uppercase tracking-[.15em] text-slate-400">0{i + 1} · {offer.step}</span></div>
                  <h3 className="text-2xl font-black">{offer.title}</h3>
                  <p className="mx-0 mt-4 flex-1 text-sm leading-6 text-slate-600">{offer.description}</p>
                  <ul className="mt-6 space-y-3 border-t border-slate-100 pt-6">{offer.includes.map(item => <li key={item} className="flex gap-2 text-sm leading-6 text-slate-700"><span className="text-[#B55B00]" aria-hidden="true">↗</span>{item}</li>)}</ul>
                  <Link href={offer.href} className="mt-7 inline-flex min-h-11 items-center gap-2 font-semibold text-[#8F4700] hover:underline">Explore {offer.shortTitle}<ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" /></Link>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white px-6 py-20 sm:px-8" aria-labelledby="examples-heading">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 grid gap-6 lg:grid-cols-[.75fr_1.25fr]">
            <div className="motion-reveal"><p className="mb-3 text-sm font-bold uppercase tracking-[.16em] text-[#B55B00]">What we can build</p><h2 id="examples-heading" className="text-3xl font-black sm:text-4xl">Real business problems. Practical engineering.</h2></div>
            <div className="motion-reveal" style={motionDelay(1)}><p className="mx-0 max-w-2xl text-lg text-slate-600">Reporting that can be traced to its sources. Workflows with a clear next step. Tools that connect to the way your team works.</p><Link href="/results" className="mt-5 inline-flex min-h-11 items-center gap-2 font-semibold text-[#8F4700] hover:underline">Explore all capability examples<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></div>
          </div>
          <div className="grid gap-5 lg:grid-cols-3">
            {caseStudies.slice(0, 3).map((example, i) => <Link key={example.slug} href={`/case-studies/${example.slug}`} className="motion-card motion-reveal group flex flex-col rounded-3xl border border-slate-200 bg-[#f7f6f2] p-7" style={motionDelay(i)}><p className="mx-0 text-xs font-bold uppercase tracking-[.15em] text-[#B55B00]">{example.category}</p><h3 className="mt-7 text-2xl font-black">{example.title}</h3><p className="mx-0 mt-4 flex-1 text-sm leading-6 text-slate-600">{example.summary}</p><span className="mt-6 text-xs text-slate-500">Capability example</span><span className="mt-4 inline-flex min-h-11 items-center gap-2 font-semibold text-[#8F4700]">Explore the approach<ArrowRight className="motion-card-arrow h-4 w-4" aria-hidden="true" /></span></Link>)}
          </div>
        </div>
      </section>

      <section className="px-6 py-20 sm:px-8" aria-labelledby="founder-heading">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[.75fr_1.25fr]">
          <div className="motion-reveal"><p className="mb-3 text-sm font-bold uppercase tracking-[.16em] text-[#B55B00]">Founder-led engineering</p><h2 id="founder-heading" className="text-balance text-3xl font-black sm:text-4xl">11 years in technology. A hands-on partner for the next step.</h2></div>
          <div className="motion-reveal rounded-3xl border border-slate-200 bg-white p-7 sm:p-9" style={motionDelay(1)}>
            <Code2 className="h-7 w-7 text-[#A94F00]" aria-hidden="true" />
            <p className="mx-0 mt-5 text-lg leading-8 text-slate-700">OfRoot is led by Dimitri, a full-stack developer and solutions architect. That experience informs how we plan, build, test, and support the systems your business depends on.</p>
            <p className="mx-0 mt-4 text-sm leading-6 text-slate-600">Work can span Laravel and PHP, React and Next.js, Python, Node.js, PostgreSQL, APIs, background jobs, and cloud delivery on AWS or Vercel. The stack follows the problem.</p>
            <div className="mt-6 border-t border-slate-200 pt-6"><p className="mx-0 text-sm font-semibold text-slate-800">Define the scope. Build in reviewable steps. Validate before release.</p><p className="mx-0 mt-2 text-sm text-slate-600">Agree on acceptance checks, deployment, ownership, and handoff before the work begins.</p></div>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-[#efece5] px-6 py-16 sm:px-8" aria-labelledby="audience-heading">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[.75fr_1.25fr]">
          <div><p className="mb-3 text-sm font-bold uppercase tracking-[.16em] text-[#B55B00]">Built around your business</p><h2 id="audience-heading" className="text-3xl font-black">From local services to growing operations.</h2></div>
          <div><p className="mx-0 text-lg text-slate-600">We work with service businesses, founders, and teams that need a stronger digital presence or better software behind the scenes. Home-services businesses remain a focused part of that work.</p><div className="mt-6 flex flex-wrap gap-x-7 gap-y-3"><TrackedLink href="/solutions/home-services-automation" source="homepage:home-services" className="inline-flex min-h-11 items-center gap-2 font-semibold text-[#8F4700]">Explore a home-services workflow<ArrowRight className="h-4 w-4" aria-hidden="true" /></TrackedLink><Link href="/pricing" className="inline-flex min-h-11 items-center gap-2 font-semibold text-[#8F4700]">Review engagement options<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></div></div>
        </div>
      </section>

      <section className="bg-[#071225] px-6 py-20 text-white sm:px-8"><div className="motion-reveal mx-auto flex max-w-6xl flex-col gap-8 lg:flex-row lg:items-end lg:justify-between"><div><p className="mb-3 text-sm font-bold uppercase tracking-[.16em] text-[#FFC46B]">Start with what matters</p><h2 className="max-w-3xl text-balance text-4xl font-black text-white sm:text-5xl">What should work better in your business?</h2><p className="mx-0 mt-5 max-w-2xl text-slate-300">Share the goal and the bottleneck. We will review the fit and recommend a practical next step.</p></div><TrackedLink href="/book?source=homepage-final" source="homepage:final" className={`${primaryCtaClass} shrink-0`}>Discuss your project<ArrowRight className="h-4 w-4" aria-hidden="true" /></TrackedLink></div></section>
    </main>
  );
}
