import { ArrowDown, ArrowRight, ArrowUpRight } from 'lucide-react';
import { TrackedLink } from './Analytics';
import styles from './HomeHero.module.css';

const systems = [
  { stage: 'Attract', title: 'Make a strong first impression.', detail: 'Websites · SEO / AEO / GEO · Ads', href: '/services/ai-discoverability' },
  { stage: 'Connect', title: 'Make the work flow.', detail: 'Integrations · Internal tools · Reporting', href: '/services/automation-systems' },
  { stage: 'Enable', title: 'Put AI to practical use.', detail: 'AI systems · Evaluation · Deployment', href: '/services/private-company-ai' },
];

/** A service illustration, not a live dashboard or a claim of client results. */
function ConnectedSystems() {
  return (
    <div className={styles.systems} aria-label="Three connected areas of work">
      <div className={styles.diagramHeading}>
        <span>Built around your business</span>
        <span className={styles.diagramMark} aria-hidden="true">↗</span>
      </div>
      <div className={styles.flow}>
        <svg className={styles.conductor} viewBox="0 0 80 330" fill="none" aria-hidden="true">
          <path d="M72 55H48C30 55 22 65 22 83V247C22 265 30 275 48 275H72M22 165H72" />
          <path className={styles.signal} d="M72 55H48C30 55 22 65 22 83V247C22 265 30 275 48 275H72M22 165H72" />
          <circle cx="22" cy="165" r="5" />
        </svg>
        {systems.map((system) => (
          <TrackedLink key={system.stage} href={system.href} source={`homepage:hero:${system.stage.toLowerCase()}`} event="service_cta_clicked" className={styles.system}>
            <span className="sr-only">{system.stage}: {system.title} {system.detail}</span>
            <div className={styles.stage} aria-hidden="true">{system.stage}</div>
            <div className={styles.systemContent} aria-hidden="true">
              <span className={styles.systemTitle}>{system.title}</span>
              <span className={styles.systemDetail}>{system.detail}</span>
            </div>
            <ArrowUpRight className={styles.systemArrow} size={18} aria-hidden="true" />
          </TrackedLink>
        ))}
      </div>
      <p className={styles.diagramCaption}>One connected system. One accountable partner.</p>
    </div>
  );
}

export default function HomeHero() {
  return (
    <section className={styles.hero} aria-labelledby="home-hero-heading">
      <div className={styles.inner}>
        <div className={styles.layout}>
          <div className={styles.copy}>
            <p className={styles.eyebrow}><span aria-hidden="true" />Websites, software & AI engineering</p>
            <h1 id="home-hero-heading" className={styles.title}>Your next stage.{' '}<br /><span>Built on better systems.</span></h1>
            <p className={styles.description}>Marketing websites that explain your value. Connected tools that move work forward. AI systems built around a useful task. OfRoot brings the design and engineering together.</p>
            <div className={styles.actions}>
              <TrackedLink href="/book?source=homepage-hero" source="homepage:hero" className={styles.primary}>Discuss your project<ArrowRight size={18} aria-hidden="true" /></TrackedLink>
              <TrackedLink href="#systems" source="homepage:explore" event="secondary_cta_clicked" className={styles.secondary}>Explore our services<ArrowDown size={16} aria-hidden="true" /></TrackedLink>
            </div>
            <p className={styles.assurance}>Founder-led. 11 years in technology. Clear scope from the first conversation.</p>
          </div>
          <ConnectedSystems />
        </div>
        <div className={styles.footer}>
          <p>For service businesses, founders, and growing teams.</p>
          <TrackedLink href="/results" source="homepage:hero:work" event="secondary_cta_clicked" className={styles.workLink}>Explore what we can build<ArrowUpRight size={16} aria-hidden="true" /></TrackedLink>
        </div>
      </div>
    </section>
  );
}
