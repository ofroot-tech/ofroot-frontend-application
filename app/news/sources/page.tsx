import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight, CheckCircle2, Clock3 } from 'lucide-react';
import MotionText from '@/components/growth/MotionText';
import { getNewsSnapshot } from '@/app/lib/news';
import SignalHeader from '../SignalHeader';
import { formatPublished, topics } from '../presentation';
import styles from '../news.module.css';

export const metadata: Metadata = { title: 'Signal — Sources & Coverage', description: 'See the original sources, reuse basis, coverage, and latest connection status behind OfRoot Signal.', alternates: { canonical: '/news/sources' } };
export const dynamic = 'force-dynamic';

/** Keep provenance and the last observed feed status beside every source. */
export default async function SourcesPage() {
  const snapshot = await getNewsSnapshot();
  return <main id="main-content" className={styles.news}><div className={styles.container}><SignalHeader current="sources" /><div className={styles.subpageIntro}><p className={styles.eyebrow}>TRANSPARENCY IS PART OF THE PRODUCT</p><h1><MotionText trigger="load">Good news deserves<br />a good source.</MotionText></h1><p>Every headline has a home. These are the sources behind Signal, the basis for displaying their metadata, and the result of our latest check. Approval here means our source review; it does not imply a publisher partnership or endorsement.</p></div>
    <div className={styles.coverageNote}><h2>Coverage is growing, with permission.</h2><p>AI and integrations combine research metadata with reporting from approved feeds. Healthcare includes FDA releases and TechCrunch’s biotech and health reporting. Research is not necessarily peer reviewed. Source type and attribution stay visible beside each headline.</p></div>
    <div className={styles.sourceGrid}>{snapshot.sources.map(source => {
      const health = snapshot.sourceHealth.find(item => item.sourceId === source.id);
      const ok = source.enabled && health?.status === 'ok';
      return <article key={source.id} className={styles.sourceCard}><div className={styles.sourceCardTop}><span>{source.enabled ? <CheckCircle2 size={13} /> : <Clock3 size={13} />}{source.enabled ? 'Approved metadata source' : 'Pending activation'}</span><span><i className={ok ? styles.greenDot : styles.amberDot} />{ok ? 'Available at last check' : source.enabled ? 'Unavailable at last check' : 'Not ingested'}</span></div><h2>{source.name}</h2><p>{source.rights.basis}</p><dl><dt>Coverage</dt><dd>{source.categories.map(category => topics.find(topic => topic.id === category)?.label).join(' · ')}</dd><dt>Stored</dt><dd>Headline, source link, date, category, item type; author when supplied. No article body or images.</dd><dt>Last check</dt><dd>{health?.checkedAt ? formatPublished(health.checkedAt) : 'Not checked'}</dd><dt>Last success</dt><dd>{health?.lastSuccessfulAt ? new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Chicago' }).format(new Date(health.lastSuccessfulAt)) + ' CT' : 'No successful fetch recorded'}</dd>{health?.message && <><dt>Status</dt><dd>{health.message}</dd></>}</dl><div className={styles.sourceCardLinks}><a href={source.homepage} target="_blank" rel="noopener noreferrer">Visit original source <ArrowUpRight size={13} /></a><a href={source.rights.termsUrl} target="_blank" rel="noopener noreferrer">Reuse basis <ArrowUpRight size={13} /></a></div></article>;
    })}</div>
    <div className={styles.coverageNote}><h2>{snapshot.storage === 'postgres' ? 'A persistent index is connected.' : 'This preview uses a temporary index.'}</h2><p>{snapshot.storage === 'postgres' ? 'Permitted metadata is archived in the configured database. Individual source failures retain the last available items with their original publication dates.' : 'The current server can cache metadata, but the cache resets when that server restarts. A configured Postgres database and production scheduler are needed for a lasting, unattended news repository.'} {snapshot.storageMessage}</p></div>
    <div className={styles.newsFooter}><Link href="/news"><ArrowLeft size={13} /> Back to the latest</Link><Link href="/news/methodology">How the index works <ArrowUpRight size={13} /></Link></div>
  </div></main>;
}
