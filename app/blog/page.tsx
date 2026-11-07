import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/seo/JsonLd';
import { api } from '@/app/lib/api';
import { CANONICAL_SITE_URL } from '@/app/config/site';
import { AI_PROCESS_GUIDE } from '@/app/lib/ai-process-guide';
import { insights } from '@/app/lib/insights-content';
import styles from '@/components/editorial/Reading.module.css';
import SubscribeCTA from '@/app/news/subscriptions/SubscribeCTA';

export const dynamic = 'force-dynamic';
const title = 'OfRoot Blog — Practical AI and Automation';
const description = 'Clear guides to connecting your tools, reducing manual work, and using AI responsibly. Read the full article or explore source-linked technology briefs in Signal.';
export const metadata: Metadata = {
  title, description, alternates: { canonical: '/blog' },
  openGraph: { title, description, url: `${CANONICAL_SITE_URL}/blog`, type: 'website' },
  twitter: { card: 'summary_large_image', title, description, images: [`${CANONICAL_SITE_URL}/og.jpg`] },
};

function publicationLabel(value?: string | null) {
  if (!value || !Number.isFinite(Date.parse(value))) return 'OfRoot article';
  return new Date(value).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric', timeZone:'UTC' });
}

export default async function BlogPage() {
  let items: Awaited<ReturnType<typeof api.publicListBlogPosts>>['data']['items'] = [];
  let archiveUnavailable = false;
  try { items = ((await api.publicListBlogPosts({ limit: 30 })).data.items || []).filter(post => post.slug !== AI_PROCESS_GUIDE.slug); }
  catch { archiveUnavailable = true; }
  const entries = items.length ? items.map(post => ({ title:post.title, description:post.excerpt, href:`/blog/${encodeURIComponent(post.slug)}${post.tenant_id ? `?tenant_id=${post.tenant_id}` : ''}`, label:publicationLabel(post.published_at) })) : insights.map(insight => ({ title:insight.title, description:insight.description, href:`/insights/${insight.slug}`, label:insight.category }));
  const schema = { '@context':'https://schema.org', '@type':'CollectionPage', name:title, description, url:`${CANONICAL_SITE_URL}/blog`, mainEntity:{ '@type':'ItemList', itemListElement:[{title:AI_PROCESS_GUIDE.title,href:AI_PROCESS_GUIDE.href},...entries].map((entry,index)=>({ '@type':'ListItem', position:index+1, name:entry.title, url:`${CANONICAL_SITE_URL}${entry.href}` })) } };
  return <main id="main-content" className={styles.page}><JsonLd data={schema}/><div className={styles.shell}>
    <h1>Useful ideas.<br/>A practical next step.</h1>
    <p className={styles.intro}>Clear guides to connecting your tools, reducing manual work, and using AI responsibly. Start with a question your business is trying to answer.</p>
    <section className={styles.featured} aria-labelledby="featured-guide"><div><span className={styles.label}>Start here</span><p>Find the work worth improving before choosing the software.</p></div><div><h2 id="featured-guide">{AI_PROCESS_GUIDE.title}</h2><p>{AI_PROCESS_GUIDE.description}</p><Link className={styles.link} href={AI_PROCESS_GUIDE.href}>Read the guide →</Link></div></section>
    <section aria-labelledby="more-articles"><div className={styles.heading}><h2 id="more-articles">{items.length ? 'More from the blog' : 'Explore our guides'}</h2><Link href="/news" className={styles.link}>What’s changing? Read Signal →</Link></div>
      {entries.map(entry=><article className={styles.row} key={entry.href}><span className={styles.date}>{entry.label}</span><div><h3><Link href={entry.href}>{entry.title}</Link></h3>{entry.description && <p>{entry.description}</p>}<Link className={styles.link} href={entry.href}>Read the article →</Link></div></article>)}
      {archiveUnavailable && <p className={styles.note}>The article archive is temporarily unavailable. Our published guides above are still available; please try the archive again later.</p>}
    </section>
    <p className={styles.note}>Our <Link className={styles.link} href="/about/editorial-standards">editorial standards</Link> explain how we choose sources, review claims and use AI. Signal keeps the source in view; the blog gives an idea more room.</p>
    <SubscribeCTA content="both" heading="Follow what is useful to you." description="Choose the categories you care about, then get original articles and source-linked briefs in your inbox."/>
    <div className={styles.cta}><p>Have a workflow that keeps getting in the way?</p><Link href="/book?source=blog-index" className={styles.link}>Discuss your project →</Link></div>
  </div></main>;
}
