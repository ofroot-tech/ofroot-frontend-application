import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/seo/JsonLd';
import { CANONICAL_SITE_URL } from '@/app/config/site';
import { AI_PROCESS_GUIDE } from '@/app/lib/ai-process-guide';
import { insights } from '@/app/lib/insights-content';
import { SECURITY_EDITORIAL_GUIDES } from '@/app/lib/security-editorial';
import { INBOUND_EMAIL_GUIDE, SIGNAL_NOVEMBER_26 } from '@/app/lib/signal-weekly-20261126';
import styles from '@/components/editorial/Reading.module.css';
import SubscribeCTA from '@/app/news/subscriptions/SubscribeCTA';

const title = 'OfRoot Blog — Engineering, AI and Application Security';
const description = 'Practical guides to connected software, responsible AI and application security, with source-linked technology and security briefs in Signal.';
export const metadata: Metadata = {
  title, description, alternates: { canonical: '/blog' },
  openGraph: { title, description, url: `${CANONICAL_SITE_URL}/blog`, type: 'website' },
  twitter: { card: 'summary_large_image', title, description, images: [`${CANONICAL_SITE_URL}/og.jpg`] },
};

export default async function BlogPage() {
  // Codex publishes the current guides in source; reading does not depend on
  // a separate legacy editor or an unconfigured article API.
  const entries = [{ ...INBOUND_EMAIL_GUIDE, label: 'Workflow automation' }, ...SECURITY_EDITORIAL_GUIDES.map(article => ({ title: article.title, description: article.description, href: article.href, label: 'Application security' })), ...insights.map(insight => ({ title:insight.title, description:insight.description, href:`/insights/${insight.slug}`, label:insight.category }))];
  const schema = { '@context':'https://schema.org', '@type':'CollectionPage', name:title, description, url:`${CANONICAL_SITE_URL}/blog`, mainEntity:{ '@type':'ItemList', itemListElement:[{title:AI_PROCESS_GUIDE.title,href:AI_PROCESS_GUIDE.href},...entries].map((entry,index)=>({ '@type':'ListItem', position:index+1, name:entry.title, url:`${CANONICAL_SITE_URL}${entry.href}` })) } };
  return <main id="main-content" className={styles.page}><JsonLd data={schema}/><div className={styles.shell}>
    <h1>Useful ideas.<br/>A practical next step.</h1>
    <p className={styles.intro}>Clear guides to connected software, responsible AI and application security. Start with a question your business is trying to answer.</p>
    <section className={styles.featured} aria-labelledby="featured-guide"><div><span className={styles.label}>Start here</span><p>Find the work worth improving before choosing the software.</p></div><div><h2 id="featured-guide">{AI_PROCESS_GUIDE.title}</h2><p>{AI_PROCESS_GUIDE.description}</p><Link className={styles.link} href={AI_PROCESS_GUIDE.href}>Read the guide →</Link></div></section>
    <section aria-labelledby="more-articles"><div className={styles.heading}><h2 id="more-articles">Explore our guides</h2><Link href="/news" className={styles.link}>What’s changing? Read Signal →</Link></div>
      {entries.map(entry=><article className={styles.row} key={entry.href}><span className={styles.date}>{entry.label}</span><div><h3><Link href={entry.href}>{entry.title}</Link></h3>{entry.description && <p>{entry.description}</p>}<Link className={styles.link} href={entry.href}>Read the article →</Link></div></article>)}
    </section>
    <p className={styles.note}>Our <Link className={styles.link} href="/about/editorial-standards">editorial standards</Link> explain how we choose sources, review claims and use AI. Signal keeps the source in view; the blog gives an idea more room. <Link className={styles.link} href={SIGNAL_NOVEMBER_26.href}>Read the November 26 issue →</Link></p>
    <SubscribeCTA content="both" heading="Follow what is useful to you." description="Choose the categories you care about, then get original articles and source-linked briefs in your inbox."/>
    <div className={styles.cta}><p>Have a workflow that keeps getting in the way?</p><Link href="/book?source=blog-index" className={styles.link}>Discuss your project →</Link></div>
  </div></main>;
}
