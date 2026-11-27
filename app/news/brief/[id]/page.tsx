import type { Metadata } from 'next';
import Link from 'next/link';
import { cache } from 'react';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, ArrowUpRight, FileText, Info } from 'lucide-react';
import { getBriefArticle, getBriefForArticle } from '@/app/lib/signal-briefs';
import { NEWS_SOURCES } from '@/app/lib/news/sources';
import SignalHeader from '../../SignalHeader';
import SubscribeCTA from '../../subscriptions/SubscribeCTA';
import { formatPublished, topics } from '../../presentation';
import news from '../../news.module.css';
import styles from './brief.module.css';
import JsonLd from '@/components/seo/JsonLd';
import { signalArticleSchema } from '@/app/lib/reading-schema';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;
type Props = { params: Promise<{ id: string }> };

/** Metadata and the page share one lookup and one evidence check per render.
 * Suppression remains authoritative because the service resolves the reference
 * before returning any cached digest. A known reference can lack a brief. */
const loadBrief = cache(async (id: string) => {
  const article = await getBriefArticle(id);
  return article ? { article, brief: await getBriefForArticle(article) } : null;
});

function checkedDate(value: string) {
  if (!Number.isFinite(Date.parse(value))) return 'Check time unavailable';
  return `${new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Chicago' }).format(new Date(value))} CT`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const result = await loadBrief((await params).id);
  if (!result) return { title: 'Signal brief not found', robots: { index: false, follow: true } };
  const { article, brief } = result;
  const ready = brief.status === 'ready' && !!brief.evidence && !!brief.summary;
  return {
    title: `Signal brief — ${article.title}`,
    description: ready ? brief.summary?.text : 'A Signal reference with a link to the original source.',
    alternates: { canonical: `/news/brief/${article.id}` },
    robots: { index: ready, follow: true },
  };
}

/** Every displayed fact leads back to the primary record. Discovery attribution
 * is kept separate so a publisher headline is never presented as evidence that
 * we read or independently verified that publisher's complete article. */
