import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import type { GrowthPageContent } from '@/app/lib/growth-content';
import { SITE_URL } from '@/app/lib/growth-content';
import { featurePath, getFeaturesForService } from '@/app/lib/feature-content';
import { PageView, TrackedLink } from './Analytics';
import PublicHero from './PublicHero';
import styles from './PublicPage.module.css';

export default function GrowthPage({ content, kind }: { content: GrowthPageContent; kind: 'service' | 'solution' }) {
  const features = kind === 'service' ? getFeaturesForService(content.path.split('/').at(-1) || '') : [];
  const parent = kind === 'service' ? 'Services' : 'Solutions';
  const parentPath = kind === 'service' ? '/services' : '/solutions';
  const breadcrumbs = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: parent, item: `${SITE_URL}${parentPath}` },
      { '@type': 'ListItem', position: 3, name: content.eyebrow, item: `${SITE_URL}${content.path}` },
    ],
  };
  return <main id="main-content" className={styles.page}>
    <PageView kind={kind} name={content.eyebrow.toLowerCase().replaceAll(' ', '_')} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />
    <PublicHero eyebrow={content.eyebrow} title={content.title} description={content.description}
      breadcrumbs={[{ label: 'Home', href: '/' }, { label: parent, href: kind === 'service' ? parentPath : undefined }, { label: content.eyebrow }]}
      primary={{ ...content.primaryCta, source: `${content.eyebrow}:hero` }}
      secondary={content.secondaryCta ? { ...content.secondaryCta, source: `${content.eyebrow}:secondary` } : undefined} />
    <div className={styles.shell}>
      <section className={styles.section}>
        <div className={styles.split}><p className={styles.eyebrow}>The plain-language answer</p><p>{content.summary}</p></div>
        <p className={styles.note}>Built around measurable outcomes, visible system behavior, and technical ownership.</p>
      </section>
      {features.length > 0 && <section className={styles.section} aria-labelledby="feature-capabilities">
        <div className={styles.sectionHeader}><div><p className={styles.eyebrow}>Explore the system</p><h2 id="feature-capabilities" className={styles.sectionTitle}>Each capability has one clear job.</h2></div><p>Choose the specific problem you need to understand. Every page explains the challenge, what the work includes, how progress is measured, and the next step in plain language.</p></div>
        <div className={styles.grid}>{features.map(feature => <article key={feature.slug} className={styles.card}><h3>{feature.eyebrow}</h3><p>{feature.description}</p><Link href={featurePath(feature)} className={styles.textLink}>Explore capability<ArrowRight aria-hidden="true" /></Link></article>)}</div>
      </section>}
      <div id="system">{content.sections.map(section => <section key={section.title} className={styles.section}>
        {section.eyebrow && <p className={styles.eyebrow}>{section.eyebrow}</p>}
        <div className={styles.split}><h2 className={styles.sectionTitle}>{section.title}</h2><p>{section.body}</p></div>
        {section.flow && <ol className={styles.flow} aria-label="System flow">{section.flow.map((step, index) => <li key={step}><span>{String(index + 1).padStart(2, '0')}</span>{step}</li>)}</ol>}
        {section.items && <div className={styles.grid}>{section.items.map(item => <article key={item.title} className={styles.card}><CheckCircle2 className={styles.icon} aria-hidden="true" /><h3>{item.title}</h3><p>{item.body}</p></article>)}</div>}
      </section>)}</div>
      <section className={styles.section}>
        <div className={styles.closing}><div><p className={styles.eyebrow}>Next step</p><h2 className={styles.sectionTitle}>Find the highest-impact gap in your growth system.</h2></div><TrackedLink href={content.primaryCta.href} source={`${content.eyebrow}:final`} className={styles.primary}>{content.primaryCta.label}<ArrowRight aria-hidden="true" /></TrackedLink></div>
        <div className={styles.footerLinks}>{content.related.map(link => <Link key={link.href} href={link.href}>{link.label} <span aria-hidden="true">→</span></Link>)}</div>
      </section>
    </div>
  </main>;
}
