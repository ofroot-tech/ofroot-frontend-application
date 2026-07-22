import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import type { GrowthPageContent } from '@/app/lib/growth-content';
import { SITE_URL } from '@/app/lib/growth-content';
import { PageView, TrackedLink } from './Analytics';

const primary = 'inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#FF9312] px-6 py-3 font-semibold text-[#171717] transition hover:bg-[#ffad42] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FF9312]';
const secondary = 'inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/25 px-6 py-3 font-semibold text-white transition hover:border-white/50 hover:bg-white/10';

export default function GrowthPage({ content, kind }: { content: GrowthPageContent; kind: 'service' | 'solution' }) {
  const breadcrumbs = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: kind === 'service' ? 'Services' : 'Solutions', item: `${SITE_URL}/${kind === 'service' ? 'services' : 'solutions'}` },
      { '@type': 'ListItem', position: 3, name: content.eyebrow, item: `${SITE_URL}${content.path}` },
    ],
  };
  return (
    <main id="main-content" className="bg-[#f7f6f2] text-slate-950">
      <PageView kind={kind} name={content.eyebrow.toLowerCase().replaceAll(' ', '_')} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />

      <section className="relative overflow-hidden bg-[#071225] px-6 py-20 text-white sm:px-8 sm:py-28">
        <div className="pointer-events-none absolute inset-0 opacity-80" aria-hidden="true" style={{ background: 'radial-gradient(circle at 82% 20%, rgba(55,255,224,.16), transparent 28%), radial-gradient(circle at 18% 80%, rgba(255,147,18,.18), transparent 30%)' }} />
        <div className="relative mx-auto max-w-6xl">
          <nav aria-label="Breadcrumb" className="mb-10 flex items-center gap-2 text-sm text-slate-300">
            <Link href="/" className="hover:text-white">Home</Link><span aria-hidden="true">/</span><span>{kind === 'service' ? 'Services' : 'Solutions'}</span><span aria-hidden="true">/</span><span className="text-white">{content.eyebrow}</span>
          </nav>
          <p className="mb-5 text-sm font-bold uppercase tracking-[0.18em] text-[#FFC46B]">{content.eyebrow}</p>
          <h1 className="max-w-5xl text-balance text-4xl font-black leading-[1.02] text-white sm:text-6xl">{content.title}</h1>
          <p className="mx-0 mt-6 max-w-3xl text-lg text-slate-200 sm:text-xl">{content.description}</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <TrackedLink href={content.primaryCta.href} source={`${content.eyebrow}:hero`} className={primary}>{content.primaryCta.label}<ArrowRight className="h-4 w-4" /></TrackedLink>
            {content.secondaryCta && <TrackedLink href={content.secondaryCta.href} source={`${content.eyebrow}:secondary`} event="secondary_cta_clicked" className={secondary}>{content.secondaryCta.label}</TrackedLink>}
          </div>
          <p className="mx-0 mt-8 max-w-3xl border-l-2 border-[#37FFE0] pl-4 text-sm text-slate-300">Built around measurable outcomes, visible system behavior, and technical ownership.</p>
        </div>
      </section>

      <section className="px-6 py-16 sm:px-8">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[.7fr_1.3fr] lg:items-start">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#B55B00]">The plain-language answer</p>
          <p className="mx-0 max-w-3xl text-balance text-2xl font-semibold leading-snug text-slate-800 sm:text-3xl">{content.summary}</p>
        </div>
      </section>

      <div id="system">
        {content.sections.map((section, index) => (
          <section key={section.title} className={index % 2 === 0 ? 'border-y border-slate-200 bg-white px-6 py-20 sm:px-8' : 'px-6 py-20 sm:px-8'}>
            <div className="mx-auto max-w-6xl">
              {section.eyebrow && <p className="mb-3 text-sm font-bold uppercase tracking-[0.16em] text-[#B55B00]">{section.eyebrow}</p>}
              <div className="grid gap-6 lg:grid-cols-[.75fr_1.25fr]">
                <h2 className="text-balance text-3xl font-black text-slate-950 sm:text-4xl">{section.title}</h2>
                <p className="mx-0 max-w-2xl text-lg text-slate-600">{section.body}</p>
              </div>
              {section.flow && (
                <ol className="mt-10 grid gap-3 md:grid-cols-3 xl:grid-cols-7" aria-label="System flow">
                  {section.flow.map((step, stepIndex) => <li key={step} className="relative rounded-2xl border border-slate-200 bg-[#f7f6f2] p-4 text-sm font-semibold text-slate-800"><span className="mb-2 block text-xs font-bold text-[#B55B00]">{String(stepIndex + 1).padStart(2, '0')}</span>{step}{stepIndex < section.flow!.length - 1 && <ArrowRight className="absolute -right-2 top-1/2 z-10 hidden h-4 w-4 -translate-y-1/2 rounded-full bg-white text-[#B55B00] xl:block" />}</li>)}
                </ol>
              )}
              {section.items && (
                <div className="mt-10 grid gap-4 md:grid-cols-3">
                  {section.items.map(item => <article key={item.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,.05)]"><CheckCircle2 className="mb-5 h-5 w-5 text-[#C96800]" aria-hidden="true" /><h3 className="text-xl font-bold text-slate-950">{item.title}</h3><p className="mx-0 mt-3 text-sm leading-relaxed text-slate-600">{item.body}</p></article>)}
                </div>
              )}
            </div>
          </section>
        ))}
      </div>

      <section className="bg-[#071225] px-6 py-16 text-white sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div><p className="mb-3 text-sm font-bold uppercase tracking-[0.16em] text-[#FFC46B]">Next step</p><h2 className="max-w-3xl text-3xl font-black text-white sm:text-4xl">Find the highest-impact gap in your growth system.</h2></div>
          <TrackedLink href={content.primaryCta.href} source={`${content.eyebrow}:final`} className={primary}>{content.primaryCta.label}<ArrowRight className="h-4 w-4" /></TrackedLink>
        </div>
        <div className="mx-auto mt-10 flex max-w-6xl flex-wrap gap-x-6 gap-y-2 border-t border-white/10 pt-6 text-sm text-slate-300">{content.related.map(link => <Link key={link.href} href={link.href} className="hover:text-white">{link.label} <span aria-hidden="true">→</span></Link>)}</div>
      </section>
    </main>
  );
}
