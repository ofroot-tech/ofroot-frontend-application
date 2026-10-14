import Link from 'next/link';
import { ArrowRight, CheckCircle2, SearchCheck, Network, Bot } from 'lucide-react';
import JsonLd from '@/components/seo/JsonLd';
import { SITE } from '@/app/config/site';
import { growthMetadata } from '@/app/lib/growth-content';
import { serviceOffers } from '@/app/lib/service-offers';

export const metadata = growthMetadata('Websites, Integrations & AI Services', 'Marketing websites, SEO, AEO, GEO and ads; integrations and internal tools; AI systems and deployment. Explore three ways to work with OfRoot.', '/services');
const icons = [SearchCheck, Network, Bot];

export default function ServicesIndexPage() {
  return (
    <main id="main-content" className="pb-8">
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'OfRoot Services', url: `${SITE.url}/services`, mainEntity: { '@type': 'ItemList', itemListElement: serviceOffers.map((offer, index) => ({ '@type': 'ListItem', position: index + 1, item: { '@type': 'Service', name: offer.title, description: offer.description, url: `${SITE.url}${offer.href}`, provider: { '@type': 'Organization', name: SITE.name, url: SITE.url } } })) } }} />
      <header className="rounded-3xl bg-[#071225] px-6 py-14 text-white sm:px-10 sm:py-20">
        <p className="text-sm font-bold uppercase tracking-[.18em] text-[#FFC46B]">Attract · Connect · Enable</p>
        <h1 className="mt-4 max-w-4xl text-balance text-4xl font-black text-white sm:text-6xl">The website. The workflow. The system behind it.</h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">Three clear offers, with the design and engineering to connect them. Start with a specific goal and build a scope around what your business needs.</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row"><Link href="/book?source=services-hero" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#FF9312] px-6 py-3 font-semibold text-slate-950">Discuss your project<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link><Link href="/pricing" className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/25 px-6 py-3 font-semibold text-white">Review engagement options</Link></div>
      </header>

      <section className="py-16" aria-labelledby="service-lines">
        <div className="grid gap-6 lg:grid-cols-[.72fr_1.28fr]"><div><p className="text-sm font-bold uppercase tracking-[.16em] text-[#B55B00]">How we can help</p><h2 id="service-lines" className="mt-3 text-3xl font-black sm:text-4xl">Choose a useful starting point.</h2></div><p className="text-lg text-slate-600">We define the scope, dependencies, ownership, and acceptance checks before implementation. Timelines and costs depend on the actual work.</p></div>
        <div className="mt-10 grid gap-5">
          {serviceOffers.map((offer, index) => {
            const Icon = icons[index];
            return <article key={offer.id} className="grid gap-7 rounded-3xl border border-slate-200 bg-white p-7 shadow-[0_16px_50px_rgba(15,23,42,.05)] lg:grid-cols-[.7fr_1.3fr] lg:p-9"><div><div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FFF1DF] text-[#A94F00]"><Icon className="h-5 w-5" aria-hidden="true" /></span><span className="text-xs font-bold uppercase tracking-[.16em] text-slate-500">0{index + 1} · {offer.step}</span></div><h3 className="mt-6 text-3xl font-black">{offer.title}</h3><Link href={offer.href} className="mt-6 inline-flex min-h-11 items-center gap-2 font-bold text-[#8F4700]">Explore the service<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></div><div className="grid gap-6 sm:grid-cols-2"><div><h4 className="text-sm font-bold uppercase tracking-[.12em] text-slate-500">When it helps</h4><p className="mt-3 text-sm leading-6 text-slate-700">{offer.problem}</p><h4 className="mt-6 text-sm font-bold uppercase tracking-[.12em] text-slate-500">What we work toward</h4><p className="mt-3 text-sm leading-6 text-slate-700">{offer.outcome}</p></div><div><h4 className="text-sm font-bold uppercase tracking-[.12em] text-slate-500">Typical scope</h4><ul className="mt-3 space-y-3">{offer.includes.map(item => <li key={item} className="flex gap-3 text-sm leading-6 text-slate-700"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#0C7162]" aria-hidden="true" />{item}</li>)}</ul></div></div></article>;
          })}
        </div>
      </section>

      <section className="rounded-3xl bg-[#efece5] px-6 py-12 sm:px-10"><div className="grid gap-6 lg:grid-cols-[.72fr_1.28fr]"><div><p className="text-sm font-bold uppercase tracking-[.16em] text-[#B55B00]">Relevant capabilities</p><h2 className="mt-3 text-3xl font-black">See how the pieces fit.</h2></div><div><p className="text-lg text-slate-600">Explore approaches to reporting and reconciliation, operational applications, API automation, AI-assisted tools, and marketing websites. Each example explains potential scope and what needs validation.</p><Link href="/results" className="mt-6 inline-flex min-h-11 items-center gap-2 font-semibold text-[#8F4700]">Explore capability examples<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></div></div></section>
      <section className="py-14"><h2 className="text-2xl font-black">Working in home services?</h2><p className="mt-3 max-w-3xl text-slate-600">We can review the path from website inquiry to scheduling and follow-up, while keeping the software you already rely on in view.</p><Link href="/book?focus=home-services-automation&source=services" className="mt-5 inline-flex min-h-11 items-center gap-2 font-semibold text-[#8F4700]">Discuss a home-services workflow<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></section>
    </main>
  );
}
