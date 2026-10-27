import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { generateOrganizationSchema, generatePricingSchema } from '@/app/lib/schemas';
import { growthMetadata } from '@/app/lib/growth-content';
import { PageView, TrackedLink, TrackedSection } from '@/components/growth/Analytics';
import PublicHero from '@/components/growth/PublicHero';
import styles from '@/components/growth/PublicPage.module.css';

export const metadata = growthMetadata(
  'AI Growth Systems Engagements and Pricing',
  'Review OfRoot engagement models for AI discoverability, revenue automation, private company AI, and ongoing growth-system optimization.',
  '/pricing',
);

const packages = [
  {
    name: 'AI Visibility Foundation',
    price: 'Scoped after audit',
    cadence: 'focused foundation',
    bestFor: 'Companies that need a clear discoverability baseline before investing in content or technical changes.',
    outcome: 'A prioritized implementation plan connecting search visibility, answer readiness, authority, and conversion.',
    points: ['AI visibility and technical assessment', 'Search-intent and content architecture', 'Schema, entity, and internal-linking plan', 'Measurement and conversion baseline'],
    cta: 'Book a Discoverability Audit',
    href: '/book?focus=discoverability&source=pricing',
  },
  {
    name: 'Growth Systems Build',
    price: 'From $3,500',
    cadence: 'one-time starting scope',
    bestFor: 'Teams with one visible conversion or automation bottleneck that needs a production-ready fix.',
    outcome: 'A scoped build connecting demand capture, routing, follow-up, reporting, or another priority workflow.',
    points: ['Current workflow and ownership map', 'One priority production implementation path', 'Validation, failure handling, and monitoring', 'Launch checklist, team training, and handoff'],
    cta: 'Scope a Growth Systems Build',
    href: '/book?focus=automation&source=pricing',
    featured: true,
  },
  {
    name: 'Company Intelligence System',
    price: 'Custom scope',
    cadence: 'milestone-based',
    bestFor: 'Organizations connecting approved documents, code, systems, and workflows to a permission-aware AI workspace.',
    outcome: 'A company-specific AI system designed around source access, user roles, citations, and measurable use.',
    points: ['Source, permission, and use-case mapping', 'Retrieval and answer-quality evaluation', 'Branded workspace and source citations', 'Audit logging, usage measures, and improvement plan'],
    cta: 'Plan a Company AI System',
    href: '/book?focus=private-ai&source=pricing',
  },
  {
    name: 'Ongoing Optimization',
    price: 'From $6,000',
    cadence: 'per month',
    bestFor: 'Teams operating multiple acquisition, automation, or AI workflows that need continuous ownership.',
    outcome: 'A measured operating cadence for improving visibility, conversion, reliability, and company-AI adoption.',
    points: ['Prioritized monthly improvement roadmap', 'Monitoring and workflow reliability', 'Content, conversion, and automation optimization', 'Weekly performance review and progress tracking'],
    cta: 'Discuss Ongoing Ownership',
    href: '/book?focus=ongoing-optimization&source=pricing',
  },
];

const faq = [
  {
    question: 'Why is only some pricing published?',
    answer: 'The existing entry points are a focused build starting at $3,500 and ongoing ownership starting at $6,000 per month. Discoverability and private company AI depend more heavily on source quality, access rules, content volume, and implementation complexity, so those are scoped after the audit.',
  },
  {
    question: 'Can we start with one layer?',
    answer: 'Yes. Begin with the bottleneck that has the clearest business cost. The architecture should still account for how discovery, conversion, and operations connect later.',
  },
  {
    question: 'What is included before implementation?',
    answer: 'OfRoot maps the current system, ownership boundaries, measurable outcome, dependencies, and release risk before committing to the build plan.',
  },
  {
    question: 'What happens after launch?',
    answer: 'A focused build can end with documentation and handoff, or continue through ongoing optimization when the system needs monitoring, iteration, and operational ownership.',
  },
];

export default function PricingPage() {
  return <main id="main-content" className={styles.page}>
    <PageView kind="pricing" name="engagement_models" />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(generatePricingSchema()) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(generateOrganizationSchema()) }} />
    <PublicHero eyebrow="Engagements & pricing" title="Start with the work that makes a difference." description="A focused build, a company AI system, or ongoing technical ownership. Choose a starting point around your business goal. We confirm the scope before implementation."
      breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Pricing' }]}
      primary={{ href: '/book?source=pricing-hero', label: 'Discuss your project', source: 'pricing:hero' }}
      secondary={{ href: '#engagements', label: 'Compare engagements', source: 'pricing:compare' }} />
    <div className={styles.shell}>
      <TrackedSection className={styles.section}>
        <div id="engagements">
          <div className={styles.sectionHeader}><div><p className={styles.eyebrow}>Starting points</p><h2 className={styles.sectionTitle}>Clear enough to budget. Flexible enough to fit.</h2></div><p>Published ranges are starting prices, not fixed bids. The audit identifies dependencies, implementation risk, and the measurable result before final scope.</p></div>
          <div className={styles.pricingGrid}>{packages.map(item => <article key={item.name} className={`${styles.card} ${styles.priceCard} ${item.featured ? styles.featured : ''}`}>
            <div className={styles.packageTop}><h2 className={styles.packageName}>{item.name}</h2>{item.featured && <span className={styles.badge}>Focused starting point</span>}</div>
            <p className={styles.price}>{item.price}</p><p className={styles.cadence}>{item.cadence}</p>
            <h3>Best for</h3><p>{item.bestFor}</p><h3>Business outcome</h3><p>{item.outcome}</p>
            <ul className={styles.list}>{item.points.map(point => <li key={point}><CheckCircle2 aria-hidden="true" />{point}</li>)}</ul>
            <TrackedLink href={item.href} source={`pricing:${item.name.toLowerCase().replaceAll(' ', '_')}`} className={styles.primary}>{item.cta}<ArrowRight aria-hidden="true" /></TrackedLink>
          </article>)}</div>
        </div>
      </TrackedSection>
      <section className={styles.section}>
        <div className={styles.sectionHeader}><h2 className={styles.sectionTitle}>Questions before scope.</h2><p>Understand the starting price, what shapes the final scope, and how we support the work after launch.</p></div>
        <div className={styles.faq}>{faq.map(item => <details key={item.question}><summary>{item.question}</summary><p>{item.answer}</p></details>)}</div>
      </section>
      <section className={`${styles.section} ${styles.closing}`}><div><p className={styles.eyebrow}>Recommendation first</p><h2 className={styles.sectionTitle}>Bring the bottleneck. Leave with the next useful scope.</h2></div><TrackedLink href="/book?source=pricing-final" source="pricing:final" className={styles.primary}>Discuss your project<ArrowRight aria-hidden="true" /></TrackedLink></section>
    </div>
  </main>;
}
