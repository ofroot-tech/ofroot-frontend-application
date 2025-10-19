// app/dashboard/tenants/page.tsx
// Tenants — the organizations you serve.

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { api, type Tenant } from '@/app/lib/api';
import { TOKEN_COOKIE_NAME, LEGACY_COOKIE_NAME } from '@/app/lib/cookies';
import { PageHeader, Card, CardHeader, CardBody, Pagination, DataTable, ToolbarButton } from '@/app/dashboard/_components/UI';

async function getToken() {
  const store = await cookies();
  return store.get(TOKEN_COOKIE_NAME)?.value || store.get(LEGACY_COOKIE_NAME)?.value;
}

export default async function TenantsPage({ searchParams }: { searchParams?: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const token = await getToken();
  if (!token) redirect('/auth/login');

  const me = await api.me(token).catch(() => null);
  if (!me) redirect('/auth/login');

  const sp = (await searchParams) || {};
  const perPage = 25;
  const pageParam = Array.isArray(sp.page) ? sp.page[0] : sp.page;
  const page = Math.max(1, Number.parseInt(pageParam ?? '1', 10) || 1);

  let rows: Tenant[] = [];
  let total = 0;
  let currentPage = page;
  let lastPage = page;

  try {
    const res = await api.adminListTenants(token, { page, per_page: perPage });
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
        title="Tenants"
        subtitle="Organizations in your system."
        meta={<span>Showing {rows.length} of {total}</span>}
        actions={<ToolbarButton disabled>New Tenant</ToolbarButton>}
      />

      <Card>
        <CardHeader>
          <Pagination basePath="/dashboard/tenants" current={currentPage} last={lastPage} />
        </CardHeader>
        <CardBody className="p-0">
          <DataTable columns={[
            { key: 'name', title: 'Name' },
            { key: 'domain', title: 'Domain' },
            { key: 'plan', title: 'Plan' },
            { key: 'actions', title: '', align: 'right' },
          ]}>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-gray-600">No tenants yet.</td>
              </tr>
            ) : (
              rows.map((t) => (
                <tr key={t.id} className="border-t">
                  <td className="px-4 py-3">{t.name ?? '—'}</td>
                  <td className="px-4 py-3">{t.domain ?? '—'}</td>
                  <td className="px-4 py-3">{t.plan ?? '—'}</td>
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
