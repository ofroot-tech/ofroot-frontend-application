// app/dashboard/invoices/page.tsx
// Admin: list invoices with basic actions and pagination.

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import Link from 'next/link';
import { api, type Invoice } from '@/app/lib/api';
import { TOKEN_COOKIE_NAME, LEGACY_COOKIE_NAME } from '@/app/lib/cookies';
import { PageHeader, Card, CardHeader, CardBody, DataTable, Pagination, ToolbarButton } from '@/app/dashboard/_components/UI';

async function getToken() {
  const store = await cookies();
  return store.get(TOKEN_COOKIE_NAME)?.value || store.get(LEGACY_COOKIE_NAME)?.value;
}

function formatMoney(cents?: number | null, currency?: string) {
  if (cents == null) return '—';
  try {
    const v = (cents || 0) / 100;
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: currency || 'USD' }).format(v);
  } catch {
    return `${(cents || 0) / 100} ${currency || ''}`.trim();
  }
}

export default async function InvoicesPage({ searchParams }: { searchParams?: Promise<{ [k: string]: string | string[] | undefined }> }) {
  const token = await getToken();
  if (!token) redirect('/auth/login');

  // Ensure the token is valid; if not, bounce to login
  await api.me(token).catch(() => redirect('/auth/login'));

  const sp = (await searchParams) || {};
  const perPage = 25;
  const pageParam = Array.isArray(sp.page) ? sp.page[0] : sp.page;
  const page = Math.max(1, Number.parseInt(pageParam ?? '1', 10) || 1);

  let rows: Invoice[] = [];
  let total = 0;
  let currentPage = page;
  let lastPage = page;

  try {
    const res = await api.adminListInvoices(token, { page, per_page: perPage });
    rows = res.data ?? [];
    const meta = res.meta as any;
    total = meta?.total ?? rows.length;
    currentPage = meta?.current_page ?? page;
    lastPage = meta?.last_page ?? Math.max(1, Math.ceil((total || 0) / perPage));
  } catch (e) {
    // If forbidden, redirect to overview gracefully
    redirect('/dashboard/overview');
  }

  return (
    <div className="space-y-6 reveal-in fade-only">
      <PageHeader
        title="Invoices"
        subtitle="Track invoices and payments. Send reminders when needed."
        meta={<span>Showing {rows.length} of {total}</span>}
  actions={<ToolbarButton href="/dashboard/invoices/new">New invoice</ToolbarButton>}
      />

      <Card>
        <CardHeader>
          <Pagination basePath="/dashboard/invoices" current={currentPage} last={lastPage} />
        </CardHeader>
        <CardBody className="p-0">
          <DataTable columns={[
            { key: 'number', title: 'Number' },
            { key: 'tenant', title: 'Tenant' },
            { key: 'amount', title: 'Amount' },
            { key: 'status', title: 'Status' },
            { key: 'due', title: 'Due' },
            { key: 'actions', title: '', align: 'right' },
          ]}>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-600">No invoices yet.</td>
              </tr>
            ) : (
              rows.map((inv) => (
                <tr key={inv.id} className="border-t">
                  <td className="px-4 py-3 font-mono text-xs">{inv.number}</td>
                  <td className="px-4 py-3">{inv.tenant_id ?? '—'}</td>
                  <td className="px-4 py-3">{formatMoney(inv.amount_cents, inv.currency)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs rounded-full px-2 py-0.5 ${inv.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : inv.status === 'void' ? 'bg-gray-200 text-gray-600' : inv.status === 'sent' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">{inv.due_date ? new Date(inv.due_date).toLocaleDateString() : '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/dashboard/invoices/${inv.id}`} className="text-xs underline">View</Link>
                  </td>
                </tr>
              ))
            )}
          </DataTable>
        </CardBody>
      </Card>
    </div>
  );
}
