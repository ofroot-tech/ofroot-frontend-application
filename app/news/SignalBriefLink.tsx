import Link from 'next/link';
import { AudioLines } from 'lucide-react';
import styles from './news.module.css';

/** The existing Signal mark is a reading action, with a full accessible name
 * even when its compact wordmark is the only visible label. */
export default function SignalBriefLink({ id, title }: { id: string; title: string }) {
  return <Link href={`/news/brief/${id}`} className={styles.signalBriefLink} aria-label={`Read Signal brief for ${title}`} title="Read Signal brief">
    <AudioLines size={20} strokeWidth={1.5} aria-hidden="true" /><strong aria-hidden="true">Signal</strong>
  </Link>;
}
