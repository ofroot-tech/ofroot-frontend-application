import PublicHero from '@/components/growth/PublicHero';
import publicStyles from '@/components/growth/PublicPage.module.css';
import Link from 'next/link';
import { ArrowRight, BarChart3, CheckCircle2, FileCheck2, Route, ShieldCheck } from 'lucide-react';
import type { FeatureContent } from '@/app/lib/feature-content';
import { featurePath, getFeaturesForService } from '@/app/lib/feature-content';
import { SITE_URL } from '@/app/lib/growth-content';
import { PageView, TrackedLink } from './Analytics';

const primary = 'inline-flex min-h-12 items-center justify-center gap-2 rounded-[2px] bg-[#574064] px-6 py-3 font-semibold text-[#faf9fc] transition hover:bg-[#6d4c70] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ffb78f]';

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
    <main id="main-content" className={`${publicStyles.page} ${publicStyles.legacy} bg-[#17141f] text-[#faf9fc]`}>
      <PageView kind="feature" name={`${content.service}:${content.slug}`} />
      {[breadcrumbSchema, serviceSchema, faqSchema].map((schema, index) => (
        <script key={index} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}

            <PublicHero eyebrow={`${content.serviceName} / ${content.eyebrow}`} title={content.title} description={content.description}
        breadcrumbs={[{label:'Home',href:'/'},{label:content.serviceName,href:`/services/${content.service}`},{label:content.eyebrow}]}
        primary={{href:`/book?focus=${content.slug}&source=feature-page`,label:'Discuss this system',source:`${content.slug}:hero`}}
        secondary={{href:`/services/${content.service}`,label:`Explore ${content.serviceName}`,source:`${content.slug}:service`}}>
        <div className={publicStyles.footerLinks}><span>Written by OfRoot Technology</span><span>Updated July 22, 2026</span><span>Reviewed for evidence boundaries</span></div>
      </PublicHero>

      <section className="px-6 py-16 sm:px-8" aria-labelledby="direct-answer">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[.62fr_1.38fr]">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#c4abe3]">Direct answer</p>
            <h2 id="direct-answer" className="mt-3 text-2xl font-medium text-[#faf9fc]">What is {content.eyebrow.toLowerCase()}?</h2>
          </div>
          <div>
            <p className="mx-0 text-balance text-xl font-semibold leading-relaxed text-[#e0d8e9] sm:text-2xl">{content.directAnswer}</p>
            <div className="mt-7 rounded-[2px] border border-[#b4a0ef]/30 bg-[#211c2c] p-5">
              <p className="mx-0 text-sm font-bold uppercase tracking-[.14em] text-[#c4abe3]">The question this solves</p>
              <p className="mx-0 mt-2 text-lg font-semibold text-[#faf9fc]">{content.buyerQuestion}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[#d2caeb]/16 bg-[#211c2c] px-6 py-20 sm:px-8" aria-labelledby="outcomes">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-6 lg:grid-cols-[.75fr_1.25fr]">
            <div><p className="text-sm font-bold uppercase tracking-[.16em] text-[#c4abe3]">Business value</p><h2 id="outcomes" className="mt-3 text-3xl font-medium sm:text-4xl">What changes when the system works</h2></div>
            <p className="mx-0 text-lg text-[#c0b5cc]">The work is judged by observable business and operational outcomes, not by the number of tools configured.</p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {content.outcomes.map(item => <article key={item.title} className="rounded-[2px] border border-[#d2caeb]/16 bg-[#17141f] p-6"><CheckCircle2 className="mb-5 h-6 w-6 text-[#b4a0ef]" aria-hidden="true" /><h3 className="text-xl font-bold">{item.title}</h3><p className="mx-0 mt-3 text-sm leading-relaxed text-[#c0b5cc]">{item.body}</p></article>)}
          </div>
        </div>
      </section>

      <section className="px-6 py-20 sm:px-8" aria-labelledby="included">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-6 lg:grid-cols-[.75fr_1.25fr]">
            <div><p className="text-sm font-bold uppercase tracking-[.16em] text-[#c4abe3]">Scope</p><h2 id="included" className="mt-3 text-3xl font-medium sm:text-4xl">What the implementation covers</h2></div>
            <p className="mx-0 text-lg text-[#c0b5cc]">The final scope follows the observed system, current constraints, and the smallest release that can prove value safely.</p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {content.included.map((item, index) => <article key={item.title} className="rounded-[2px] border border-[#d2caeb]/16 bg-[#211c2c] p-6 shadow-[0_12px_35px_rgba(15,23,42,.04)]"><span className="mb-5 inline-flex h-9 w-9 items-center justify-center rounded-[2px] bg-[#211c2c] text-sm font-bold text-[#c4abe3]">{index + 1}</span><h3 className="text-xl font-bold">{item.title}</h3><p className="mx-0 mt-3 text-[#c0b5cc]">{item.body}</p></article>)}
          </div>
        </div>
      </section>

      <section className="bg-[#262231] px-6 py-20 text-white sm:px-8" aria-labelledby="process">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-bold uppercase tracking-[.16em] text-[#c4abe3]">Implementation path</p>
          <h2 id="process" className="mt-3 max-w-3xl text-3xl font-medium text-white sm:text-4xl">Understand first. Change narrowly. Verify reality.</h2>
          <ol className="mt-10 grid gap-4 lg:grid-cols-4">
            {content.process.map((item, index) => <li key={item.title} className="rounded-[2px] border border-white/10 bg-[#211c2c]/[.04] p-6"><span className="text-sm font-bold text-[#b4a0ef]">0{index + 1}</span><h3 className="mt-4 text-xl font-bold text-white">{item.title}</h3><p className="mx-0 mt-3 text-sm text-slate-300">{item.body}</p></li>)}
          </ol>
        </div>
      </section>

      <section className="border-b border-[#d2caeb]/16 bg-[#211c2c] px-6 py-20 sm:px-8" aria-labelledby="measurement">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-6 lg:grid-cols-[.75fr_1.25fr]">
            <div><BarChart3 className="mb-5 h-7 w-7 text-[#b4a0ef]" aria-hidden="true" /><h2 id="measurement" className="text-3xl font-medium sm:text-4xl">What we measure</h2></div>
            <p className="mx-0 text-lg text-[#c0b5cc]">Definitions stay fixed long enough to compare the same system before and after a change.</p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">{content.measures.map(item => <article key={item.title} className="rounded-[2px] border border-[#d2caeb]/16 p-6"><h3 className="text-lg font-bold">{item.title}</h3><p className="mx-0 mt-3 text-sm text-[#c0b5cc]">{item.body}</p></article>)}</div>
        </div>
      </section>

      <section className="px-6 py-20 sm:px-8" aria-labelledby="example">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[.7fr_1.3fr]">
          <div><Route className="mb-5 h-7 w-7 text-[#b4a0ef]" aria-hidden="true" /><p className="text-sm font-bold uppercase tracking-[.16em] text-[#c4abe3]">Worked example</p><h2 id="example" className="mt-3 text-3xl font-medium sm:text-4xl">{content.example.title}</h2><p className="mx-0 mt-5 text-[#c0b5cc]">{content.example.body}</p></div>
          <ol className="space-y-3">{content.example.steps.map((step, index) => <li key={step} className="flex items-center gap-4 rounded-[2px] border border-[#d2caeb]/16 bg-[#211c2c] p-5"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[2px] bg-[#574064] text-sm font-medium text-[#faf9fc]">{index + 1}</span><span className="font-semibold text-[#e0d8e9]">{step}</span></li>)}</ol>
        </div>
      </section>

      <section className="border-y border-[#d2caeb]/16 bg-[#211c2c] px-6 py-20 sm:px-8" aria-labelledby="evidence">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-3">
          <div><FileCheck2 className="mb-5 h-7 w-7 text-[#b4a0ef]" aria-hidden="true" /><h2 id="evidence" className="text-2xl font-medium">Evidence used</h2><p className="mx-0 mt-3 text-sm text-[#c0b5cc]">Direct system behavior, source records, analytics, tests, and approved business definitions take priority over assumptions.</p></div>
          <div><ShieldCheck className="mb-5 h-7 w-7 text-[#b4a0ef]" aria-hidden="true" /><h3 className="text-xl font-bold">How we measure success</h3><p className="mx-0 mt-3 text-sm text-[#c0b5cc]">We define the starting point, document what changes, and verify the result before presenting it as an outcome.</p></div>
          <div><CheckCircle2 className="mb-5 h-7 w-7 text-[#b4a0ef]" aria-hidden="true" /><h3 className="text-xl font-bold">Completion proof</h3><p className="mx-0 mt-3 text-sm text-[#c0b5cc]">A release is complete only after its intended output is observed in the target environment and a rollback or correction path is understood.</p></div>
        </div>
      </section>

      <section className="px-6 py-20 sm:px-8" aria-labelledby="faq">
        <div className="mx-auto max-w-4xl">
          <p className="text-center text-sm font-bold uppercase tracking-[.16em] text-[#c4abe3]">Direct answers</p>
          <h2 id="faq" className="mt-3 text-center text-3xl font-medium sm:text-4xl">Frequently asked questions</h2>
          <div className="mt-10 space-y-3">{content.faqs.map(faq => <details key={faq.question} className="group rounded-[2px] border border-[#d2caeb]/16 bg-[#211c2c] p-6"><summary className="cursor-pointer list-none pr-8 text-lg font-bold text-[#faf9fc]">{faq.question}</summary><p className="mx-0 mt-4 text-[#c0b5cc]">{faq.answer}</p></details>)}</div>
        </div>
      </section>

      <section className="bg-[#211c2c] px-6 py-16 text-white sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div><p className="text-sm font-bold uppercase tracking-[.16em] text-[#c4abe3]">Next step</p><h2 className="mt-3 max-w-3xl text-3xl font-medium text-white sm:text-4xl">Find out whether {content.eyebrow.toLowerCase()} is the highest-impact place to start.</h2></div>
            <TrackedLink href={`/book?focus=${content.slug}&source=feature-final`} source={`${content.slug}:final`} className={primary}>Book a Growth Systems Audit<ArrowRight className="h-4 w-4" /></TrackedLink>
          </div>
          <div className="mt-10 border-t border-white/10 pt-8">
            <p className="text-sm font-bold uppercase tracking-[.14em] text-[#b4a3c5]">Related {content.serviceName} capabilities</p>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3">{siblings.slice(0, 6).map(feature => <Link key={feature.slug} href={featurePath(feature)} className="text-sm font-semibold text-slate-200 hover:text-white">{feature.eyebrow} <span aria-hidden="true">→</span></Link>)}</div>
          </div>
        </div>
      </section>
    </main>
  );
}
