import { ArrowUpRight, AudioLines } from 'lucide-react';
import type { NewsCategory } from '@/app/lib/news/types';
import type { SignalContent, SignalFrequency } from '@/app/lib/signal-subscriptions/types';
import { topics as topicLabels } from '../presentation';
import { buildDigestPreview } from './digest-preview';
import styles from './subscription.module.css';

/** This small reading surface responds to form choices without listening to
 * the email input. No mailbox, consent, token, or network request enters it. */
export default function DigestPreview({ topics, content, frequency }: { topics: NewsCategory[]; content: SignalContent; frequency: SignalFrequency }) {
  const items = buildDigestPreview(topics, content);
  return <section className={styles.preview} aria-labelledby="digest-preview-title">
    <div className={styles.previewBrand}><AudioLines size={22} aria-hidden="true" /><strong>Signal</strong><span>BY OFROOT</span></div>
    <p className={styles.eyebrow}>SAMPLE LAYOUT / ILLUSTRATIVE CONTENT</p>
    <h2 id="digest-preview-title">Your {frequency} Signal.</h2>
    <p className={styles.previewIntro}>{frequency === 'weekly' ? 'A Monday roundup' : 'A daily digest'} for {topics.length ? topics.map(topic => topicLabels.find(item => item.id === topic)?.short).join(', ') : 'the interests you choose'}.</p>
    <div className={styles.previewItems}>
      {items.length ? items.map((item, index) => <article key={`${item.kind}:${item.topic}`} className={styles.previewItem}>
        <span>{String(index + 1).padStart(2, '0')} / {item.kind === 'brief' ? 'SIGNAL SOURCE DIGEST' : 'OFROOT INSIGHTS'}</span>
        <h3>{item.title}</h3><p>{item.detail}</p>
        <small>{item.kind === 'brief' ? 'Primary source citation + cited brief' : 'OfRoot article + references'} <ArrowUpRight size={13} aria-hidden="true" /></small>
      </article>) : <p className={styles.previewEmpty}>Choose a topic to see how your roundup takes shape.</p>}
    </div>
    <p className={styles.previewNote}>This shows the format, not a scheduled issue. Real editions include up to five new matching reads, source links, and controls to pause or unsubscribe. No matching news means no email.</p>
  </section>;
}
