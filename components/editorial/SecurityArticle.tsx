import Link from 'next/link';
import type { Metadata } from 'next';
import { CANONICAL_SITE_URL } from '@/app/config/site';
import { SECURITY_GUIDE, SECURITY_NEWS, SECURITY_SERVICE_PATH, type SecurityArticleContent, type SecurityArticleDraft } from '@/app/lib/application-security-content';
import { authoredArticleSchema } from '@/app/lib/reading-schema';
import JsonLd from '@/components/seo/JsonLd';
import ArticleSignalLink from './ArticleSignalLink';
import styles from './Reading.module.css';

type EditorialArticle = SecurityArticleContent | SecurityArticleDraft;

export function securityArticleMetadata(article: EditorialArticle): Metadata {
  const isDraft = 'preparedAt' in article;
  return {
    title: article.title, description: article.description, alternates: { canonical: article.href },
    ...(isDraft ? { robots: { index: false, follow: false } } : {}),
    openGraph: { type: 'article', title: article.title, description: article.description, url: `${CANONICAL_SITE_URL}${article.href}`,
      ...(isDraft ? {} : { publishedTime: article.publishedAt, modifiedTime: article.modifiedAt ?? article.publishedAt, images: [`${CANONICAL_SITE_URL}/og.jpg`] }) },
    twitter: { card: isDraft ? 'summary' : 'summary_large_image', title: article.title, description: article.description,
      ...(isDraft ? {} : { images: [`${CANONICAL_SITE_URL}/og.jpg`] }) },
  };
}

export default function SecurityArticle({ article, related: selectedRelated }: { article: EditorialArticle; related?: Pick<SecurityArticleContent, 'title' | 'href'> }) {
  const isDraft = 'preparedAt' in article;
  const isGuide = article.kind === 'guide';
  const related = selectedRelated ?? (isGuide ? SECURITY_NEWS : SECURITY_GUIDE);
  const displayDate = isDraft ? article.preparedAt : article.publishedAt;
  const date = new Intl.DateTimeFormat('en-US', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(`${displayDate}T12:00:00Z`));
  const modifiedDate = !isDraft && article.modifiedAt && article.modifiedAt !== article.publishedAt
    ? new Intl.DateTimeFormat('en-US', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(`${article.modifiedAt}T12:00:00Z`)) : null;
  const checkedDate = article.sourcesCheckedAt
    ? new Intl.DateTimeFormat('en-US', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(`${article.sourcesCheckedAt}T12:00:00Z`)) : null;
  const schema = authoredArticleSchema({ type: isGuide ? 'BlogPosting' : 'NewsArticle', path: article.href, title: article.title, description: article.description,
    ...(isDraft ? { draftPreparedAt: article.preparedAt } : { publishedAt: article.publishedAt, modifiedAt: article.modifiedAt }), section: isGuide ? 'Application security' : 'Cybersecurity',
    parent: { name: isGuide ? 'OfRoot blog' : 'Signal', path: isGuide ? '/blog' : '/news' }, sources: article.sources });
  return <main id="main-content" className={styles.page}>
    <JsonLd data={schema} />
    <article className={styles.article}>
      <nav aria-label="Breadcrumb"><Link href={isGuide ? '/blog' : '/news'} className={styles.link}>← {isGuide ? 'OfRoot blog' : 'Signal'}</Link></nav>
      <header><p className={styles.label}>{article.label}</p><h1>{article.title}</h1><p className={styles.date}>By OfRoot Technology · {isDraft && 'Draft for review · Prepared '}<time dateTime={displayDate}>{date}</time>{modifiedDate && !isDraft && <> · Updated <time dateTime={article.modifiedAt}>{modifiedDate}</time></>}{checkedDate && <> · Sources checked <time dateTime={article.sourcesCheckedAt}>{checkedDate}</time></>}</p><p className={styles.intro}>{article.description}</p></header>
      <section aria-labelledby="summary-heading"><h2 id="summary-heading">The short version</h2><p>{article.summary}</p>{article.summarySourceIds && <p className={styles.note}>{article.summarySourceIds.map(id => <a key={id} href={article.sources[id - 1].href} target="_blank" rel="noopener noreferrer">[{id}] {article.sources[id - 1].label} ↗ </a>)}</p>}</section>
      <nav aria-label="In this article"><ul>{article.sections.map(section => <li key={section.id}><a href={`#${section.id}`}>{section.title}</a></li>)}</ul></nav>
      {article.sections.map(section => <section id={section.id} key={section.id} className="scroll-mt-24"><h2>{section.title}</h2>{section.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}{section.points && <ul>{section.points.map(point => <li key={point}>{point}</li>)}</ul>}{section.sourceIds && <p className={styles.note}>{section.sourceIds.map(id => <a key={id} href={article.sources[id - 1].href} target="_blank" rel="noopener noreferrer">[{id}] {article.sources[id - 1].label} ↗ </a>)}</p>}</section>)}
      <section aria-labelledby="sources-heading"><h2 id="sources-heading">Sources and further reading</h2><ol>{article.sources.map(source => <li key={source.href}><a href={source.href} target="_blank" rel="noopener noreferrer">{source.label} ↗</a></li>)}</ol>{!isGuide && <p className={styles.note}>{article.sourceNote ?? 'This is a dated editorial briefing, not a live alert service. Check the current vendor advisory before acting. The source summaries and OfRoot’s suggested next steps are separate.'}</p>}</section>
      <section><h2>{isGuide ? 'Follow the security developments behind the work.' : 'Plan the review behind the fix.'}</h2><Link href={related.href} className={styles.link}>{related.title} →</Link></section>
      {isGuide && !isDraft && <ArticleSignalLink sourcePath={article.href} />}
      <div className={styles.cta}><p>Need a review, a penetration test or help fixing findings?</p><Link className={styles.link} href={SECURITY_SERVICE_PATH}>Explore application security →</Link></div>
    </article>
  </main>;
}
