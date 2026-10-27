import { ArrowRight } from 'lucide-react';
import { TrackedLink } from './Analytics';
import HeroShimmer from './HeroShimmer';
import BarReveal from './BarReveal';
import MotionText from './MotionText';
import styles from './ApprovedHome.module.css';

export default function HomeHero() {
  return (
    <>
      <HeroShimmer>
        <div className={styles.heroGrid} aria-hidden="true"><span /><span /><span /></div>
        <div className={`${styles.shell} ${styles.heroInner}`}>
          <p className={styles.eyebrow}>Software, automation &amp; practical AI</p>
          <h1 id="home-hero-heading" className={styles.title}><MotionText trigger="load">Less manual work.</MotionText><MotionText trigger="load" delay={90}>More time to grow.</MotionText></h1>
          <div className={styles.heroDetail}>
            <div className={styles.intro}>
              <p>We connect your tools, automate repetitive tasks, and set up AI around the work your team actually does.</p>
              <BarReveal className={styles.heroCta}><TrackedLink href="/book?source=homepage-hero" source="homepage:hero" className={`${styles.primary} ${styles.barPlane}`}><MotionText trigger="bar" className={styles.barHeading}>Discuss your project</MotionText><ArrowRight className={`${styles.arrow} ${styles.barArrow}`} aria-hidden="true" /></TrackedLink></BarReveal>
              <div className={styles.trust}>Tell us where work gets stuck.<br />We’ll review it and reply by email with a practical next step.</div>
            </div>
          </div>
          <BarReveal className={styles.heroTiles}>
            <TrackedLink href="/services/automation-systems" source="homepage:hero:connect" event="service_cta_clicked" className={`${styles.featureTile} ${styles.barPlane}`}><span className={styles.tileKicker}>Connected workflows</span><div><span className={styles.tileTitle}><MotionText trigger="bar" className={styles.barHeading}>Connect your tools.</MotionText><ArrowRight className={`${styles.arrow} ${styles.barArrow}`} aria-hidden="true" /></span><p className={styles.tileSub}>CRM · Reporting · Internal software</p></div></TrackedLink>
            <TrackedLink href="/services/private-company-ai" source="homepage:hero:ai" event="service_cta_clicked" className={`${styles.featureTile} ${styles.barPlane}`}><span className={styles.tileKicker}>Practical AI</span><div><span className={styles.tileTitle}><MotionText trigger="bar" className={styles.barHeading}>Put AI to work.</MotionText><ArrowRight className={`${styles.arrow} ${styles.barArrow}`} aria-hidden="true" /></span><p className={styles.tileSub}>Setup · Company knowledge · Team workflows</p></div></TrackedLink>
          </BarReveal>
          <div className={styles.heroNote}>One connected system. <strong>One accountable partner.</strong></div>
        </div>
      </HeroShimmer>
      <div className={styles.bridge}><div className={`${styles.shell} ${styles.bridgeInner}`}><p>For owners and operations teams at growing businesses.</p><TrackedLink href="#examples" source="homepage:examples" event="secondary_cta_clicked">See example workflows<ArrowRight className={styles.arrow} aria-hidden="true" /></TrackedLink></div></div>
    </>
  );
}
