// app/dashboard/blog/page.tsx
// Blog management surface for subscribers with the blog add-on.

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import { api, type BlogPost, type BlogPostGenerationInput, type BlogPostGenerationResult } from '@/app/lib/api';
import { TOKEN_COOKIE_NAME, LEGACY_COOKIE_NAME } from '@/app/lib/cookies';
import { PageHeader, Card, CardBody, ToolbarButton } from '@/app/dashboard/_components/UI';
import { ConfirmDeleteForm } from '@/app/dashboard/blog/_components/ConfirmDeleteForm';
import { SuccessToastFromQuery } from '@/components/SuccessToastFromQuery';
import { BlogAiComposer } from '@/app/dashboard/blog/_components/BlogAiComposer';
import { BlogStatusFilters } from '@/app/dashboard/blog/_components/BlogStatusFilters';
import { AiDraftCard } from '@/app/dashboard/blog/_components/AiDraftCard';

async function getToken() {
  const store = await cookies();
  return store.get(TOKEN_COOKIE_NAME)?.value || store.get(LEGACY_COOKIE_NAME)?.value;
}

function formatDate(value?: string | null) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export default async function BlogAdminPage({
  searchParams,
}: {
  searchParams?: { status?: string };
}) {
  const token = await getToken();
  if (!token) redirect('/auth/login');

  const requestedStatus =
    searchParams?.status === 'draft' || searchParams?.status === 'published'
      ? searchParams.status
      : undefined;

  let posts: BlogPost[] = [];
  try {
    const res = await api.blogList(token, requestedStatus ? { status: requestedStatus } : undefined);
    posts = res?.data ?? [];
  } catch {
    posts = [];
  }

  const postCountLabel = `${posts.length} ${posts.length === 1 ? 'post' : 'posts'}`;
  const hasPosts = posts.length > 0;

  return (
    <div className="space-y-6 reveal-in fade-only">
      <SuccessToastFromQuery param="deleted" message="Post deleted" />
      <PageHeader
        title="Blog"
        subtitle="Draft, publish, and review posts for your marketing site."
        meta={
          <div className="flex items-center gap-3">
            <span>{postCountLabel}</span>
            <BlogStatusFilters />
          </div>
        }
        actions={
          <div className="flex items-center gap-2">
            <BlogAiComposer generateDraft={generateBlogDraft} />
            <ToolbarButton href="/dashboard/blog/new">Manual post</ToolbarButton>
          </div>
        }
      />

      {hasPosts ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <AiDraftCard />
          {posts.map((post) => (
            <article
              key={post.id}
              className="flex h-full flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="relative h-44 w-full overflow-hidden bg-gradient-to-br from-violet-200 via-white to-amber-100">
                {post.featured_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={post.featured_image_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-4xl font-semibold text-gray-400">
                    {(post.title || 'Post').slice(0, 1).toUpperCase()}
                  </div>
                )}
                <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${
                      post.status === 'published'
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        : 'border-gray-200 bg-gray-50 text-gray-700'
                    }`}
                  >
                    {post.status === 'published' ? 'Published' : 'Draft'}
                  </span>
                  {post.ai_context ? (
                    <span className="inline-flex items-center rounded-full border border-violet-200 bg-white/80 px-2 py-0.5 text-xs font-medium text-violet-700">
                      AI draft
                    </span>
                  ) : null}
                </div>
              </div>
              <div className="flex flex-1 flex-col gap-3 p-4">
                <div className="space-y-1">
                  <div className="text-xs uppercase tracking-wide text-gray-500">{post.meta_title || 'Meta title pending'}</div>
                  <h3 className="text-lg font-semibold text-gray-900">{post.title}</h3>
                  <p className="text-sm text-gray-600">{post.excerpt || 'No excerpt provided yet.'}</p>
                </div>
                {post.tags?.length ? (
                  <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                    {post.tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-700">
                        #{tag}
                      </span>
                    ))}
                  </div>
                ) : null}
                <div className="text-xs text-gray-500">
                  <div>Updated {formatDate(post.updated_at)}</div>
                  {post.status === 'published' ? <div>Published {formatDate(post.published_at)}</div> : null}
                </div>
                <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                  <Link
                    href={`/dashboard/blog/${post.id}/edit`}
                    className="rounded-md border px-3 py-1.5 text-sm text-gray-900 hover:bg-gray-50"
                  >
                    Edit
                  </Link>
                  <ConfirmDeleteForm
                    action={async (formData: FormData) => {
                      'use server';
                      const token = await getToken();
                      if (!token) redirect('/auth/login');
                      const id = Number(formData.get('id'));
                      try {
                        await api.blogDelete(id, token);
                      } catch {}
                      revalidatePath('/dashboard/blog');
                      redirect('/dashboard/blog?deleted=1');
                    }}
                    id={post.id}
                  />
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <Card>
          <CardBody className="text-center text-sm text-gray-600 space-y-3">
            <p>No posts yet. Use the AI composer or start manually to draft your first story.</p>
            <div className="flex justify-center gap-2">
              <BlogAiComposer generateDraft={generateBlogDraft} />
              <ToolbarButton href="/dashboard/blog/new">Manual post</ToolbarButton>
            </div>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardBody>
          <h2 className="font-medium text-gray-900">Coming soon</h2>
          <p className="mt-2 text-sm text-gray-600">
            Full post editing and publishing controls will land here. For now, content is seeded for demos—reach out if you need additional data.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}

async function generateBlogDraft(input: BlogPostGenerationInput): Promise<
  { ok: true; data: BlogPostGenerationResult } | { ok: false; error: string }
> {
  'use server';
  const token = await getToken();
  if (!token) {
    return { ok: false, error: 'You need to sign in again.' };
  }

  const payload: BlogPostGenerationInput = {
    topic: input.topic.trim(),
    tone: input.tone?.trim() || undefined,
    keywords: (input.keywords || [])
      .map((keyword) => keyword.trim())
      .filter(Boolean)
      .slice(0, 10),
  };

  if (!payload.topic) {
    return { ok: false, error: 'Topic is required.' };
  }

  try {
    const res = await api.blogGenerate(payload, token);
    return { ok: true, data: res.data };
  } catch (err: any) {
    const message = err?.body?.message || err?.message || 'Unable to generate draft. Try again in a moment.';
    return { ok: false, error: message };
  }
}