export default async function SignalBriefPage({ params }: Props) {
  const result = await loadBrief((await params).id);
  if (!result) notFound();
  const { article, brief } = result;
  const publisher = NEWS_SOURCES.find(source => source.id === article.sourceId)?.name || 'Original publisher';
  const topic = topics.find(item => item.id === article.category)?.label || 'Technology';
  const evidence = brief.status === 'ready' ? brief.evidence : undefined;
  const summary = brief.status === 'ready' ? brief.summary : undefined;

  return <main id="main-content" className={`${news.news} ${styles.page}`}>
    {evidence && summary && <JsonLd data={signalArticleSchema({ id:article.id, title:article.title, description:summary.text, generatedAt:brief.generatedAt, sourceUrl:article.url, evidenceUrl:evidence.url, evidencePublisher:evidence.publisher })} />}
    <div className={news.container}>
      <SignalHeader current="briefs" />
      <nav className={styles.breadcrumb} aria-label="Breadcrumb"><Link href="/news">The latest</Link><span aria-hidden="true">/</span><Link href="/news/briefs">Signal briefs</Link><span aria-hidden="true">/</span><span aria-current="page">{topic}</span></nav>
      <header className={styles.header}>
        <p className={styles.kicker}><FileText size={15} aria-hidden="true" />{summary ? 'SIGNAL BRIEF' : 'SOURCE REFERENCE'}</p>
        <h1>{article.title}</h1>
        <div className={styles.metadata}><span>{topic}</span><span>Discovered via {publisher} <a href="#source-1" className={styles.citation} aria-label={`Reference 1: discovery headline from ${publisher}`}>[1]</a></span><span>Published <time dateTime={article.publishedAt || undefined}>{formatPublished(article.publishedAt)}</time></span>{article.author && <span>Original author {article.author}</span>}</div>
        <div className={styles.actions}><a className={news.primary} href={article.url} target="_blank" rel="noopener noreferrer">Read the original <ArrowUpRight size={18} aria-hidden="true" /></a><Link href="/news" className={styles.secondary}><ArrowLeft size={17} aria-hidden="true" />Back to the latest</Link></div>
      </header>

      {evidence && summary && <nav className={styles.readingNav} aria-label="In this brief"><a href="#digest">The short version</a>{evidence.facts.length > 0 && <a href="#facts">Key details</a>}<a href="#references-heading">References <ArrowRight size={14} aria-hidden="true" /></a></nav>}
      {evidence && summary ? <div className={styles.layout}>
        <article className={styles.reading} aria-label="Source summary">
          <section id="digest" className={styles.section} aria-labelledby="digest-heading">
            <h2 id="digest-heading">The short version</h2>
            {summary.kind === 'overview' ? <p className={styles.introduction}>{summary.text} <a href="#source-2" className={styles.citation} aria-label="Reference 2 supporting this summary">[2]</a></p> :
              <div className={styles.excerpt}><p className={styles.excerptLabel}>{summary.label} <a href="#source-2" className={styles.citation} aria-label={`Reference 2: primary record from ${evidence.publisher}`}>[2]</a></p><blockquote><p>{summary.text}</p></blockquote></div>}
          </section>
          {evidence.facts.length > 0 && <section id="facts" className={styles.section} aria-labelledby="facts-heading"><h2 id="facts-heading">Key details</h2><dl className={styles.facts}>{evidence.facts.map((fact, index) => <div key={`${fact.label}:${index}`}><dt>{fact.label}</dt><dd>{fact.value} <a href="#source-2" className={styles.citation} aria-label={`Reference 2 supporting ${fact.label}`}>[2]</a></dd></div>)}</dl></section>}
          {evidence.caveats.length > 0 && <section className={styles.limitations} aria-labelledby="limitations-heading"><Info size={20} aria-hidden="true" /><div><h2 id="limitations-heading">Source limitations</h2><ul>{evidence.caveats.map((caveat, index) => <li key={index}>{caveat}</li>)}</ul></div></section>}
        </article>
        <aside className={styles.provenance} aria-labelledby="provenance-heading"><h2 id="provenance-heading">About the source</h2><dl><div><dt>Evidence scope</dt><dd>{evidence.scope}</dd></div><div><dt>Primary publisher</dt><dd>{evidence.publisher}</dd></div><div><dt>Reuse basis</dt><dd>{evidence.license}</dd></div><div><dt>Primary record checked</dt><dd><time dateTime={evidence.fetchedAt}>{checkedDate(evidence.fetchedAt)}</time></dd></div><div><dt>Digest generated</dt><dd><time dateTime={brief.generatedAt}>{checkedDate(brief.generatedAt)}</time></dd></div></dl><a href={evidence.url} target="_blank" rel="noopener noreferrer" className={styles.railLink}>Review the primary record <ArrowUpRight size={17} aria-hidden="true" /></a><a href={evidence.retrievalUrl} target="_blank" rel="noopener noreferrer" className={styles.railLink}>View retrieved metadata <ArrowUpRight size={17} aria-hidden="true" /></a><Link href="/news/methodology" className={styles.railLink}>How Signal gives credit <ArrowRight size={17} aria-hidden="true" /></Link></aside>
      </div> : <section className={styles.unavailable} aria-labelledby="coverage-heading"><div className={styles.coverageIcon}><FileText size={26} strokeWidth={1.4} aria-hidden="true" /></div><div><p className={styles.kicker}>{brief.status === 'unavailable' ? 'PRIMARY RECORD TEMPORARILY UNAVAILABLE' : 'PRIMARY EVIDENCE NEEDED'}</p><h2 id="coverage-heading">Read this article at the source</h2><p>{brief.reason || 'We have not established an approved primary record for this reference.'}</p><p className={styles.checked}>Coverage checked <time dateTime={brief.generatedAt}>{checkedDate(brief.generatedAt)}</time></p><Link href="/news/briefs" className={styles.secondary}>Explore available Signal briefs <ArrowRight size={17} aria-hidden="true" /></Link></div></section>}

      <section className={styles.references} aria-labelledby="references-heading"><div><h2 id="references-heading">Sources</h2></div><ol className={styles.sourceList}><li id="source-1"><span className={styles.sourceNumber} aria-hidden="true">01</span><div><p className={styles.sourceRole}>DISCOVERY REFERENCE / HEADLINE ONLY</p><h3><a href={article.url} target="_blank" rel="noopener noreferrer">{article.title} <ArrowUpRight size={16} aria-hidden="true" /></a></h3><p>{publisher}{article.author ? ` · ${article.author}` : ''} · {formatPublished(article.publishedAt)}</p><p className={styles.sourceNote}>Publisher credited for the headline and original article.</p><a href="#main-content" className={styles.backLink}>Back to the headline ↑</a></div></li>{evidence && <li id="source-2"><span className={styles.sourceNumber} aria-hidden="true">02</span><div><p className={styles.sourceRole}>PRIMARY RECORD / DIGEST EVIDENCE</p><h3><a href={evidence.url} target="_blank" rel="noopener noreferrer">{evidence.title} <ArrowUpRight size={16} aria-hidden="true" /></a></h3><p>{evidence.publisher} · {formatPublished(evidence.publishedAt)}</p><p className={styles.sourceNote}>{evidence.license}</p><a href="#digest" className={styles.backLink}>Back to the digest ↑</a></div></li>}</ol></section>
      {evidence && <SubscribeCTA topic={article.category} content="briefs" heading="Keep this topic in view." description={`Follow ${topic.toLowerCase()} and any other topics you choose, with cited Signal briefs in a daily or weekly digest.`} />}
      <div className={styles.footer}><Link href="/news"><ArrowLeft size={16} aria-hidden="true" />Back to the latest</Link><Link href="/news/methodology#corrections">Corrections and source requests <ArrowUpRight size={16} aria-hidden="true" /></Link></div>
    </div>
  </main>;
}
