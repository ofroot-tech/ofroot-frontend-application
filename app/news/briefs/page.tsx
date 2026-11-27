import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, AudioLines, Search } from 'lucide-react';
import { formatNewsTitle } from '@/app/lib/news/display-title';
import { getNewsSnapshot } from '@/app/lib/news';
import { getBriefCollection } from '@/app/lib/signal-briefs';
import MotionText from '@/components/growth/MotionText';
import SignalHeader from '../SignalHeader';
import SubscribeCTA from '../subscriptions/SubscribeCTA';
import { formatPublished, topics } from '../presentation';
import news from '../news.module.css';
import styles from './briefs.module.css';
import JsonLd from '@/components/seo/JsonLd';
import { readingCollection } from '@/app/lib/reading-schema';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;
export const metadata: Metadata = {
  title: 'Signal Briefs',
  description: 'Short, cited notes from research abstracts and public agency records.',
  alternates: { canonical: '/news/briefs' },
};

/** This collection publishes only briefs with retrieved primary evidence.
 * Headlines without enough evidence remain in the discovery feed, not here. */
export default async function BriefsPage({ searchParams }: { searchParams: Promise<{ topic?: string; q?: string }> }) {
  const params = await searchParams;
  const topic = topics.find(item => item.id === params.topic);
  const query = typeof params.q === 'string' ? params.q.slice(0, 120).trim() : '';
  const snapshot = await getNewsSnapshot();
  const articles = snapshot.articles.filter(article => (!topic || article.category === topic.id) && (!query || [article.title, formatNewsTitle(article)].some(title => title.toLowerCase().includes(query.toLowerCase()))));
  const briefs = await getBriefCollection(articles);
  return <main id="main-content" className={news.news}><JsonLd data={readingCollection('/news/briefs', 'Signal briefs', briefs.map(({article})=>({title:formatNewsTitle(article),path:`/news/brief/${article.id}`})))}/><div className={news.container}>
    <SignalHeader current="briefs" />
    <header className={styles.intro}><h1><MotionText trigger="load">Signal briefs</MotionText></h1><div className={styles.introBottom}><p>Read the main point from a research abstract or agency record, then follow the link to the source.</p><Link href="/news">Explore the news feed <ArrowUpRight size={17} aria-hidden="true" /></Link></div></header>
    <section className={styles.collection} aria-labelledby="briefs-heading">
      <div className={styles.toolbar}><div><h2 id="briefs-heading">{topic ? topic.label : 'The latest briefs'}<span>{briefs.length} in this view</span></h2></div><form action="/news/briefs" className={styles.search}><Search size={17} aria-hidden="true" />{topic && <input type="hidden" name="topic" value={topic.id} />}<input type="search" name="q" aria-label="Search Signal briefs" maxLength={120} defaultValue={query} placeholder="Search brief headlines" /><button type="submit" aria-label="Search briefs"><ArrowRight size={18} /></button></form></div>
      <nav className={styles.filters} aria-label="Brief topics"><Link href="/news/briefs" aria-current={!topic ? 'page' : undefined}>All briefs</Link>{topics.map(item => <Link key={item.id} href={`/news/briefs?topic=${item.id}`} aria-current={topic?.id === item.id ? 'page' : undefined}>{item.label}</Link>)}</nav>
      {briefs.length ? <div className={styles.grid}>{briefs.map(({ article, brief }) => <article key={article.id} className={styles.card}><div className={styles.cardTop}><span>{topics.find(item => item.id === article.category)?.short}</span><AudioLines size={20} aria-hidden="true" /></div><h3><Link href={`/news/brief/${article.id}`}>{formatNewsTitle(article)}</Link></h3><p className={styles.scope}><span>{brief.summary?.label}</span>{brief.summary?.text}</p><div className={styles.cardBottom}><span>{brief.evidence?.publisher}<br /><time dateTime={brief.generatedAt}>Brief prepared {formatPublished(brief.generatedAt)}</time></span><Link href={`/news/brief/${article.id}`} aria-label={`Read Signal brief for ${formatNewsTitle(article)}`}><span>Read brief</span><ArrowUpRight size={19} aria-hidden="true" /></Link></div></article>)}</div> : <div className={styles.empty}><AudioLines size={28} aria-hidden="true" /><h3>{query ? 'No briefs match that search.' : 'No source briefs are available.'}</h3><p>{query ? 'Try another headline or browse all topics.' : 'Find original articles and source links in the news feed.'}</p><Link href="/news">Browse original news references <ArrowRight size={17} /></Link></div>}
      <p className={styles.note}>Briefs link to the approved record they use. The news feed also lists articles available directly from their publishers. <Link href="/news/methodology#briefs">How briefs are made →</Link></p>
    </section>
    <section className={styles.insights}><div><p className={news.eyebrow}>MORE FROM OFROOT</p><h2>A deeper look at<br />the work behind the tools.</h2><p>Explore OfRoot-authored guides on practical AI, connected systems, and the decisions behind useful software.</p></div><Link href="/insights" className={news.primary}>Read OfRoot Insights <ArrowUpRight size={18} /></Link></section>
    <SubscribeCTA topic={topic?.id} />
  </div></main>;
}
