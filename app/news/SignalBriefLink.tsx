import Link from 'next/link';
import { AudioLines } from 'lucide-react';
import { briefAction, type BriefAvailability } from '@/app/lib/signal-briefs/availability';
import styles from './news.module.css';
import detail from './signal-link.module.css';

/** The existing Signal mark is a reading action, with a full accessible name
 * even when its compact wordmark is the only visible label. */
export default function SignalBriefLink({ id, title, availability = 'unchecked' }: { id: string; title: string; availability?: BriefAvailability }) {
  const action = briefAction(availability);
  return <Link href={`/news/brief/${id}`} className={`${styles.signalBriefLink} ${detail.link}`} data-availability={availability} aria-label={`${action.description} for ${title}`} title={action.description}>
    <AudioLines size={20} strokeWidth={1.5} aria-hidden="true" /><strong aria-hidden="true">Signal</strong><span className={detail.label} aria-hidden="true">{action.label}</span>
  </Link>;
}
