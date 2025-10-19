// app/dashboard/users/page.tsx
// Users — people, roles, last seen.

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { api, type AdminUser } from '@/app/lib/api';
import { TOKEN_COOKIE_NAME, LEGACY_COOKIE_NAME } from '@/app/lib/cookies';
import { PageHeader, Card, CardHeader, CardBody, Pagination, DataTable, ToolbarButton } from '@/app/dashboard/_components/UI';

async function getToken() {
  const store = await cookies();
  return store.get(TOKEN_COOKIE_NAME)?.value || store.get(LEGACY_COOKIE_NAME)?.value;
}

export default async function UsersPage({ searchParams }: { searchParams?: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const token = await getToken();
  if (!token) redirect('/auth/login');

  const me = await api.me(token).catch(() => null);
  if (!me) redirect('/auth/login');

  const sp = (await searchParams) || {};
  const perPage = 25;
  const pageParam = Array.isArray(sp.page) ? sp.page[0] : sp.page;
  const page = Math.max(1, Number.parseInt(pageParam ?? '1', 10) || 1);

  let rows: AdminUser[] = [];
  let total = 0;
  let currentPage = page;
  let lastPage = page;

  try {
    const res = await api.adminListUsers(token, { page, per_page: perPage });
    rows = res.data ?? [];
    total = res.meta?.total ?? rows.length;
    currentPage = res.meta?.current_page ?? page;
    lastPage = res.meta?.last_page ?? Math.max(1, Math.ceil((total || 0) / perPage));
  } catch {
    rows = [];
    total = 0;
    currentPage = 1;
    lastPage = 1;
  }

  return (
    <div className="space-y-6 reveal-in fade-only">
      <PageHeader
        title="Users"
        subtitle="Manage access and roles across your organization."
        meta={<span>Showing {rows.length} of {total}</span>}
        actions={<ToolbarButton disabled>Invite</ToolbarButton>}
      />

      <Card>
        <CardHeader>
          <Pagination basePath="/dashboard/users" current={currentPage} last={lastPage} />
        </CardHeader>
        <CardBody className="p-0">
          <DataTable columns={[
            { key: 'name', title: 'Name' },
            { key: 'email', title: 'Email' },
            { key: 'role', title: 'Role' },
            { key: 'last', title: 'Last seen' },
            { key: 'actions', title: '', align: 'right' },
          ]}>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-600">No users yet.</td>
              </tr>
            ) : (
              rows.map((u) => (
                <tr key={u.id} className="border-t">
                  <td className="px-4 py-3">{u.name}</td>
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3">{u.top_role}</td>
                  <td className="px-4 py-3">—</td>
                  <td className="px-4 py-3 text-right"><button className="text-xs underline">View</button></td>
                </tr>
              ))
            )}
          </DataTable>
        </CardBody>
      </Card>
    </div>
  );
}
