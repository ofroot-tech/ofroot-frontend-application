import { ArrowDown, ArrowRight, ArrowUpRight } from 'lucide-react';
import { TrackedLink } from './Analytics';
import styles from './HomeHero.module.css';

const systems = [
  { stage: 'Discover', title: 'Be the answer.', detail: 'Search & AI visibility', href: '/services/ai-discoverability' },
  { stage: 'Convert', title: 'Follow through.', detail: 'Connected revenue workflows', href: '/services/automation-systems' },
  { stage: 'Operate', title: 'Move with clarity.', detail: 'Private company AI', href: '/services/private-company-ai' },
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
            <p className={styles.eyebrow}><span aria-hidden="true" />AI growth systems & engineering</p>
            <h1 id="home-hero-heading" className={styles.title}>Growth deserves{' '}<br /><span>better systems.</span></h1>
            <p className={styles.description}>Get found. Follow through. Move work forward. We connect AI search, automation, and company knowledge to help your business do all three.</p>
            <div className={styles.actions}>
              <TrackedLink href="/book?source=homepage-hero" source="homepage:hero" className={styles.primary}>Book a Growth Systems Audit<ArrowRight size={18} aria-hidden="true" /></TrackedLink>
              <TrackedLink href="#systems" source="homepage:explore" event="secondary_cta_clicked" className={styles.secondary}>Explore our systems<ArrowDown size={16} aria-hidden="true" /></TrackedLink>
            </div>
            <p className={styles.assurance}>A clear starting point. A practical plan. An engineering partner.</p>
          </div>
          <ConnectedSystems />
        </div>
        <div className={styles.footer}>
          <p>From the first opportunity to the work that follows.</p>
          <TrackedLink href="/results" source="homepage:hero:work" event="secondary_cta_clicked" className={styles.workLink}>See the work behind the promise<ArrowUpRight size={16} aria-hidden="true" /></TrackedLink>
        </div>
      </div>
    </section>
  );
}
