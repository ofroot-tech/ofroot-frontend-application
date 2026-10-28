import { ArrowRight } from 'lucide-react';
import type { NewsCategory } from '@/app/lib/news/types';
import styles from './subscription.module.css';

/** One consistent invitation links to explicit topic and consent choices. */
export default function SubscribeCTA({ compact = false, topic, heading = 'Signal, on your terms.', description = 'Choose the topics you follow and get a daily or weekly digest with a clear path to the source.' }: { compact?: boolean; topic?: NewsCategory; heading?: string; description?: string }) {
  return <section className={`${styles.cta} ${compact ? styles.compact : ''}`} aria-label="Subscribe to Signal"><div><p className={styles.eyebrow}>SIGNAL / IN YOUR INBOX</p><h2>{heading}</h2><p>{description}</p></div><a href={`/news/subscribe${topic ? `?topic=${topic}` : ''}`} className={styles.primary}>Choose my Signal <ArrowRight size={18} aria-hidden="true" /></a></section>;
}
