import type { Metadata } from 'next';
import Link from 'next/link';
import manifest from '@/content/signal-pilot.json';
import { checkedPilot } from '@/app/lib/signal-pilot';
import { readingCollection } from '@/app/lib/reading-schema';
import JsonLd from '@/components/seo/JsonLd';
import styles from '@/components/editorial/Reading.module.css';
import SubscribeCTA from '../subscriptions/SubscribeCTA';

export const metadata:Metadata={title:'OfRoot Articles, in Signal',description:'Short versions of OfRoot’s published guides, with links to the full article and its sources.',alternates:{canonical:'/news/from-ofroot'}};
export default function OfRootSignals() {
  const articles=checkedPilot(manifest.articles);
  return <main id="main-content" className={styles.page}><div className={styles.shell}>
    <JsonLd data={readingCollection('/news/from-ofroot','OfRoot articles, in Signal',articles.map(article=>({title:article.title,path:`/news/from-ofroot/${article.slug}`})))}/>
    <h1>The short version.<br/>The full picture, one link away.</h1>
    <p className={styles.intro}>A quick starting point for our practical guides. Each Signal links to the full article, where you can explore the advice, sources and limitations.</p>
    <Link href="/news/subscribe?content=both" className={styles.link}>Follow the categories that matter to you →</Link>
    {articles.map(article=><article className={styles.row} key={article.slug}><span className={styles.label}>From OfRoot</span><div><h2><Link href={`/news/from-ofroot/${article.slug}`}>{article.title}</Link></h2><p>{article.summary}</p><Link href={`/news/from-ofroot/${article.slug}`} className={styles.link}>Open this Signal →</Link></div></article>)}
    <p className={styles.note}>This is a 30-article pilot, including existing articles. We’re starting with {articles.length} published OfRoot guides.</p>
    <SubscribeCTA content="both" heading="Choose what you want to follow." description="Pick your categories, choose articles or briefs, and confirm your email. You stay in control of your reading and delivery."/>
    <Link href="/news" className={styles.link}>Back to technology news →</Link>
  </div></main>;
}
