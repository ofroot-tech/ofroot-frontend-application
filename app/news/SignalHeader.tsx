import Link from 'next/link';
import { ArrowUpRight, AudioLines } from 'lucide-react';
import styles from './news.module.css';

export default function SignalHeader({ current = 'news' }: { current?: 'news' | 'sources' | 'methodology' }) {
  // A publication bar sits below the shared OfRoot navigation, with the same
  // typography and ruled structure as the rest of the public site.
  return <div className={styles.masthead}>
    <Link href="/news" className={styles.wordmark} aria-label="Signal by OfRoot home"><AudioLines size={23} strokeWidth={1.5} aria-hidden="true" /><strong>Signal</strong><span className={styles.byline}>OFROOT / NEWS</span></Link>
    <nav aria-label="News navigation"><Link href="/news" aria-current={current === 'news' ? 'page' : undefined}>The latest</Link><Link href="/news/sources" aria-current={current === 'sources' ? 'page' : undefined}>Our sources</Link><Link href="/news/methodology" aria-current={current === 'methodology' ? 'page' : undefined}>How it works <ArrowUpRight size={14} /></Link></nav>
  </div>;
}
