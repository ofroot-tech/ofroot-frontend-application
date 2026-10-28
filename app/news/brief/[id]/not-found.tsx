import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import SignalHeader from '../../SignalHeader';
import news from '../../news.module.css';
import styles from './brief.module.css';

/** Missing and suppressed references have the same public outcome. */
export default function BriefNotFound() {
  return <main id="main-content" className={`${news.news} ${styles.page}`}><div className={news.container}><SignalHeader current="briefs" /><section className={styles.waiting} aria-labelledby="missing-heading"><p className={styles.kicker}>SIGNAL / REFERENCE UNAVAILABLE</p><h1 id="missing-heading">This reference isn’t available.</h1><p>It may have been removed, its source may be paused, or its archive may be temporarily unavailable. Explore the available briefs or return to the latest news.</p><div className={styles.actions}><Link href="/news" className={news.primary}><ArrowLeft size={17} aria-hidden="true" />Back to the latest</Link><Link href="/news/briefs" className={styles.secondary}>Explore Signal briefs <ArrowRight size={17} aria-hidden="true" /></Link></div></section></div></main>;
}
