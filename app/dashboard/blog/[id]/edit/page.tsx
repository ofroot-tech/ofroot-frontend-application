// app/dashboard/blog/[id]/edit/page.tsx
// Edit blog post form with server action submit

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { api, type BlogPost, type BlogPostInput } from '@/app/lib/api';
import { TOKEN_COOKIE_NAME, LEGACY_COOKIE_NAME } from '@/app/lib/cookies';
import { fetchSupabaseUserByToken } from '@/app/lib/supabase-user';
import { PageHeader, Card, CardBody, CardHeader, Breadcrumbs, ToolbarButton } from '@/app/dashboard/_components/UI';
import { ConfirmActionForm } from '@/app/dashboard/blog/_components/ConfirmActionForm';
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

export default async function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: idParam } = await params;
  const token = await getToken();
  if (!token) redirect('/auth/login');

  const id = Number(idParam);
  if (!Number.isFinite(id)) redirect('/dashboard/blog');

  let post: BlogPost | null = null;
  try {
    const res = await api.blogGet(id, token);
    post = res.data;
  } catch {
    redirect('/dashboard/blog');
  }

  async function updatePost(formData: FormData) {
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
      : undefined;
    const status = (String(formData.get('status') || 'draft') === 'published' ? 'published' : 'draft') as 'draft'|'published';

    if (!title || !body) {
      return; // basic guard
    }

    const input: Partial<BlogPostInput> = {
      title,
      slug: slugRaw || slugify(title),
      body,
      excerpt: excerptVal ? excerptVal : null,
      status,
      published_at: status === 'published' ? new Date().toISOString() : null,
    };

    input.meta_title = metaTitle || (formData.has('meta_title') ? null : undefined);
    input.meta_description = metaDescription || (formData.has('meta_description') ? null : undefined);
    input.featured_image_url = featuredImageUrl || (formData.has('featured_image_url') ? null : undefined);
    if (tagsPresent) {
      input.tags = tags ?? [];
    }

    // For super admins, ensure saves target the main OfRoot tenant when publishing
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
      }
    } catch {}

    await api.blogUpdate(id, input, token);
    revalidatePath('/dashboard/blog');
    redirect(`/dashboard/blog/${id}/edit?saved=1`);
  }

  return (
    <div className="space-y-6 reveal-in fade-only">
  <SuccessToastFromQuery param="saved" message="Post saved" />
      <SuccessToastFromQuery param="published" message="Post published" />
  <SuccessToastFromQuery param="unpublished" message="Post unpublished" />
      <PageHeader
        title="Edit Blog Post"
        subtitle="Update your post and save."
        meta={<Breadcrumbs items={[{ label: 'Blog', href: '/dashboard/blog' }, { label: post?.title || 'Edit' }]} />}
        actions={post?.status !== 'published' ? (
          // Publish server action button
          <form action={async () => {
            'use server';
            const token = await getToken();
            if (!token) redirect('/auth/login');
            // Set main tenant on publish if super admin
            let payload: Partial<BlogPostInput> = { status: 'published', published_at: new Date().toISOString() };
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
                payload.tenant_id = Number(mainTenantId);
              }
            } catch {}
            await api.blogUpdate(id, payload, token);
            revalidatePath('/dashboard/blog');
            redirect(`/dashboard/blog/${id}/edit?published=1`);
          }}>
            <ToolbarButton>Publish</ToolbarButton>
          </form>
        ) : (
          // Unpublish with confirmation
          <ConfirmActionForm
            label="Unpublish"
            message="Unpublish this post? It will no longer be visible to readers."
            action={async () => {
              'use server';
              const token = await getToken();
              if (!token) redirect('/auth/login');
              await api.blogUpdate(id, { status: 'draft', published_at: null }, token);
              revalidatePath('/dashboard/blog');
              redirect(`/dashboard/blog/${id}/edit?unpublished=1`);
            }}
          />
        )}
      />

      <Card>
        <CardHeader>
          <div className="text-sm text-gray-600">Editing: <span className="font-medium text-gray-900">{post?.title}</span>{' '}
            {post?.status === 'published' ? (
              <span className="ml-2 inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 text-xs font-medium">Published</span>
            ) : (
              <span className="ml-2 inline-flex items-center rounded-full bg-gray-100 text-gray-700 border border-gray-200 px-2 py-0.5 text-xs font-medium">Draft</span>
            )}
          </div>
        </CardHeader>
        <CardBody>
          <PostForm mode="edit" onSubmit={updatePost} defaultValues={{
            title: post?.title,
            slug: post?.slug,
            excerpt: post?.excerpt ?? undefined,
            body: post?.body,
            status: post?.status,
            meta_title: post?.meta_title ?? undefined,
            meta_description: post?.meta_description ?? undefined,
            featured_image_url: post?.featured_image_url ?? undefined,
            tags: post?.tags ?? undefined,
          }} />
        </CardBody>
      </Card>
    </div>
  );
}
