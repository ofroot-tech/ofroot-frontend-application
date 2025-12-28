// app/dashboard/blog/new/page.tsx
// Create blog post form with server action submit

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { api, type BlogPostInput } from '@/app/lib/api';
import { TOKEN_COOKIE_NAME, LEGACY_COOKIE_NAME } from '@/app/lib/cookies';
import { fetchSupabaseUserByToken } from '@/app/lib/supabase-user';
import { PageHeader, Card, CardBody, CardHeader, Breadcrumbs } from '@/app/dashboard/_components/UI';
import { PostForm } from '@/app/dashboard/blog/_components/PostForm';
import { SuccessToastFromQuery } from '@/components/SuccessToastFromQuery';

async function getToken() {
  const store = await cookies();
  return store.get(TOKEN_COOKIE_NAME)?.value || store.get(LEGACY_COOKIE_NAME)?.value;
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export default async function NewBlogPostPage() {
  const token = await getToken();
  if (!token) redirect('/auth/login');

  async function createPost(formData: FormData): Promise<{ error?: string } | void> {
    'use server';
    const token = await getToken();
    if (!token) redirect('/auth/login');

    const title = String(formData.get('title') || '').trim();
    const slugRaw = String(formData.get('slug') || '').trim();
    const body = String(formData.get('body') || '').trim();
    const excerptVal = String(formData.get('excerpt') || '').trim();
    const tagsPresent = formData.get('__tags_present') === '1';
    const metaTitle = String(formData.get('meta_title') || '').trim();
    const metaDescription = String(formData.get('meta_description') || '').trim();
    const featuredImageUrl = String(formData.get('featured_image_url') || '').trim();
    const tags = tagsPresent
      ? formData
          .getAll('tags[]')
          .map((tag) => String(tag).trim())
          .filter(Boolean)
      : [];
    const status = (String(formData.get('status') || 'draft') === 'published' ? 'published' : 'draft') as 'draft'|'published';

    if (!title || !body) {
      // In a fuller UX we'd send back form state; for now, guard and return to form
      return;
    }

    const input: BlogPostInput = {
      title,
      slug: slugRaw || slugify(title),
      body,
      excerpt: excerptVal ? excerptVal : null,
      status,
      published_at: status === 'published' ? new Date().toISOString() : null,
    };

    if (metaTitle) input.meta_title = metaTitle;
    if (metaDescription) input.meta_description = metaDescription;
    if (featuredImageUrl) input.featured_image_url = featuredImageUrl;
    if (tagsPresent) input.tags = tags;

    // If user is super admin, publish to the main OfRoot tenant
    // a) on blog admin, if user is admin/super admin assume b)
    // b) user is part of main Ofroot company
    // c) if b) is true then d)
    // d) publish blog to ofroot.technology/blog/:dir
    try {
      const me = await fetchSupabaseUserByToken(token);
      const email = me?.email ?? null;
      const allow = String(process.env.ADMIN_EMAILS || '')
        .split(',')
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
      const isSuperAdmin = !!email && allow.includes(String(email).toLowerCase());
      const mainTenantId = process.env.OFROOT_TENANT_ID ? Number(process.env.OFROOT_TENANT_ID) : null;
      if (isSuperAdmin && Number.isFinite(mainTenantId as any)) {
        input.tenant_id = Number(mainTenantId);
        // If they chose draft, we still respect it; publishing action can be done in edit page too
      }
    } catch {}

    try {
      const res = await api.blogCreate(input, token);
      revalidatePath('/dashboard/blog');
      redirect(`/dashboard/blog/${res.data.id}/edit?saved=1`);
    } catch (e: any) {
      // Normalize error for client form to display inline instead of a 500 overlay
      const bodyMsg = typeof e?.body === 'object' && e?.body ? (e.body as any).message : undefined;
      const message = bodyMsg || e?.message || 'Unable to create post. Please try again.';
      // Optionally include status for context
      const status = typeof e?.status === 'number' ? ` (HTTP ${e.status})` : '';
      return { error: `${message}${status}` };
    }
  }

  return (
    <div className="space-y-6 reveal-in fade-only">
      {/* surface success toast if param present (e.g., after auto-redirects or future flows) */}
      <SuccessToastFromQuery param="saved" message="Post created" />
      <PageHeader
        title="New Blog Post"
        subtitle="Create a post. You can save as draft or publish immediately."
        meta={<Breadcrumbs items={[{ label: 'Blog', href: '/dashboard/blog' }, { label: 'New' }]} />}
      />

      <Card>
        <CardHeader>
          <div className="text-sm text-gray-600">Fill out the fields below and click Save.</div>
        </CardHeader>
        <CardBody>
          <PostForm mode="create" onSubmit={createPost} />
        </CardBody>
      </Card>
    </div>
  );
}
