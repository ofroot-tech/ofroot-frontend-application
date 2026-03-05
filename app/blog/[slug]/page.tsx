import { api } from '@/app/lib/api';
import { SITE } from '@/app/config/site';
import JsonLd from '@/components/seo/JsonLd';
import { notFound } from 'next/navigation';
import { marked } from 'marked';

// ------------------------------------------------------------
// Force dynamic rendering to avoid build-time API failures
// Reason: Blog posts are fetched from an external API that may not
// be available during Vercel's static generation phase.
// ------------------------------------------------------------
export const dynamic = 'force-dynamic';

const fallbackPosts = [
  {
    id: 1,
    title: 'The operator-led 30-day AI build',
    slug: 'operator-led-30-day-ai-build',
    excerpt: 'How we scope, build, and ship a revenue-grade AI workflow in 30 days with weekly demos.',
    body: `# The operator-led 30-day AI build\n\nWe keep the promise narrow and the delivery visible. Week 1 is intake and routing design, Week 2 is integration and guardrails, Week 3 is QA with fixtures, Week 4 is rollout with a rollback plan. Every Friday ships with diffs and a short loom.`,
    published_at: new Date().toISOString(),
  },
  {
    id: 2,
    title: 'Pricing ladder for home services and OnTask',
    slug: 'pricing-ladder-home-services',
    excerpt: 'Starter $29/mo, Plus $299/mo, and a $12K 30-day pilot—why the ladder matches workload and risk.',
    body: `# Pricing ladder for home services and OnTask\n\nStarter covers calendar, estimates → invoices, payments, and light automations. Plus unlocks integrations, higher volume, and priority chat. The 30-day pilot adds AI intake + routing with weekly demos and guardrails. Overages auto-upgrade and annual saves ~2 months.`,
    published_at: new Date().toISOString(),
  },
  {
    id: 3,
    title: 'OnTask Starter + Plus launch notes',
    slug: 'ontask-starter-plus-launch',
    excerpt: 'What ships in Starter, what unlocks in Plus, and how to move into the AI intake pilot.',
    body: `# OnTask Starter + Plus launch notes\n\nStarter gives crews of 1–10 one calendar, fast paperwork, and Stripe payments. Plus adds integrations, higher throughput, and priority support. When the team is ready for AI intake, we scope a 30-day pilot and then move to a quarterly retainer.`,
    published_at: new Date().toISOString(),
  },
] as const;

function formatDate(input?: string | null) {
  if (!input) return '';
  try {
    const d = new Date(input);
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return String(input);
  }
}

type RouteParams = Promise<{ slug: string }>;
type RouteSearchParams = Promise<{ [k: string]: string | string[] | undefined }>;

export default async function BlogPostPage({ params, searchParams }: { params: RouteParams; searchParams: RouteSearchParams }) {
  const resolvedParams = await params;
  const resolvedSearch = await searchParams;

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
    } catch {
      const fallback = fallbackPosts.find((p) => p.slug === slug);
      if (fallback) return fallback as any;
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
