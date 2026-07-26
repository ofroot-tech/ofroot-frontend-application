import { api, type BlogPost } from '@/app/lib/api';
import { SITE } from '@/app/config/site';

export type PublicBlogPost = Pick<
  BlogPost,
  | 'id'
  | 'title'
  | 'meta_title'
  | 'slug'
  | 'excerpt'
  | 'meta_description'
  | 'featured_image_url'
  | 'tags'
  | 'body'
  | 'tenant_id'
  | 'published_at'
  | 'created_at'
  | 'updated_at'
>;

export const fallbackPosts: PublicBlogPost[] = [
  {
    id: 1,
    title: 'The operator-led 30-day AI build',
    slug: 'operator-led-30-day-ai-build',
    excerpt: 'How we scope, build, and ship a revenue-grade AI workflow in 30 days with weekly demos.',
    body: '# The operator-led 30-day AI build\n\nWe keep the promise narrow and the delivery visible. Week 1 is intake and routing design, Week 2 is integration and guardrails, Week 3 is QA with fixtures, Week 4 is rollout with a rollback plan. Every Friday ships with diffs and a short loom.',
  },
  {
    id: 2,
    title: 'Pricing ladder for home services and OnTask',
    slug: 'pricing-ladder-home-services',
    excerpt: 'Starter $29/mo, Plus $299/mo, and a $12K 30-day pilot—why the ladder matches workload and risk.',
    body: '# Pricing ladder for home services and OnTask\n\nStarter covers calendar, estimates → invoices, payments, and light automations. Plus unlocks integrations, higher volume, and priority chat. The 30-day pilot adds AI intake + routing with weekly demos and guardrails. Overages auto-upgrade and annual saves ~2 months.',
  },
  {
    id: 3,
    title: 'OnTask Starter + Plus launch notes',
    slug: 'ontask-starter-plus-launch',
    excerpt: 'What ships in Starter, what unlocks in Plus, and how to move into the AI intake pilot.',
    body: '# OnTask Starter + Plus launch notes\n\nStarter gives crews of 1–10 one calendar, fast paperwork, and Stripe payments. Plus adds integrations, higher throughput, and priority support. When the team is ready for AI intake, we scope a 30-day pilot and then move to a quarterly retainer.',
  },
];

export function tenantIdFromSearchParams(searchParams: Record<string, string | string[] | undefined>) {
  const tenantId = Array.isArray(searchParams.tenant_id) ? searchParams.tenant_id[0] : searchParams.tenant_id;
  return tenantId && /^\d+$/.test(tenantId) ? Number(tenantId) : undefined;
}

export async function getPublicBlogPost(slug: string, tenantId?: number): Promise<PublicBlogPost | null> {
  try {
    if (typeof tenantId === 'number') {
      const response = await api.publicGetBlogPost(slug, tenantId);
      return response.data;
    }

    const list = await api.publicListBlogPosts({ limit: 50 });
    const candidate = list.data.items.find((post) => post.slug === slug);
    if (candidate?.tenant_id != null) {
      const response = await api.publicGetBlogPost(slug, candidate.tenant_id);
      return response.data;
    }

    const response = await api.publicGetBlogPostAny(slug);
    return response.data;
  } catch {
    return fallbackPosts.find((post) => post.slug === slug) ?? null;
  }
}

export function blogPostUrl(slug: string, tenantId?: number | null) {
  const url = new URL(`/blog/${encodeURIComponent(slug)}`, SITE.url);
  if (tenantId != null) url.searchParams.set('tenant_id', String(tenantId));
  return url.toString();
}

export function blogSocialImageUrl(slug: string, tenantId?: number | null) {
  const url = new URL(`/blog/${encodeURIComponent(slug)}/social-image`, SITE.url);
  if (tenantId != null) url.searchParams.set('tenant_id', String(tenantId));
  return url.toString();
}

export function formatBlogDate(input?: string | null) {
  if (!input) return '';
  const date = new Date(input);
  return Number.isNaN(date.getTime())
    ? input
    : date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

export function readTimeMinutes(body: string) {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}
