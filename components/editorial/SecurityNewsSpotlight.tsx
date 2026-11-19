import Link from 'next/link';
import { SECURITY_GUIDE } from '@/app/lib/application-security-content';
import { SECURITY_EDITORIAL_NEWS } from '@/app/lib/security-editorial';
import styles from './SecurityNewsSpotlight.module.css';

export default function SecurityNewsSpotlight() {
  return <>{SECURITY_EDITORIAL_NEWS.map(article => <section key={article.slug} className={styles.spotlight} aria-labelledby={`security-${article.slug}`}>
    <div><p className={styles.label}>OfRoot / Application security</p><h2 id={`security-${article.slug}`}><Link href={article.href}>{article.title}</Link></h2></div>
    <div><p><time dateTime={article.publishedAt}>{new Intl.DateTimeFormat('en-US', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(`${article.publishedAt}T12:00:00Z`))}</time> · {article.description}</p><Link href={article.href}>Read the security update →</Link><Link href={SECURITY_GUIDE.href}>Plan a review or penetration test →</Link></div>
  </section>)}</>;
}
