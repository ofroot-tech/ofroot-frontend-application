import type { Metadata } from 'next';
import Link from 'next/link';
import { cache } from 'react';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, ArrowUpRight, GitBranch } from 'lucide-react';
import { getNewsSnapshot } from '@/app/lib/news';
import { groupStories } from '@/app/lib/news/editorial';
import { getBriefArticle, getBriefAvailability } from '@/app/lib/signal-briefs';
import SignalHeader from '../../SignalHeader';
import SignalBriefLink from '../../SignalBriefLink';
import SubscribeCTA from '../../subscriptions/SubscribeCTA';
import { formatPublished, topics } from '../../presentation';
import news from '../../news.module.css';
import styles from './story.module.css';

export const dynamic = 'force-dynamic';

/** The anchor reference keeps the URL useful after it leaves the latest window.
 * Every archive read still applies current source and suppression policy. */
const resolveStory = cache(async (id: string) => {
  if (!/^[a-f0-9]{20}$/.test(id)) return null;
  const snapshot = await getNewsSnapshot();
  const groups = groupStories(snapshot.articles, snapshot.sources);
  const story = groups.find(item => item.id === id || item.articles.some(article => article.id === id));
  if (story) return { snapshot, story };
  const article = await getBriefArticle(id);
  if (!article) return null;
  return { snapshot, story: { id, title: article.title, articles: [article], updatedAt: article.publishedAt, sourceCount: 1 } };
});

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const result = await resolveStory(id);
  return {
    title: result ? `Related coverage — ${result.story.title}` : 'Coverage not found',
    description: 'Follow related technology references, publication dates, and the original sources in Signal.',
    alternates: { canonical: `/news/story/${id}` },
    // A source-link timeline helps navigation; substantive standalone briefs
    // remain the preferred search destination for original OfRoot context.
    robots: { index: false, follow: true },
  };
}

export default async function StoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await resolveStory(id);
  if (!result) notFound();
  const { story, snapshot } = result;
  const availability = await getBriefAvailability(story.articles);
  const sourceMap = new Map(snapshot.sources.map(source => [source.id, source]));
  const timeline = [...story.articles].sort((a, b) => (b.publishedAt || '').localeCompare(a.publishedAt || ''));
  return <main id="main-content" className={news.news}><div className={news.container}>
    <SignalHeader current="stories" />
    <header className={styles.intro}>
      <Link href="/news/stories" className={styles.back}><ArrowLeft size={14} aria-hidden="true" /> Related coverage</Link>
      <p className={news.eyebrow}><GitBranch size={17} aria-hidden="true" /> SIGNAL / CONNECTED REFERENCES</p>
      <h1>{story.title}</h1>
      <div className={styles.meta}><span>{story.articles.length} {story.articles.length === 1 ? 'reference' : 'references'}</span><span>{story.sourceCount} {story.sourceCount === 1 ? 'publishing organization' : 'publishing organizations'}</span>{story.updatedAt && <span>Latest publication {formatPublished(story.updatedAt)}</span>}</div>
      <p className={styles.explanation}>A reading trail through related coverage. Each headline belongs to its publisher; follow the original to assess its claims.</p>
    </header>
    <div className={styles.layout}>
      <section aria-labelledby="timeline-heading" className={styles.timeline}>
        <p className={news.eyebrow}>PUBLICATION TIMELINE / NEWEST FIRST</p><h2 id="timeline-heading">Follow the coverage.</h2>
        {timeline.map((article, index) => <article key={article.id} className={styles.entry}>
          <span className={styles.number} aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
          <div><div className={styles.entryMeta}><span>{sourceMap.get(article.sourceId)?.name || 'Original source'}</span><time dateTime={article.publishedAt || undefined}>{formatPublished(article.publishedAt)}</time></div>
            <h3><a href={article.url} target="_blank" rel="noopener noreferrer">{article.title}</a></h3>
            <p>{topics.find(topic => topic.id === article.category)?.label}{article.author ? ` · By ${article.author}` : ''}</p>
            <div className={styles.actions}><a href={article.url} target="_blank" rel="noopener noreferrer">Read at source <ArrowUpRight size={15} aria-hidden="true" /></a><SignalBriefLink id={article.id} title={article.title} availability={availability[article.id]} /></div>
          </div>
        </article>)}
      </section>
      <aside className={styles.aside}><GitBranch size={23} aria-hidden="true" /><h2>Connected, with care.</h2><p>References are grouped automatically using matching identifiers or strong headline overlap within a bounded time window.</p><p>Several reports may rely on the same announcement. A group is a navigation aid, and does not establish independent confirmation or a complete account.</p><p>The dates shown are source publication dates. A newly indexed reference is not necessarily a new development.</p><Link href="/news/methodology#selection">How matching works <ArrowRight size={15} aria-hidden="true" /></Link><Link href="/news/briefs">Explore prepared briefs <ArrowRight size={15} aria-hidden="true" /></Link></aside>
    </div>
    <SubscribeCTA topic={story.articles[0]?.category} heading="Keep the next development in view." description="Choose your topics and receive a considered daily or weekly roundup, with references included." />
  </div></main>;
}
