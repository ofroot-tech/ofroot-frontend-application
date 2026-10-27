import Link from 'next/link';
import { ArrowRight, CheckCircle2, SearchCheck, Network, Bot } from 'lucide-react';
import JsonLd from '@/components/seo/JsonLd';
import { SITE } from '@/app/config/site';
import { growthMetadata } from '@/app/lib/growth-content';
import { serviceOffers } from '@/app/lib/service-offers';
import PublicHero from '@/components/growth/PublicHero';
import styles from '@/components/growth/PublicPage.module.css';

export const metadata = growthMetadata('Websites, Integrations & AI Services', 'Marketing websites, SEO, AEO, GEO and ads; integrations and internal tools; AI systems and deployment. Explore three ways to work with OfRoot.', '/services');
const icons = [SearchCheck, Network, Bot];

export default function ServicesIndexPage() {
  return (
    <main id="main-content" className={styles.page}>
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'OfRoot Services', url: `${SITE.url}/services`, mainEntity: { '@type': 'ItemList', itemListElement: serviceOffers.map((offer, index) => ({ '@type': 'ListItem', position: index + 1, item: { '@type': 'Service', name: offer.title, description: offer.description, url: `${SITE.url}${offer.href}`, provider: { '@type': 'Organization', name: SITE.name, url: SITE.url } } })) } }} />
      <PublicHero eyebrow="Attract · Connect · Enable" title="The website. The workflow. The system behind it." description="Three clear offers, with the design and engineering to connect them. Start with a specific goal and build a scope around what your business needs."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Services' }]}
        primary={{ href: '/book?source=services-hero', label: 'Discuss your project', source: 'services:hero' }}
        secondary={{ href: '/pricing', label: 'Review engagement options', source: 'services:pricing' }} />
      <div className={styles.shell}>
      <section className={styles.section} aria-labelledby="service-lines">
        <div className={styles.sectionHeader}><div><p className={styles.eyebrow}>How we can help</p><h2 id="service-lines" className={styles.sectionTitle}>Choose a useful starting point.</h2></div><p className="text-lg text-[#c0b5cc]">We define the scope, dependencies, ownership, and acceptance checks before implementation. Timelines and costs depend on the actual work.</p></div>
        <div className="mt-10 grid gap-5">
          {serviceOffers.map((offer, index) => {
            const Icon = icons[index];
            return <article key={offer.id} className={styles.serviceRow}><div><div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#30263d] text-[#c3afe1]"><Icon className="h-5 w-5" aria-hidden="true" /></span><span className="text-xs font-bold uppercase tracking-[.16em] text-[#b8a4d8]">0{index + 1} · {offer.step}</span></div><h3 className="mt-6 text-3xl font-black">{offer.title}</h3><Link href={offer.href} className={styles.textLink}>Explore the service<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></div><div className={`${styles.columns} ${styles.card}`}><div><h4 className="text-sm font-bold uppercase tracking-[.12em] text-[#b8a4d8]">When it helps</h4><p className="mt-3 text-sm leading-6 text-[#c0b5cc]">{offer.problem}</p><h4 className="mt-6 text-sm font-bold uppercase tracking-[.12em] text-[#b8a4d8]">What we work toward</h4><p className="mt-3 text-sm leading-6 text-[#c0b5cc]">{offer.outcome}</p></div><div><h4 className="text-sm font-bold uppercase tracking-[.12em] text-[#b8a4d8]">Typical scope</h4><ul className="mt-3 space-y-3">{offer.includes.map(item => <li key={item} className="flex gap-3 text-sm leading-6 text-[#c0b5cc]"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#b4a0ef]" aria-hidden="true" />{item}</li>)}</ul></div></div></article>;
          })}
        </div>
      </section>

      <section className={styles.section}><div className={styles.sectionHeader}><div><p className={styles.eyebrow}>Relevant capabilities</p><h2 className={styles.sectionTitle}>See how the pieces fit.</h2></div><div><p className="text-lg text-[#c0b5cc]">Explore approaches to reporting and reconciliation, operational applications, API automation, AI-assisted tools, and marketing websites. Each example explains potential scope and what needs validation.</p><Link href="/results" className={styles.textLink}>Explore capability examples<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></div></div></section>
      <section className={styles.section}><h2 className={styles.sectionTitle}>Working in home services?</h2><p className="mt-3 max-w-3xl text-[#c0b5cc]">We can review the path from website inquiry to scheduling and follow-up, while keeping the software you already rely on in view.</p><Link href="/book?focus=home-services-automation&source=services" className={styles.textLink}>Discuss a home-services workflow<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></section>
      </div>
    </main>
  );
}
