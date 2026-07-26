import { SITE } from '@/app/config/site';
import JsonLd from '@/components/seo/JsonLd';
import { notFound } from 'next/navigation';
import { marked } from 'marked';
import type { Metadata } from 'next';
import {
  blogPostUrl,
  blogSocialImageUrl,
  formatBlogDate,
  getPublicBlogPost,
  readTimeMinutes,
  tenantIdFromSearchParams,
} from '../post-utils';

// ------------------------------------------------------------
// Force dynamic rendering to avoid build-time API failures
// Reason: Blog posts are fetched from an external API that may not
// be available during Vercel's static generation phase.
// ------------------------------------------------------------
export const dynamic = 'force-dynamic';

type RouteParams = Promise<{ slug: string }>;
type RouteSearchParams = Promise<{ [k: string]: string | string[] | undefined }>;

export async function generateMetadata({ params, searchParams }: { params: RouteParams; searchParams: RouteSearchParams }): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  const resolvedSearch = await searchParams;
  const slug = decodeURIComponent(rawSlug);
  const post = await getPublicBlogPost(slug, tenantIdFromSearchParams(resolvedSearch));

  if (!post) return { title: 'Article' };

  const canonical = blogPostUrl(post.slug, post.tenant_id);
  const title = post.meta_title || post.title;
  const description = post.meta_description || post.excerpt || `Read ${post.title} from ${SITE.name}.`;
  const socialImage = blogSocialImageUrl(post.slug, post.tenant_id);

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: 'article',
      url: canonical,
      title,
      description,
      publishedTime: post.published_at || post.created_at || undefined,
      modifiedTime: post.updated_at || undefined,
      tags: post.tags || undefined,
      images: [{ url: socialImage, width: 1200, height: 630, alt: `${post.title} · ${SITE.name}` }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [socialImage],
    },
  };
}

export default async function BlogPostPage({ params, searchParams }: { params: RouteParams; searchParams: RouteSearchParams }) {
  const resolvedParams = await params;
  const resolvedSearch = await searchParams;

  const slug = decodeURIComponent(resolvedParams.slug);
  const post = await getPublicBlogPost(slug, tenantIdFromSearchParams(resolvedSearch));
  if (!post) notFound();
  const html = await marked.parse(post.body || '');
  const canonical = blogPostUrl(post.slug, post.tenant_id);
  const publishedAt = post.published_at || post.created_at;
  const readTime = readTimeMinutes(post.body || '');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.meta_description || post.excerpt || undefined,
    datePublished: publishedAt || undefined,
    dateModified: post.updated_at || undefined,
    image: post.featured_image_url ? [post.featured_image_url] : undefined,
    keywords: post.tags?.join(', ') || undefined,
    isAccessibleForFree: true,
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
    url: canonical,
  } as const;

  return (
    <>
      <JsonLd data={jsonLd as any} />
      <main className="min-h-screen bg-white text-gray-900 pt-24 pb-20 px-4">
        <article className="prose prose-lg max-w-3xl mx-auto">
          <h1 className="mb-2">{post.title}</h1>
          <dl className="not-prose mb-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-600" aria-label="Article details">
            {publishedAt ? <div><dt className="sr-only">Published</dt><dd>Published {formatBlogDate(publishedAt)}</dd></div> : null}
            {post.updated_at && post.updated_at !== publishedAt ? <div><dt className="sr-only">Updated</dt><dd>Updated {formatBlogDate(post.updated_at)}</dd></div> : null}
            <div><dt className="sr-only">Reading time</dt><dd>{readTime} min read</dd></div>
          </dl>
          {post.excerpt ? <p className="text-gray-700 italic">{post.excerpt}</p> : null}
          {post.tags?.length ? (
            <ul className="not-prose mb-6 flex list-none flex-wrap gap-2 p-0" aria-label="Article topics">
              {post.tags.map((tag) => <li key={tag} className="rounded-full bg-orange-50 px-3 py-1 text-sm font-medium text-orange-800">{tag}</li>)}
            </ul>
          ) : null}
          <div className="mt-6" dangerouslySetInnerHTML={{ __html: html }} />
        </article>
      </main>
    </>
  );
}
