import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowUpRight, AudioLines, RefreshCw } from 'lucide-react';
import { signalOperatorAccess } from '@/app/lib/signal-subscriptions/operator-access';
import { getSignalOperations } from '@/app/lib/signal-subscriptions/operations';
import styles from './signal-operations.module.css';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function time(value: string | null) {
  return value ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: 'America/Chicago', timeZoneName: 'short' }).format(new Date(value)) : 'Not recorded';
}

/** The owner sees a read-only control room. Retries, recipient changes, and
 * publishing actions remain outside this screen's permission surface. */
export default async function SignalOperationsPage() {
  const access = await signalOperatorAccess();
  if (access === 401) redirect('/auth/login?next=%2Fdashboard%2Fowner%2Fsignal');
  if (access !== 200) redirect('/dashboard/overview');
  const state = await getSignalOperations();
  const delivery = state.delivery;
  const metric = (value: number | null) => value === null ? 'Unavailable' : value.toLocaleString('en-US');
  return <div className={styles.desk}>
    <header className={styles.header}><div><p><AudioLines size={18} aria-hidden="true" /> SIGNAL / OPERATIONS</p><h1>A clear view of the publication.</h1><span>Source health, evidence coverage, and delivery. Checked {time(state.checkedAt)}.</span></div><a href="/dashboard/owner/signal" className={styles.refresh}><RefreshCw size={15} aria-hidden="true" />Refresh status</a></header>
    <div className={styles.metrics}>
      {[['Indexed references', state.news.articles], ['Active readers', delivery.active], ['Readers due now', delivery.due], ['Attempts left today', delivery.remainingToday]].map(([label, value]) => <section key={String(label)}><p>{label}</p><strong>{metric(value as number | null)}</strong></section>)}
    </div>
    <section className={styles.panel}><div className={styles.sectionTitle}><div><p>01 / THE SOURCE NETWORK</p><h2>Freshness & availability.</h2></div><Link href="/news/sources">Public source directory <ArrowUpRight size={15} /></Link></div><p className={styles.note}>Index state: {state.news.status}. Last successful refresh: {time(state.news.lastSuccessfulAt)}.</p><div className={styles.tableWrap}><table><thead><tr><th>Source</th><th>Latest check</th><th>Last successful check</th></tr></thead><tbody>{state.news.feeds.map(feed => <tr key={feed.id}><th scope="row">{feed.name}</th><td><span data-state={feed.status}>{feed.status}</span><small>{time(feed.checkedAt)}</small></td><td>{time(feed.lastSuccessfulAt)}</td></tr>)}</tbody></table></div></section>
    <section className={styles.panel}><div className={styles.sectionTitle}><div><p>02 / EMAIL DELIVERY</p><h2>Queue & delivery signals.</h2></div></div>{delivery.message && <p className={styles.notice}>{delivery.message}</p>}<div className={styles.deliveryGrid}>{[
      ['Provider accepted · 7 days', delivery.accepted7d], ['Empty issues created · 7 days', delivery.empty7d], ['Uncertain attempts · unresolved', delivery.uncertain], ['Expired preparation leases', delivery.preparingExpired], ['Expired sending leases', delivery.sendingExpired], ['Applied suppression events · 7 days', delivery.suppressed7d],
    ].map(([label, value]) => <div key={String(label)}><span>{label}</span><strong>{metric(value as number | null)}</strong></div>)}</div><p className={styles.note}>Provider acceptance is not proof of inbox delivery. Uncertain attempts require inspection before retrying. Due readers are waiting for a job; this count alone does not mean a failed send.</p><div className={styles.limitLine}><span>Digest budget: {state.limits.daily}/UTC day</span><span>Batch ceiling: {state.limits.batch}</span><span>Transactional budget: {state.limits.transactionalDaily}/UTC day</span></div><p className={styles.note}>Configured safeguards stay unchanged. {metric(delivery.attemptsToday)} digest attempts recorded today.</p></section>
    <section className={styles.panel}><div className={styles.sectionTitle}><div><p>03 / EDITORIAL REVIEW</p><h2>Evidence before a brief.</h2></div><Link href="/news/briefs">Browse ready briefs <ArrowUpRight size={15} /></Link></div><div className={styles.limitLine}><span>Cached ready: {state.briefs.available ? state.briefs.ready : 'Unavailable'}</span><span>{state.briefs.unsupported} source references</span><span>Cached unavailable: {state.briefs.available ? state.briefs.unavailable : 'Unavailable'}</span><span>{state.briefs.unchecked} {state.briefs.available ? 'unchecked or expired' : 'awaiting cache status'}</span></div>{!state.briefs.available && <p className={styles.notice}>The brief cache could not be read. The list below describes source eligibility; it does not assume that evidence was retrieved.</p>}<p className={styles.note}>Current-index coverage only. A cached ready brief is prepared automatically; this is not a claim of human editorial review.</p><div className={styles.reviewList}>{state.briefs.review.length ? state.briefs.review.map(item => <article key={item.id}><div><h3><Link href={`/news/brief/${item.id}`}>{item.title}</Link></h3><p>{item.reason}</p></div><Link href={`/news/brief/${item.id}`} aria-label={`Inspect sources for ${item.title}`}><ArrowUpRight size={19} /></Link></article>) : <p className={styles.note}>No evidence gaps in the current view.</p>}</div></section>
    <section className={styles.panel}><div className={styles.sectionTitle}><div><p>04 / CONFIGURATION</p><h2>Delivery prerequisites.</h2></div></div><ul className={styles.configuration}>{Object.entries(state.configured).map(([label, configured]) => <li key={label}><span>{label === 'postalAddress' ? 'Public postal address' : label}</span><strong data-state={configured ? 'ok' : 'error'}>{configured ? 'Configured' : 'Missing'}</strong></li>)}</ul><p className={styles.note}>Presence checks only. No credential values or recipient details are displayed. This screen never sends email.</p></section>
  </div>;
}
