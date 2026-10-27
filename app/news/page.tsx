import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getNewsSnapshot } from '@/app/lib/news';
import Newsroom from './Newsroom';
import styles from './news.module.css';

export const metadata: Metadata = {
  title: 'Signal — Technology News',
  description: 'A source-linked view of AI, integrations, healthcare startups, technology policy, and cybersecurity. Discover the latest, then read it at the source.',
  alternates: { canonical: '/news' },
};
export const dynamic = 'force-dynamic';

async function NewsContent() {
  const snapshot = await getNewsSnapshot();
  return <Newsroom initialSnapshot={snapshot} />;
}

export default function NewsPage() {
  return <Suspense fallback={<main id="main-content" className={styles.loading}><span className={styles.eyebrow}>OFROOT / SIGNAL</span><h1>Finding the latest signals.</h1><p>Checking the original sources…</p></main>}><NewsContent /></Suspense>;
}
