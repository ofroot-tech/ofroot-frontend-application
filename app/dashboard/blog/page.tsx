// app/dashboard/blog/page.tsx
// Blog management surface for subscribers with the blog add-on.

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { api, type BlogPost } from '@/app/lib/api';
import { TOKEN_COOKIE_NAME, LEGACY_COOKIE_NAME } from '@/app/lib/cookies';
import { PageHeader, Card, CardHeader, CardBody, DataTable, ToolbarButton } from '@/app/dashboard/_components/UI';
import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import { ConfirmDeleteForm } from '@/app/dashboard/blog/_components/ConfirmDeleteForm';
import { SuccessToastFromQuery } from '@/components/SuccessToastFromQuery';

async function getToken() {
  const store = await cookies();
  return store.get(TOKEN_COOKIE_NAME)?.value || store.get(LEGACY_COOKIE_NAME)?.value;
}

function formatDate(value?: string | null) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
}

export default async function BlogAdminPage() {
  const token = await getToken();
  if (!token) redirect('/auth/login');

  let posts: BlogPost[] = [];
  try {
    const res = await api.blogList(token);
    posts = res?.data ?? [];
  } catch {
    posts = [];
  }

  return (
    <div className="space-y-6 reveal-in fade-only">
      <SuccessToastFromQuery param="deleted" message="Post deleted" />
      <PageHeader
        title="Blog"
        subtitle="Draft, publish, and review posts for your marketing site."
        meta={<span>{posts.length} {posts.length === 1 ? 'post' : 'posts'}</span>}
        actions={<ToolbarButton href="/dashboard/blog/new">New Post</ToolbarButton>}
      />

      <Card>
        <CardHeader>
          <div className="text-sm text-gray-600">
            Posts update immediately once published. Drafts stay private until you publish.
          </div>
        </CardHeader>
        <CardBody className="p-0">
          <DataTable
            columns={[
              { key: 'title', title: 'Title' },
              { key: 'status', title: 'Status' },
              { key: 'published_at', title: 'Published' },
              { key: 'updated_at', title: 'Updated' },
              { key: 'actions', title: 'Actions', align: 'right' },
            ]}
          >
            {posts.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-600">
                  No posts yet. Seed data includes a starter guide—run the database seeder to import it.
                </td>
              </tr>
            ) : (
              posts.map((post) => (
                <tr key={post.id} className="border-t">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{post.title}</div>
                    <div className="text-xs text-gray-500">{post.slug}</div>
                  </td>
                  <td className="px-4 py-3">
                    {post.status === 'published' ? (
                      <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 text-xs font-medium">Published</span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-gray-100 text-gray-700 border border-gray-200 px-2.5 py-0.5 text-xs font-medium">Draft</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {post.status === 'published' ? formatDate(post.published_at) : '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {formatDate(post.updated_at)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <Link href={`/dashboard/blog/${post.id}/edit`} className="text-sm rounded-md border px-3 py-1.5 bg-white text-gray-900 hover:bg-gray-50">
                        Edit
                      </Link>
                      {/* Delete server action form */}
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
                  </td>
                </tr>
              ))
            )}
          </DataTable>
        </CardBody>
      </Card>

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
