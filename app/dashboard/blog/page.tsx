// app/dashboard/blog/page.tsx
// Blog management surface for subscribers with the blog add-on.

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { api, type BlogPost } from '@/app/lib/api';
import { TOKEN_COOKIE_NAME, LEGACY_COOKIE_NAME } from '@/app/lib/cookies';
import { PageHeader, Card, CardHeader, CardBody, DataTable } from '@/app/dashboard/_components/UI';

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
      <PageHeader
        title="Blog"
        subtitle="Draft, publish, and review posts for your marketing site."
        meta={<span>{posts.length} {posts.length === 1 ? 'post' : 'posts'}</span>}
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
            ]}
          >
            {posts.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-gray-600">
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
                  <td className="px-4 py-3 capitalize">
                    {post.status}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {post.status === 'published' ? formatDate(post.published_at) : '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {formatDate(post.updated_at)}
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
