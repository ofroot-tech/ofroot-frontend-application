import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, AudioLines, Search } from 'lucide-react';
import { getNewsSnapshot } from '@/app/lib/news';
import { getBriefCollection } from '@/app/lib/signal-briefs';
import MotionText from '@/components/growth/MotionText';
import SignalHeader from '../SignalHeader';
import { formatPublished, topics } from '../presentation';
import news from '../news.module.css';
import styles from './briefs.module.css';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;
export const metadata: Metadata = {
  title: 'Signal Briefs — Context With a Source',
  description: 'Short, cited technology digests from approved research metadata and public agency records. Clear sources, visible scope, and practical OfRoot perspective.',
  alternates: { canonical: '/news/briefs' },
};

/** This collection publishes only briefs with retrieved primary evidence.
 * Headlines without enough evidence remain in the discovery feed, not here. */
export default async function BriefsPage({ searchParams }: { searchParams: Promise<{ topic?: string; q?: string }> }) {
  const params = await searchParams;
  const topic = topics.find(item => item.id === params.topic);
  const query = typeof params.q === 'string' ? params.q.slice(0, 120).trim() : '';
  const snapshot = await getNewsSnapshot();
  const articles = snapshot.articles.filter(article => (!topic || article.category === topic.id) && (!query || article.title.toLowerCase().includes(query.toLowerCase())));
  const briefs = await getBriefCollection(articles);
  return <main id="main-content" className={news.news}><div className={news.container}>
    <SignalHeader current="briefs" />
    <header className={styles.intro}><p className={news.eyebrow}><AudioLines size={18} aria-hidden="true" /> SIGNAL / BRIEFS</p><h1><MotionText trigger="load">Go beyond the headline.<br />Keep the source in view.</MotionText></h1><div className={styles.introBottom}><p>Short, cited digests of research and agency records, with a separate OfRoot perspective. Built for a clear first read and a direct path to the evidence.</p><Link href="/news">Explore the news feed <ArrowUpRight size={17} aria-hidden="true" /></Link></div></header>
    <section className={styles.collection} aria-labelledby="briefs-heading">
      <div className={styles.toolbar}><div><p className={news.eyebrow}>A SOURCE BEHIND EVERY BRIEF</p><h2 id="briefs-heading">{topic ? topic.label : 'The latest briefs'}<span>{briefs.length} in this view</span></h2></div><form action="/news/briefs" className={styles.search}><Search size={17} aria-hidden="true" />{topic && <input type="hidden" name="topic" value={topic.id} />}<input type="search" name="q" aria-label="Search Signal briefs" maxLength={120} defaultValue={query} placeholder="Search brief headlines" /><button type="submit" aria-label="Search briefs"><ArrowRight size={18} /></button></form></div>
      <nav className={styles.filters} aria-label="Brief topics"><Link href="/news/briefs" aria-current={!topic ? 'page' : undefined}>All briefs</Link>{topics.map(item => <Link key={item.id} href={`/news/briefs?topic=${item.id}`} aria-current={topic?.id === item.id ? 'page' : undefined}>{item.label}</Link>)}</nav>
      {briefs.length ? <div className={styles.grid}>{briefs.map(({ article, brief }, index) => <article key={article.id} className={styles.card}><div className={styles.cardTop}><span>{topics.find(item => item.id === article.category)?.short} / SOURCE DIGEST</span><AudioLines size={20} aria-hidden="true" /></div><h3><Link href={`/news/brief/${article.id}`}>{article.title}</Link></h3><p className={styles.scope}>{brief.evidence?.scope}</p><div className={styles.cardBottom}><span>{brief.evidence?.publisher}<br /><time dateTime={brief.generatedAt}>Brief prepared {formatPublished(brief.generatedAt)}</time></span><Link href={`/news/brief/${article.id}`} aria-label={`Read Signal brief for ${article.title}`}><span>Read brief</span><ArrowUpRight size={19} aria-hidden="true" /></Link></div><span className={styles.number} aria-hidden="true">0{index + 1}</span></article>)}</div> : <div className={styles.empty}><AudioLines size={28} aria-hidden="true" /><h3>{query ? 'No briefs match that search.' : 'A sourced brief starts with evidence.'}</h3><p>{query ? 'Try another headline or browse all topics.' : 'There is no ready primary-source digest in this selection. We keep the original reporting in the news feed rather than filling the gap with an unsupported summary.'}</p><Link href="/news">Browse original news references <ArrowRight size={17} /></Link></div>}
      <p className={styles.note}>This collection shows the latest available primary-source digests in the current index. The Signal mark on any news reference opens its brief or explains the evidence gap. Digests are assembled automatically from approved records; they are not original reporting or full-paper reviews. <Link href="/news/methodology#briefs">How briefs are made →</Link></p>
    </section>
    <section className={styles.insights}><div><p className={news.eyebrow}>MORE FROM OFROOT</p><h2>A deeper look at<br />the work behind the tools.</h2><p>Explore OfRoot-authored guides on practical AI, connected systems, and the decisions behind useful software.</p></div><Link href="/insights" className={news.primary}>Read OfRoot Insights <ArrowUpRight size={18} /></Link></section>
  </div></main>;
}
