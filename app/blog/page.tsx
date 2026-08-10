import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BookOpen } from 'lucide-react';
import { SITE, CANONICAL_SITE_URL } from '@/app/config/site';
import JsonLd from '@/components/seo/JsonLd';
import { api } from '@/app/lib/api';
import { AI_PROCESS_GUIDE } from '@/app/lib/ai-process-guide';
import { insights } from '@/app/lib/insights-content';
import { TrackedLink } from '@/components/growth/Analytics';

export const dynamic = 'force-dynamic';

const title = 'OfRoot Field Notes on AI and Automation';
const description = 'Practical field notes for finding expensive manual work, evaluating AI and automation opportunities, and building systems with measurable operating value.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/blog' },
  openGraph: { title, description, url: `${CANONICAL_SITE_URL}/blog`, type: 'website' },
  twitter: { card: 'summary_large_image', title, description },
};

function formatDate(input?: string | null) {
  if (!input) return '';
  try {
    return new Date(input).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return String(input);
  }
}

export default async function BlogPage() {
  let items: Awaited<ReturnType<typeof api.publicListBlogPosts>>['data']['items'] = [];
  try {
    const response = await api.publicListBlogPosts({ limit: 24 });
    items = (response.data.items || []).filter((post) => post.slug !== AI_PROCESS_GUIDE.slug);
  } catch (error) {
    console.error('[BlogPage] Failed to fetch posts:', error);
  }

  const listLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: title,
    description,
    url: `${SITE.url}/blog`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: [
        { '@type': 'BlogPosting', position: 1, headline: AI_PROCESS_GUIDE.title, datePublished: AI_PROCESS_GUIDE.publishedAt, url: `${SITE.url}${AI_PROCESS_GUIDE.href}` },
        ...items.map((post, index) => ({
          '@type': 'BlogPosting',
          position: index + 2,
          headline: post.title,
          datePublished: post.published_at || post.created_at,
          url: `${SITE.url}/blog/${encodeURIComponent(post.slug)}${post.tenant_id ? `?tenant_id=${post.tenant_id}` : ''}`,
        })),
      ],
    },
  };

  return (
    <main id="main-content" className="bg-[#f7f6f2] text-slate-950">
      <JsonLd data={listLd} />
      <section className="relative isolate overflow-hidden bg-[#071225] px-6 py-20 text-white sm:px-8 sm:py-28">
        <div className="absolute inset-0 -z-10 opacity-70 [background:radial-gradient(circle_at_80%_15%,rgba(55,255,224,.12),transparent_32%),radial-gradient(circle_at_12%_90%,rgba(255,147,18,.16),transparent_30%)]" />
        <div className="mx-auto max-w-6xl">
          <p className="mb-5 text-sm font-bold uppercase tracking-[.2em] text-[#FFC46B]">OfRoot field notes</p>
          <h1 className="max-w-5xl text-balance text-5xl font-black leading-[.98] text-white sm:text-7xl">Better decisions before better software.</h1>
          <p className="mx-0 mt-7 max-w-3xl text-lg text-slate-200 sm:text-xl">Practical guides for finding costly work, evaluating AI and automation opportunities, and building systems whose value can be explained after launch.</p>
        </div>
      </section>

      <section className="px-6 py-16 sm:px-8 sm:py-24" aria-labelledby="featured-guide">
        <div className="mx-auto max-w-6xl">
          <p className="mb-4 text-sm font-bold uppercase tracking-[.16em] text-[#9A4D00]">Featured guide</p>
          <Link href={AI_PROCESS_GUIDE.href} className="group grid overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_22px_70px_rgba(15,23,42,.08)] lg:grid-cols-[.72fr_1.28fr] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B55B00] focus-visible:ring-offset-4">
            <div className="relative min-h-64 overflow-hidden bg-[#071225] p-8 text-white sm:p-10">
              <div className="absolute inset-0 opacity-80 [background:radial-gradient(circle_at_30%_20%,rgba(55,255,224,.2),transparent_30%),radial-gradient(circle_at_80%_80%,rgba(255,147,18,.22),transparent_32%)]" />
              <div className="relative flex h-full flex-col justify-between gap-14"><BookOpen className="h-9 w-9 text-[#37FFE0]" /><div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#FFC46B]">Map → Measure → Prioritize</p><p className="mt-3 text-2xl font-black text-white">A field guide for the work hiding between systems.</p></div></div>
            </div>
            <div className="flex flex-col p-8 sm:p-10 lg:p-12">
              <div className="flex flex-wrap gap-3 text-xs font-semibold text-slate-500"><span>{AI_PROCESS_GUIDE.displayDate}</span><span aria-hidden="true">•</span><span>{AI_PROCESS_GUIDE.readingTime}</span></div>
              <h2 id="featured-guide" className="mt-7 max-w-3xl text-balance text-3xl font-black sm:text-5xl">{AI_PROCESS_GUIDE.title}</h2>
              <p className="mx-0 mt-6 max-w-3xl text-lg text-slate-600">{AI_PROCESS_GUIDE.description}</p>
              <span className="mt-9 inline-flex items-center gap-2 font-bold text-[#8F4700]">Read the field guide<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none" /></span>
            </div>
          </Link>
        </div>
      </section>

      <section className="bg-white px-6 py-16 sm:px-8 sm:py-24" aria-labelledby="latest-notes">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="mb-3 text-sm font-bold uppercase tracking-[.16em] text-[#9A4D00]">{items.length ? 'From the archive' : 'Continue exploring'}</p><h2 id="latest-notes" className="text-4xl font-black">{items.length ? 'More OfRoot field notes.' : 'Choose the next question.'}</h2></div><Link href="/insights" className="font-semibold text-[#8F4700] hover:underline">Explore all insights</Link></div>
          {items.length ? (
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {items.map((post, index) => {
                const href = `/blog/${encodeURIComponent(post.slug)}${post.tenant_id ? `?tenant_id=${post.tenant_id}` : ''}`;
                return <Link href={href} key={`${post.id}:${post.slug}`} className="group flex min-h-72 flex-col rounded-3xl border border-slate-200 bg-[#f7f6f2] p-7 transition hover:-translate-y-1 hover:shadow-[0_18px_50px_rgba(15,23,42,.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B55B00] motion-reduce:transform-none"><div className="flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-[.15em] text-[#9A4D00]">Field note {String(index + 2).padStart(2, '0')}</span><span className="text-xs text-slate-500">{formatDate(post.published_at || post.created_at)}</span></div><h3 className="mt-12 text-balance text-2xl font-black group-hover:text-[#8F4700]">{post.title}</h3>{post.excerpt ? <p className="mx-0 mt-4 flex-1 text-slate-600">{post.excerpt}</p> : <div className="flex-1" />}<span className="mt-8 inline-flex items-center gap-2 font-semibold text-[#8F4700]">Read note<ArrowRight className="h-4 w-4" /></span></Link>;
              })}
            </div>
          ) : (
            <div className="mt-10 divide-y divide-slate-200 border-y border-slate-200">
              {insights.map((insight, index) => (
                <Link
                  href={`/insights/${insight.slug}`}
                  key={insight.slug}
                  className="group grid gap-5 py-7 transition-colors hover:bg-[#f7f6f2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#B55B00] sm:grid-cols-[9rem_1fr_auto] sm:items-center sm:px-5 motion-reduce:transition-none"
                >
                  <div>
                    <p className="mx-0 text-xs font-bold uppercase tracking-[.15em] text-[#9A4D00]">Structured insight {String(index + 1).padStart(2, '0')}</p>
                    <p className="mx-0 mt-2 text-sm text-slate-500">{insight.category}</p>
                  </div>
                  <div>
                    <h3 className="text-balance text-2xl font-black group-hover:text-[#8F4700]">{insight.title}</h3>
                    <p className="mx-0 mt-3 max-w-3xl text-sm text-slate-600">{insight.description}</p>
                  </div>
                  <span className="inline-flex items-center gap-2 font-semibold text-[#8F4700]">Open insight<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none" /></span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="bg-[#071225] px-6 py-16 text-white sm:px-8 sm:py-20">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 lg:flex-row lg:items-end lg:justify-between"><div><p className="mb-3 text-sm font-bold uppercase tracking-[.16em] text-[#FFC46B]">Bring the bottleneck</p><h2 className="max-w-4xl text-balance text-4xl font-black text-white sm:text-5xl">Turn the field guide into a ranked operating roadmap.</h2></div><TrackedLink href="/book?focus=ai-process-audit&source=blog-index" source="blog-index:final" event="ai_process_audit_cta_clicked" className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-[#FF9312] px-6 py-3 font-extrabold text-slate-950 hover:bg-[#ffad42] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#37FFE0] focus-visible:ring-offset-2 focus-visible:ring-offset-[#071225]">Book an AI Process Audit<ArrowRight className="h-4 w-4" /></TrackedLink></div>
      </section>
    </main>
  );
}
