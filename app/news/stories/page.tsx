import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, GitBranch } from 'lucide-react';
import { getNewsSnapshot } from '@/app/lib/news';
import { groupStories } from '@/app/lib/news/editorial';
import SignalHeader from '../SignalHeader';
import MotionText from '@/components/growth/MotionText';
import { formatPublished } from '../presentation';
import news from '../news.module.css';
import styles from './stories.module.css';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Related Coverage — Signal', description: 'Connected technology references, source attribution, and publication timelines from Signal by OfRoot.', alternates: { canonical: '/news/stories' } };

/** Only genuine matches appear here. An empty view is preferable to joining
 * unrelated headlines just because they share a company name or news beat. */
export default async function StoriesPage() {
  const snapshot = await getNewsSnapshot();
  const stories = groupStories(snapshot.articles, snapshot.sources);
  return <main id="main-content" className={news.news}><div className={news.container}>
    <SignalHeader current="stories" />
    <header className={news.subpageIntro}><p className={news.eyebrow}><GitBranch size={17} aria-hidden="true" /> SIGNAL / RELATED COVERAGE</p><h1><MotionText trigger="load">Connect the developments.<br />Follow the sources.</MotionText></h1><p>Related references in one reading trail, with publication dates and a direct path to every original.</p></header>
    <p className={styles.note}>Groups use conservative automated matching. Reference counts describe coverage, not independent confirmation. <Link href="/news/methodology#selection">How matching works →</Link></p>
    <section className={styles.grid} aria-label="Related story groups">{stories.length ? stories.map(story => <article key={story.id} className={styles.card}>
      <p className={news.eyebrow}><GitBranch size={15} aria-hidden="true" /> {story.articles.length} REFERENCES</p><h2><Link href={`/news/story/${story.id}`}>{story.title}</Link></h2><p>{story.sourceCount} {story.sourceCount === 1 ? 'publishing organization' : 'publishing organizations'}{story.updatedAt ? ` · ${formatPublished(story.updatedAt)}` : ''}</p><Link href={`/news/story/${story.id}`} className={styles.action}>Follow the timeline <ArrowRight size={17} aria-hidden="true" /></Link>
    </article>) : <div className={styles.empty}><GitBranch size={27} aria-hidden="true" /><h2>The next connection starts with a clear match.</h2><p>No closely matching references are available in the current index. Explore the latest headlines while the sources update.</p><Link href="/news">Browse all updates <ArrowRight size={17} aria-hidden="true" /></Link></div>}</section>
  </div></main>;
}
