// app/dashboard/subscribers/page.tsx
// Every subscriber, one honest table at a time.

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { api, type Subscriber } from '@/app/lib/api';
import { TOKEN_COOKIE_NAME, LEGACY_COOKIE_NAME } from '@/app/lib/cookies';
import { PageHeader, Card, CardHeader, CardBody, Pagination, DataTable, ToolbarButton } from '@/app/dashboard/_components/UI';

async function getToken() {
  const store = await cookies();
  return store.get(TOKEN_COOKIE_NAME)?.value || store.get(LEGACY_COOKIE_NAME)?.value;
}

export default async function SubscribersPage({ searchParams }: { searchParams?: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const token = await getToken();
  if (!token) redirect('/auth/login');

  const me = await api.me(token).catch(() => null);
  if (!me) redirect('/auth/login');

  const sp = (await searchParams) || {};
  const perPage = 25;
  const pageParam = Array.isArray(sp.page) ? sp.page[0] : sp.page;
  const page = Math.max(1, Number.parseInt(pageParam ?? '1', 10) || 1);

  let rows: Subscriber[] = [];
  let total = 0;
  let currentPage = page;
  let lastPage = page;

  try {
    const res = await api.adminListSubscribers(token, { page, per_page: perPage });
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
    <div className="space-y-6">
      <PageHeader
        title="Subscribers"
        subtitle="Your paying customers and plans."
        meta={<span>Showing {rows.length} of {total}</span>}
        actions={<ToolbarButton disabled>Export CSV</ToolbarButton>}
      />

      <Card>
        <CardHeader>
          <Pagination basePath="/dashboard/subscribers" current={currentPage} last={lastPage} />
        </CardHeader>
        <CardBody className="p-0">
          <DataTable columns={[
            { key: 'customer', title: 'Customer' },
            { key: 'email', title: 'Email' },
            { key: 'plan', title: 'Plan' },
            { key: 'status', title: 'Status' },
            { key: 'mrr', title: 'MRR' },
            { key: 'since', title: 'Since' },
            { key: 'actions', title: '', align: 'right' },
          ]}>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-gray-600">No subscribers yet.</td>
              </tr>
            ) : (
              rows.map((r, idx) => (
                <tr key={String(r.id ?? idx)} className="border-t">
                  <td className="px-4 py-3">{r.name ?? '—'}</td>
                  <td className="px-4 py-3">{r.email ?? '—'}</td>
                  <td className="px-4 py-3">{r.plan ?? '—'}</td>
                  <td className="px-4 py-3">{r.status ?? '—'}</td>
                  <td className="px-4 py-3">{r.mrr != null ? `$${r.mrr}` : '—'}</td>
                  <td className="px-4 py-3">{r.start_date ?? r.created_at ?? '—'}</td>
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
