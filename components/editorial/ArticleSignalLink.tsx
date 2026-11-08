import Link from 'next/link';
import manifest from '@/content/signal-pilot.json';
import { checkedPilot, playableAudio } from '@/app/lib/signal-pilot';
import styles from './Reading.module.css';

export default function ArticleSignalLink({ sourcePath }: { sourcePath:string }) {
  const article = checkedPilot(manifest.articles).find(item => item.sourcePath === sourcePath);
  if (!article) return null;
  return <aside className={styles.audio} aria-label="Short version of this article">
    <p className={styles.note}>Prefer the short version?</p>
    <Link className={styles.link} href={`/news/from-ofroot/${article.slug}`}>
      {playableAudio(article) ? 'Read or listen to this Signal →' : 'Read this article in Signal →'}
    </Link>
  </aside>;
}
