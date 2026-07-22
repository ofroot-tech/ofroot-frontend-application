import Link from 'next/link';
import { ArrowRight, BarChart3, CheckCircle2, FileCheck2, Route, ShieldCheck } from 'lucide-react';
import type { FeatureContent } from '@/app/lib/feature-content';
import { featurePath, getFeaturesForService } from '@/app/lib/feature-content';
import { SITE_URL } from '@/app/lib/growth-content';
import { PageView, TrackedLink } from './Analytics';

const primary = 'inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#FF9312] px-6 py-3 font-semibold text-[#171717] transition hover:bg-[#ffad42] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FF9312]';

export default function FeaturePage({ content }: { content: FeatureContent }) {
  const path = featurePath(content);
  const siblings = getFeaturesForService(content.service).filter(feature => feature.slug !== content.slug);
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Services', item: `${SITE_URL}/services` },
      { '@type': 'ListItem', position: 3, name: content.serviceName, item: `${SITE_URL}/services/${content.service}` },
      { '@type': 'ListItem', position: 4, name: content.eyebrow, item: `${SITE_URL}${path}` },
    ],
  };
  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: content.eyebrow,
    serviceType: content.eyebrow,
    provider: { '@type': 'Organization', name: 'OfRoot Technology', url: SITE_URL },
    url: `${SITE_URL}${path}`,
    description: content.description,
    areaServed: 'US',
    isRelatedTo: { '@type': 'Service', name: content.serviceName, url: `${SITE_URL}/services/${content.service}` },
  };
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: content.faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };

  return (
    <main id="main-content" className="growth-page-full-bleed relative left-1/2 w-screen -translate-x-1/2 bg-[#f7f6f2] text-slate-950">
      <PageView kind="feature" name={`${content.service}:${content.slug}`} />
      {[breadcrumbSchema, serviceSchema, faqSchema].map((schema, index) => (
        <script key={index} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}

      <section className="relative overflow-hidden bg-[#071225] px-6 py-20 text-white sm:px-8 sm:py-28">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true" style={{ background: 'radial-gradient(circle at 80% 16%, rgba(55,255,224,.15), transparent 28%), radial-gradient(circle at 12% 78%, rgba(255,147,18,.18), transparent 28%)' }} />
        <div className="relative mx-auto max-w-6xl">
          <nav aria-label="Breadcrumb" className="mb-10 flex flex-wrap items-center gap-2 text-sm text-slate-300">
            <Link href="/" className="hover:text-white">Home</Link><span aria-hidden="true">/</span>
            <Link href={`/services/${content.service}`} className="hover:text-white">{content.serviceName}</Link><span aria-hidden="true">/</span>
            <span className="text-white">{content.eyebrow}</span>
          </nav>
          <p className="mb-5 text-sm font-bold uppercase tracking-[0.18em] text-[#FFC46B]">{content.serviceName} / {content.eyebrow}</p>
          <h1 className="max-w-5xl text-balance text-4xl font-black leading-[1.02] text-white sm:text-6xl">{content.title}</h1>
          <p className="mx-0 mt-6 max-w-3xl text-lg text-slate-200 sm:text-xl">{content.description}</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <TrackedLink href={`/book?focus=${content.slug}&source=feature-page`} source={`${content.slug}:hero`} className={primary}>Discuss this system<ArrowRight className="h-4 w-4" /></TrackedLink>
            <Link href={`/services/${content.service}`} className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/25 px-6 py-3 font-semibold text-white hover:border-white/50 hover:bg-white/10">Explore {content.serviceName}</Link>
          </div>
          <div className="mt-9 flex flex-wrap gap-x-6 gap-y-2 border-t border-white/10 pt-6 text-sm text-slate-300">
            <span>Written by OfRoot Technology</span><span>Updated July 22, 2026</span><span>Reviewed for evidence boundaries</span>
          </div>
        </div>
      </section>

      <section className="px-6 py-16 sm:px-8" aria-labelledby="direct-answer">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[.62fr_1.38fr]">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#B55B00]">Direct answer</p>
            <h2 id="direct-answer" className="mt-3 text-2xl font-black text-slate-950">What is {content.eyebrow.toLowerCase()}?</h2>
          </div>
          <div>
            <p className="mx-0 text-balance text-xl font-semibold leading-relaxed text-slate-800 sm:text-2xl">{content.directAnswer}</p>
            <div className="mt-7 rounded-2xl border border-[#FF9312]/30 bg-white p-5">
              <p className="mx-0 text-sm font-bold uppercase tracking-[.14em] text-[#B55B00]">The buyer question</p>
              <p className="mx-0 mt-2 text-lg font-semibold text-slate-900">{content.buyerQuestion}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white px-6 py-20 sm:px-8" aria-labelledby="outcomes">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-6 lg:grid-cols-[.75fr_1.25fr]">
            <div><p className="text-sm font-bold uppercase tracking-[.16em] text-[#B55B00]">Business value</p><h2 id="outcomes" className="mt-3 text-3xl font-black sm:text-4xl">What changes when the system works</h2></div>
            <p className="mx-0 text-lg text-slate-600">The work is judged by observable business and operational outcomes, not by the number of tools configured.</p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {content.outcomes.map(item => <article key={item.title} className="rounded-2xl border border-slate-200 bg-[#f7f6f2] p-6"><CheckCircle2 className="mb-5 h-6 w-6 text-[#C96800]" aria-hidden="true" /><h3 className="text-xl font-bold">{item.title}</h3><p className="mx-0 mt-3 text-sm leading-relaxed text-slate-600">{item.body}</p></article>)}
          </div>
        </div>
      </section>

      <section className="px-6 py-20 sm:px-8" aria-labelledby="included">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-6 lg:grid-cols-[.75fr_1.25fr]">
            <div><p className="text-sm font-bold uppercase tracking-[.16em] text-[#B55B00]">Scope</p><h2 id="included" className="mt-3 text-3xl font-black sm:text-4xl">What the implementation covers</h2></div>
            <p className="mx-0 text-lg text-slate-600">The final scope follows the observed system, current constraints, and the smallest release that can prove value safely.</p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {content.included.map((item, index) => <article key={item.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_12px_35px_rgba(15,23,42,.04)]"><span className="mb-5 inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#071225] text-sm font-bold text-[#FFC46B]">{index + 1}</span><h3 className="text-xl font-bold">{item.title}</h3><p className="mx-0 mt-3 text-slate-600">{item.body}</p></article>)}
          </div>
        </div>
      </section>

      <section className="bg-[#0b172b] px-6 py-20 text-white sm:px-8" aria-labelledby="process">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-bold uppercase tracking-[.16em] text-[#FFC46B]">Implementation path</p>
          <h2 id="process" className="mt-3 max-w-3xl text-3xl font-black text-white sm:text-4xl">Understand first. Change narrowly. Verify reality.</h2>
          <ol className="mt-10 grid gap-4 lg:grid-cols-4">
            {content.process.map((item, index) => <li key={item.title} className="rounded-2xl border border-white/10 bg-white/[.04] p-6"><span className="text-sm font-bold text-[#37FFE0]">0{index + 1}</span><h3 className="mt-4 text-xl font-bold text-white">{item.title}</h3><p className="mx-0 mt-3 text-sm text-slate-300">{item.body}</p></li>)}
          </ol>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white px-6 py-20 sm:px-8" aria-labelledby="measurement">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-6 lg:grid-cols-[.75fr_1.25fr]">
            <div><BarChart3 className="mb-5 h-7 w-7 text-[#C96800]" aria-hidden="true" /><h2 id="measurement" className="text-3xl font-black sm:text-4xl">What we measure</h2></div>
            <p className="mx-0 text-lg text-slate-600">Definitions stay fixed long enough to compare the same system before and after a change.</p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">{content.measures.map(item => <article key={item.title} className="rounded-2xl border border-slate-200 p-6"><h3 className="text-lg font-bold">{item.title}</h3><p className="mx-0 mt-3 text-sm text-slate-600">{item.body}</p></article>)}</div>
        </div>
      </section>

      <section className="px-6 py-20 sm:px-8" aria-labelledby="example">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[.7fr_1.3fr]">
          <div><Route className="mb-5 h-7 w-7 text-[#C96800]" aria-hidden="true" /><p className="text-sm font-bold uppercase tracking-[.16em] text-[#B55B00]">Worked example</p><h2 id="example" className="mt-3 text-3xl font-black sm:text-4xl">{content.example.title}</h2><p className="mx-0 mt-5 text-slate-600">{content.example.body}</p></div>
          <ol className="space-y-3">{content.example.steps.map((step, index) => <li key={step} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FF9312] text-sm font-black text-slate-950">{index + 1}</span><span className="font-semibold text-slate-800">{step}</span></li>)}</ol>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white px-6 py-20 sm:px-8" aria-labelledby="evidence">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-3">
          <div><FileCheck2 className="mb-5 h-7 w-7 text-[#C96800]" aria-hidden="true" /><h2 id="evidence" className="text-2xl font-black">Evidence used</h2><p className="mx-0 mt-3 text-sm text-slate-600">Direct system behavior, source records, analytics, tests, and approved business definitions take priority over assumptions.</p></div>
          <div><ShieldCheck className="mb-5 h-7 w-7 text-[#C96800]" aria-hidden="true" /><h3 className="text-xl font-bold">Claim boundary</h3><p className="mx-0 mt-3 text-sm text-slate-600">Capabilities are not presented as customer outcomes. Results require a defined baseline, implementation record, and verified measurement.</p></div>
          <div><CheckCircle2 className="mb-5 h-7 w-7 text-[#C96800]" aria-hidden="true" /><h3 className="text-xl font-bold">Completion proof</h3><p className="mx-0 mt-3 text-sm text-slate-600">A release is complete only after its intended output is observed in the target environment and a rollback or correction path is understood.</p></div>
        </div>
      </section>

      <section className="px-6 py-20 sm:px-8" aria-labelledby="faq">
        <div className="mx-auto max-w-4xl">
          <p className="text-center text-sm font-bold uppercase tracking-[.16em] text-[#B55B00]">Direct answers</p>
          <h2 id="faq" className="mt-3 text-center text-3xl font-black sm:text-4xl">Frequently asked questions</h2>
          <div className="mt-10 space-y-3">{content.faqs.map(faq => <details key={faq.question} className="group rounded-2xl border border-slate-200 bg-white p-6"><summary className="cursor-pointer list-none pr-8 text-lg font-bold text-slate-950">{faq.question}</summary><p className="mx-0 mt-4 text-slate-600">{faq.answer}</p></details>)}</div>
        </div>
      </section>

      <section className="bg-[#071225] px-6 py-16 text-white sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div><p className="text-sm font-bold uppercase tracking-[.16em] text-[#FFC46B]">Next step</p><h2 className="mt-3 max-w-3xl text-3xl font-black text-white sm:text-4xl">Find out whether {content.eyebrow.toLowerCase()} is the highest-impact place to start.</h2></div>
            <TrackedLink href={`/book?focus=${content.slug}&source=feature-final`} source={`${content.slug}:final`} className={primary}>Book a Growth Systems Audit<ArrowRight className="h-4 w-4" /></TrackedLink>
          </div>
          <div className="mt-10 border-t border-white/10 pt-8">
            <p className="text-sm font-bold uppercase tracking-[.14em] text-slate-400">Related {content.serviceName} capabilities</p>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3">{siblings.slice(0, 6).map(feature => <Link key={feature.slug} href={featurePath(feature)} className="text-sm font-semibold text-slate-200 hover:text-white">{feature.eyebrow} <span aria-hidden="true">→</span></Link>)}</div>
          </div>
        </div>
      </section>
    </main>
  );
}
