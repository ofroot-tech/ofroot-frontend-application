import type { Metadata } from 'next';
import Link from 'next/link';
import { CANONICAL_SITE_URL } from '@/app/config/site';
import { authoredArticleSchema } from '@/app/lib/reading-schema';
import { INBOUND_EMAIL_GUIDE, SIGNAL_NOVEMBER_26 as issue } from '@/app/lib/signal-weekly-20261126';
import styles from '@/components/editorial/Reading.module.css';
import JsonLd from '@/components/seo/JsonLd';

const title = issue.title + ' | Signal, November 26, 2026';
export const metadata: Metadata = {
  title,
  description: issue.description,
  alternates: { canonical: issue.href },
  openGraph: {
    type: 'article',
    title,
    description: issue.description,
    url: CANONICAL_SITE_URL + issue.href,
    publishedTime: issue.publishedAt,
  },
};

export default function SignalNovember26IssuePage() {
  const schema = authoredArticleSchema({
    type: 'NewsArticle',
    path: issue.href,
    title: issue.title,
    description: issue.description,
    publishedAt: issue.publishedAt,
    section: 'Technology news',
    parent: { name: 'Signal', path: '/news' },
    sources: issue.notes.map(note => note.source),
  });

  return (
    <main id="main-content" className={styles.page}>
      <JsonLd data={schema} />
      <article className={styles.article}>
        <nav aria-label="Breadcrumb"><Link href="/news" className={styles.link}>← Signal</Link></nav>
        <header>
          <p className={styles.date}>OfRoot Technology Editorial Team · <time dateTime={issue.publishedAt}>November 26, 2026</time></p>
          <h1>{issue.title}</h1>
          <p className={styles.intro}>{issue.intro}</p>
        </header>
        {issue.notes.map(note => (
          <section key={note.id} aria-labelledby={note.id}>
            <h2 id={note.id}>{note.title}</h2>
            <p>{note.summary}</p>
            <a className={styles.link} href={note.source.href}>{note.source.label}</a>
          </section>
        ))}
        <section aria-labelledby="from-ofroot">
          <h2 id="from-ofroot">A review step for inbox automation</h2>
          <p>{INBOUND_EMAIL_GUIDE.summary}</p>
          <Link href={INBOUND_EMAIL_GUIDE.href} className={styles.link}>Read the OfRoot guide →</Link>
        </section>
      </article>
    </main>
  );
}
