import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';
import SignalHeader from '../../SignalHeader';
import news from '../../news.module.css';
import styles from './brief.module.css';

/** Loading describes the real evidence check without promising a summary. */
export default function BriefLoading() {
  return <main id="main-content" className={`${news.news} ${styles.page}`}><div className={news.container}><SignalHeader current="briefs" /><section className={styles.waiting} aria-labelledby="loading-heading" aria-busy="true"><p className={styles.kicker}><FileText size={16} aria-hidden="true" />SIGNAL / BRIEF</p><h1 id="loading-heading">Checking the source coverage.</h1><p>A digest appears only when an approved primary record supports it.</p><Link href="/news" className={styles.secondary}><ArrowLeft size={17} aria-hidden="true" />Back to the latest</Link></section></div></main>;
}
