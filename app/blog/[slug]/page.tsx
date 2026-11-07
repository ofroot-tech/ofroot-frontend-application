import styles from '@/components/editorial/Reading.module.css';
import { api } from '@/app/lib/api';
import { SITE } from '@/app/config/site';
import JsonLd from '@/components/seo/JsonLd';
import { notFound } from 'next/navigation';
import { renderBlogMarkdown } from '@/app/lib/blog-markdown';
import type { Metadata } from 'next';
import { cache } from 'react';
import ArticleSignalLink from '@/components/editorial/ArticleSignalLink';

// ------------------------------------------------------------
// Force dynamic rendering to avoid build-time API failures
// Reason: Blog posts are fetched from an external API that may not
// be available during Vercel's static generation phase.
// ------------------------------------------------------------
export const dynamic = 'force-dynamic';

function formatDate(input?: string | null) {
  if (!input) return '';
  try {
    const d = new Date(input);
    if (!Number.isFinite(d.getTime())) return '';
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone:'UTC' });
  } catch {
    return String(input);
  }
}

type RouteParams = Promise<{ slug: string }>;
type RouteSearchParams = Promise<{ [k: string]: string | string[] | undefined }>;

function tenantId(raw: string | string[] | undefined) {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const parsed = value && /^\d+$/.test(value) ? Number(value) : NaN;
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : undefined;
}

function actualDate(value?: string | null) {
  return value && Number.isFinite(Date.parse(value)) ? value : undefined;
}

export async function generateMetadata({ params, searchParams }: { params:RouteParams; searchParams:RouteSearchParams }):Promise<Metadata> {
  const tenant=tenantId((await searchParams).tenant_id);
  const post=await fetchPublicPost((await params).slug,tenant);
  const url=`${SITE.url}/blog/${encodeURIComponent(post.slug)}${post.tenant_id != null ? `?tenant_id=${post.tenant_id}` : ''}`;
  const title=post.meta_title || post.title;
  const description=post.meta_description || post.excerpt || `Read ${post.title} from OfRoot Technology.`;
  return {title,description,alternates:{canonical:url},openGraph:{type:'article',url,title,description,publishedTime:actualDate(post.published_at),modifiedTime:actualDate(post.updated_at)},twitter:{card:'summary_large_image',title,description,images:[`${SITE.url}/og.jpg`]}};
}

const fetchPublicPost = cache(async (slug:string, tenantFromQuery?:number): Promise<{
    id: number;
    title: string;
    slug: string;
    excerpt?: string | null;
    meta_title?: string | null;
    meta_description?: string | null;
    body: string;
    tenant_id?: number | null;
    published_at?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
  }> => {
    try {
      if (typeof tenantFromQuery === 'number') {
        const r = await api.publicGetBlogPost(slug, tenantFromQuery);
        return r.data;
      }

      const list = await api.publicListBlogPosts({ limit: 50 });
      const candidate = list.data.items.find((p) => p.slug === slug);
      if (candidate) {
        if (candidate.tenant_id != null) {
          const r = await api.publicGetBlogPost(slug, candidate.tenant_id);
          return r.data;
        }
        const r2 = await api.publicGetBlogPostAny(slug);
        return r2.data as any;
      }

      const r3 = await api.publicGetBlogPostAny(slug);
      return r3.data as any;
    } catch (error) {
      if ((error as {status?:number}).status === 404) notFound();
      throw error;
    }
  });

export default async function BlogPostPage({ params, searchParams }: { params: RouteParams; searchParams: RouteSearchParams }) {
  const resolvedParams = await params;
  const resolvedSearch = await searchParams;

  const slug = resolvedParams.slug;
  const tenantFromQuery = tenantId(resolvedSearch.tenant_id);
  const post = await fetchPublicPost(slug,tenantFromQuery);
  const html = await renderBlogMarkdown(post.body || '');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    author: { '@type':'Organization', name:'OfRoot Technology Editorial Team', url:`${SITE.url}/authors/ofroot-technology` },
    publisher: { '@type':'Organization', name:'OfRoot Technology', url:SITE.url },
    dateModified: actualDate(post.updated_at),
    isAccessibleForFree:true,
    datePublished: actualDate(post.published_at),
    url: `${SITE.url}/blog/${encodeURIComponent(post.slug)}${post.tenant_id ? `?tenant_id=${post.tenant_id}` : ''}`,
    description: post.excerpt || undefined,
  } as const;

  return (
    <>
      <JsonLd data={jsonLd as any} />
      <main className={styles.page}>
        <article className={styles.article}>
          <h1 className="mb-2">{post.title}</h1>
          {post.published_at ? (
            <div className={styles.date}>{formatDate(post.published_at)}</div>
          ) : null}
          {post.excerpt ? <p className={styles.intro}>{post.excerpt}</p> : null}
          <ArticleSignalLink sourcePath={`/blog/${post.slug}`} />
          <div className="mt-6" dangerouslySetInnerHTML={{ __html: html }} />
        </article>
      </main>
    </>
  );
}
