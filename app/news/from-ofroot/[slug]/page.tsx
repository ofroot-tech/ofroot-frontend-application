import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import manifest from '@/content/signal-pilot.json';
import { checkedPilot, playableAudio, pilotTranscript } from '@/app/lib/signal-pilot';
import { CANONICAL_SITE_URL } from '@/app/config/site';
import SignalAudio from '@/components/editorial/SignalAudio';
import JsonLd from '@/components/seo/JsonLd';
import styles from '@/components/editorial/Reading.module.css';
import SubscribeCTA from '../../subscriptions/SubscribeCTA';

type Props={params:Promise<{slug:string}>};
function findArticle(slug:string) {
  const article=checkedPilot(manifest.articles).find(item=>item.slug===slug);
  if (!article) notFound();
  return article;
}
export async function generateMetadata({params}:Props):Promise<Metadata> {
  const article=findArticle((await params).slug);
  const url=`${CANONICAL_SITE_URL}/news/from-ofroot/${article.slug}`;
  return {title:`In Signal: ${article.title}`,description:article.summary,alternates:{canonical:`${CANONICAL_SITE_URL}${article.sourcePath}`},robots:{index:false,follow:true},openGraph:{type:'article',url,title:article.title,description:article.summary,images:[`${CANONICAL_SITE_URL}/og.jpg`]},twitter:{card:'summary_large_image',title:article.title,description:article.summary,images:[`${CANONICAL_SITE_URL}/og.jpg`]}};
}
export default async function OfRootSignal({params}:Props) {
  const article=findArticle((await params).slug);
  const audio=playableAudio(article);
  const url=`${CANONICAL_SITE_URL}/news/from-ofroot/${article.slug}`;
  const schema={ '@context':'https://schema.org','@type':'Article',headline:article.title,description:article.summary,url,mainEntityOfPage:{'@type':'WebPage','@id':url},isBasedOn:`${CANONICAL_SITE_URL}${article.sourcePath}`,
    author:{'@type':'Organization',name:'OfRoot Technology Editorial Team',url:`${CANONICAL_SITE_URL}/authors/ofroot-technology`},publisher:{'@type':'Organization',name:'OfRoot Technology',url:CANONICAL_SITE_URL},
    ...(audio ? {audio:{'@type':'AudioObject',name:`Audio: ${article.title}`,contentUrl:`${CANONICAL_SITE_URL}${audio.path}`,encodingFormat:'audio/mpeg',duration:`PT${audio.durationSeconds}S`,transcript:pilotTranscript(article)}} : {}) };
  return <main id="main-content" className={styles.page}><JsonLd data={schema}/><article className={styles.article}>
    <Link href="/news/from-ofroot" className={styles.link}>← More Signals from OfRoot</Link><h1>{article.title}</h1>
    <p className={styles.date}>A short version of an OfRoot guide · OfRoot Technology Editorial Team</p><p>{article.summary}</p>
    <Link href={article.sourcePath} className={styles.link}>Read the full article and its sources →</Link><SignalAudio article={article}/>
    <SubscribeCTA compact content="both" heading="More of what helps you." description="Choose the categories you want to follow and receive a daily or weekly Signal digest."/>
    <p className={styles.note}>This short version is drawn from our published article. It is a starting point, rather than a replacement for the full advice and limitations. <Link href="/about/editorial-standards">Read our editorial standards.</Link></p>
  </article></main>;
}
