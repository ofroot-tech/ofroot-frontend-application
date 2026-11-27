import type { Metadata } from 'next';
import Link from 'next/link';
import { CANONICAL_SITE_URL } from '@/app/config/site';
import { authoredArticleSchema } from '@/app/lib/reading-schema';
import { INBOUND_EMAIL_GUIDE as guide, SIGNAL_NOVEMBER_26 } from '@/app/lib/signal-weekly-20261126';
import ArticleSignalLink from '@/components/editorial/ArticleSignalLink';
import styles from '@/components/editorial/Reading.module.css';
import JsonLd from '@/components/seo/JsonLd';

export const metadata: Metadata = {
  title: guide.title,
  description: guide.description,
  alternates: { canonical: guide.href },
  openGraph: {
    type: 'article',
    title: guide.title,
    description: guide.description,
    url: CANONICAL_SITE_URL + guide.href,
    publishedTime: guide.publishedAt,
  },
};

export default function InboundEmailGuidePage() {
  const schema = authoredArticleSchema({
    type: 'BlogPosting',
    path: guide.href,
    title: guide.title,
    description: guide.description,
    publishedAt: guide.publishedAt,
    section: 'Workflow automation',
    parent: { name: 'OfRoot blog', path: '/blog' },
    sources: [],
  });

  return (
    <main id="main-content" className={styles.page}>
      <JsonLd data={schema} />
      <article className={styles.article}>
        <nav aria-label="Breadcrumb"><Link href="/blog" className={styles.link}>← OfRoot blog</Link></nav>
        <header>
          <p className={styles.date}>OfRoot Technology Editorial Team · <time dateTime={guide.publishedAt}>November 26, 2026</time></p>
          <h1>{guide.title}</h1>
          <p className={styles.intro}>A shared inbox can create extra work when every new message becomes a task in your customer relationship management (CRM) system. A quote request might need an owner and a deadline. A vendor promotion can stay in the inbox. Start with one inbox and give a reviewer a short list of proposed tasks.</p>
        </header>

        <section aria-labelledby="approval-steps">
          <h2 id="approval-steps">Set up the approval step</h2>
          <ol className="space-y-4">
            {guide.steps.map(step => <li key={step.title}><strong>{step.title}</strong> {step.detail}</li>)}
          </ol>
        </section>

        <section aria-labelledby="local-checks">
          <h2 id="local-checks">What we tested</h2>
          <p>We used Python’s email parser and an in-memory SQLite database to stand in for the review queue and CRM. The mailbox IDs and four messages were synthetic. Six checks passed.</p>
          <table className="!table w-full text-left" aria-labelledby="local-checks">
            <thead><tr><th scope="col">Check</th><th scope="col">What happened</th></tr></thead>
            <tbody>
              {guide.checks.map(check => <tr key={check.action}><th scope="row" className="font-medium">{check.action}</th><td>{check.result}</td></tr>)}
            </tbody>
          </table>
          <p>The test exercised the approval rules and the local write. To check a real setup, repeat the same cases in your CRM’s test account, including a request that succeeds on the CRM side but returns a timeout to your workflow. Then measure how many drafts the reviewer accepts, how long review takes, and whether any duplicate tasks appear.</p>
        </section>

        <ArticleSignalLink sourcePath={guide.href} />
        <Link href={SIGNAL_NOVEMBER_26.href} className={styles.link}>Read the November 26 Signal issue →</Link>
      </article>
    </main>
  );
}
