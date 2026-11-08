import Link from 'next/link';
import { AI_PROCESS_GUIDE } from '@/app/lib/ai-process-guide';
import styles from './HomeReading.module.css';

export default function HomeReading() {
  return <section className={styles.section} aria-labelledby="reading-heading">
    <div className={styles.heading}><h2 id="reading-heading">Stay informed.<br />Find something useful.</h2><p>Understand what’s changing, then see how it could apply to the work you do.</p></div>
    <div className={styles.row}><div><h3>Signal</h3><p>Technology news with clear sources and short, evidence-based briefs.</p><Link href="/news">Explore Signal →</Link></div><div><h4>A clearer path to the source.</h4><p>Browse AI, integrations, healthcare, policy and cybersecurity. Read the original reporting or an available primary-source brief.</p><Link href="/news/briefs">Read Signal briefs →</Link><Link href="/news/from-ofroot">Signals from our articles →</Link></div></div>
    <div className={styles.row}><div><h3>From the blog</h3><p>Practical guides for connecting tools, reducing manual work and making useful AI decisions.</p><Link href="/blog">Browse the blog →</Link></div><div><h4>{AI_PROCESS_GUIDE.title}</h4><p>{AI_PROCESS_GUIDE.description}</p><Link href={AI_PROCESS_GUIDE.href}>Read the guide →</Link></div></div>
    <p><Link href="/news/subscribe?content=both">Choose the categories you want to follow →</Link></p>
  </section>;
}
