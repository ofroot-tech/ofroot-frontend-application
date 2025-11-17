import { api } from '@/app/lib/api';
import { SITE } from '@/app/config/site';
import JsonLd from '@/components/seo/JsonLd';
import { notFound } from 'next/navigation';
import { marked } from 'marked';

function formatDate(input?: string | null) {
  if (!input) return '';
  try {
    const d = new Date(input);
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return String(input);
  }
}

type RouteParams = Promise<{ slug: string }> | { slug: string };
type RouteSearchParams = Promise<{ [k: string]: string | string[] | undefined }> | { [k: string]: string | string[] | undefined };

function isPromise<T>(value: T | Promise<T>): value is Promise<T> {
  return typeof (value as any)?.then === 'function';
}

export default async function BlogPostPage({ params, searchParams }: { params: RouteParams; searchParams: RouteSearchParams }) {
  const resolvedParams = isPromise(params) ? await params : params;
  const resolvedSearch = isPromise(searchParams) ? await searchParams : searchParams;

  const slug = decodeURIComponent(resolvedParams.slug);
  const qTenant = Array.isArray(resolvedSearch?.tenant_id) ? resolvedSearch?.tenant_id[0] : resolvedSearch?.tenant_id;
  const tenantFromQuery = qTenant && /^\d+$/.test(String(qTenant)) ? Number(qTenant) : undefined;

  async function fetchWithFallback(): Promise<{
    id: number;
    title: string;
    slug: string;
    excerpt?: string | null;
    body: string;
    tenant_id?: number | null;
    published_at?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
  }> {
    // Preferred: fetch directly if tenant id known
    if (typeof tenantFromQuery === 'number') {
      const r = await api.publicGetBlogPost(slug, tenantFromQuery);
      return r.data;
    }

    // Fallback: list recent posts and find matching slug
    const list = await api.publicListBlogPosts({ limit: 50 });
    const candidate = list.data.items.find((p) => p.slug === slug);
    if (candidate) {
      if (candidate.tenant_id != null) {
        const r = await api.publicGetBlogPost(slug, candidate.tenant_id);
        return r.data;
      }
      // No tenant_id available — try slug-only endpoint
      const r2 = await api.publicGetBlogPostAny(slug);
      return r2.data as any;
    }

    // Final attempt: slug-only (covers cases where post is older than list limit)
    try {
      const r3 = await api.publicGetBlogPostAny(slug);
      return r3.data as any;
    } catch {
      // If still not found, 404
      notFound();
    }
  }

  const post = await fetchWithFallback();
  const html = await marked.parse(post.body || '');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    datePublished: post.published_at || post.created_at,
    url: `${SITE.url}/blog/${encodeURIComponent(post.slug)}${post.tenant_id ? `?tenant_id=${post.tenant_id}` : ''}`,
    description: post.excerpt || undefined,
  } as const;

  return (
    <>
      <JsonLd data={jsonLd as any} />
      <main className="min-h-screen bg-white text-gray-900 pt-24 pb-20 px-4">
        <article className="prose prose-lg max-w-3xl mx-auto">
          <h1 className="mb-2">{post.title}</h1>
          {(post.published_at || post.created_at) ? (
            <div className="text-gray-500 text-sm mb-6">{formatDate(post.published_at || post.created_at)}</div>
          ) : null}
          {post.excerpt ? <p className="text-gray-700 italic">{post.excerpt}</p> : null}
          <div className="mt-6" dangerouslySetInnerHTML={{ __html: html }} />
        </article>
      </main>
    </>
  );
}
