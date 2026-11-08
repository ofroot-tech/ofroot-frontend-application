import Link from 'next/link';
import { AudioLines } from 'lucide-react';
import styles from './news.module.css';

export default function SignalHeader({current='news'}:{current?:'news'|'briefs'|'stories'|'sources'|'methodology'|'subscribe'}) {
  return <div className={styles.masthead}>
    <Link href="/news" className={styles.wordmark} aria-label="Signal by OfRoot home"><AudioLines size={23} strokeWidth={1.5} aria-hidden="true"/><strong>Signal</strong><span className={styles.byline}>OFROOT / NEWS</span></Link>
    <nav aria-label="News navigation">
      <Link href="/news" aria-current={current==='news'?'page':undefined}>The latest</Link>
      <Link href="/news/briefs" aria-current={current==='briefs'?'page':undefined}>Signal briefs</Link>
      <Link href="/news/from-ofroot">Our articles</Link>
      <details className={styles.moreNav}><summary>More</summary><div>
        <Link href="/news/stories" aria-current={current==='stories'?'page':undefined}>Related coverage</Link>
        <Link href="/news/sources" aria-current={current==='sources'?'page':undefined}>Our sources</Link>
        <Link href="/news/methodology" aria-current={current==='methodology'?'page':undefined}>How it works</Link>
        <Link href="/news/subscribe" aria-current={current==='subscribe'?'page':undefined}>Subscribe</Link>
      </div></details>
    </nav>
  </div>;
}
