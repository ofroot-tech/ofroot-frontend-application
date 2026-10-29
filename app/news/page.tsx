import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getNewsSnapshot } from '@/app/lib/news';
import { getBriefAvailability, getBriefCollection } from '@/app/lib/signal-briefs';
import { selectHighlights } from '@/app/lib/news/editorial';
import Newsroom from './Newsroom';
import styles from './news.module.css';

export const metadata: Metadata = {
  title: 'Signal — Technology News',
  description: 'A source-linked view of AI, integrations, healthcare startups, technology policy, and cybersecurity. Discover the latest, then read it at the source.',
  alternates: { canonical: '/news' },
};
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

async function NewsContent() {
  const snapshot = await getNewsSnapshot();
  // Prepare only a bounded selection; the rest uses one cached-status read.
  // A source reference must never advertise a brief that has not been retrieved.
  await getBriefCollection(selectHighlights(snapshot.articles, snapshot.sources, Date.parse(snapshot.checkedAt)), 3);
  const briefAvailability = await getBriefAvailability(snapshot.articles);
  return <Newsroom initialSnapshot={{ ...snapshot, briefAvailability }} />;
}

export default function NewsPage() {
  return <Suspense fallback={<main id="main-content" className={styles.loading}><span className={styles.eyebrow}>OFROOT / SIGNAL</span><h1>Finding the latest signals.</h1><p>Checking the original sources…</p></main>}><NewsContent /></Suspense>;
}
