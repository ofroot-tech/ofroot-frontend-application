import Link from 'next/link';
import { SECURITY_NEWS, SECURITY_GUIDE } from '@/app/lib/application-security-content';
import styles from './SecurityNewsSpotlight.module.css';

export default function SecurityNewsSpotlight() {
  return <section className={styles.spotlight} aria-labelledby="security-briefing-heading">
    <div><p className={styles.label}>OfRoot / Application security</p><h2 id="security-briefing-heading"><Link href={SECURITY_NEWS.href}>{SECURITY_NEWS.title}</Link></h2></div>
    <div><p>November 17, 2026 · Recent CISA catalog additions, Next.js and PHP updates, and what application owners should check.</p><Link href={SECURITY_NEWS.href}>Read the security briefing →</Link><Link href={SECURITY_GUIDE.href}>Plan a review or penetration test →</Link></div>
  </section>;
}
