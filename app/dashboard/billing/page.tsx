// app/dashboard/billing/page.tsx
// Billing — invoices, payments, dunning.

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { api, type Invoice, type Tenant, type AdminUser } from '@/app/lib/api';
import { TOKEN_COOKIE_NAME, LEGACY_COOKIE_NAME } from '@/app/lib/cookies';
import { PageHeader, Card, CardBody } from '@/app/dashboard/_components/UI';
import AmountDisplay from './_components/AmountDisplay';
import CreateInvoiceForm from './_components/CreateInvoiceForm';

async function getToken() {
  const store = await cookies();
  return store.get(TOKEN_COOKIE_NAME)?.value || store.get(LEGACY_COOKIE_NAME)?.value;
}

export default async function BillingPage({ searchParams }: { searchParams?: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const token = await getToken();
  if (!token) redirect('/auth/login');

  const me = await api.me(token).catch(() => null);
  if (!me) redirect('/auth/login');

  const sp = (await searchParams) ?? {};
  const pageParam = typeof sp.page === 'string' ? Number(sp.page) : Array.isArray(sp.page) ? Number(sp.page[0]) : 1;
  const perPageParam = typeof sp.per_page === 'string' ? Number(sp.per_page) : Array.isArray(sp.per_page) ? Number(sp.per_page[0]) : 20;
  const statusParam = typeof sp.status === 'string' ? sp.status : Array.isArray(sp.status) ? sp.status[0] : '';
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
  const per_page = Number.isFinite(perPageParam) && perPageParam > 0 ? perPageParam : 20;

  const [list, tenantsRes, usersRes] = await Promise.all([
    api.adminListInvoices(token, { page, per_page }).catch(() => null),
    api.adminListTenants(token).catch(() => null),
    api.adminListUsers(token).catch(() => null),
  ]);
  const invoices: Invoice[] = (list?.data ?? []).filter((i) => !statusParam || i.status === statusParam);
  const meta = list?.meta;
  const tenants: Tenant[] = tenantsRes?.data ?? [];
  const users: AdminUser[] = usersRes?.data ?? [];
  return (
    <div className="space-y-6 reveal-in fade-only">
      <PageHeader title="Billing" subtitle="Invoices, payments, and dunning." />

      <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-700">
        <span className="font-medium text-gray-800">Heads up:</span> Invoice due/overdue reminders are sent automatically on a daily schedule.
        Cadence and send time are configured by the system admin (defaults: 7, 3, 1, 0 days; ~09:00).
        <a href="/docs/invoicing" target="_blank" className="ml-1 underline">View reminder settings</a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-3">
          <CardBody>
            <h2 className="font-medium mb-3">Create Invoice</h2>
            <CreateInvoiceForm tenants={tenants} users={users} />
          </CardBody>
        </Card>
        <Card className="md:col-span-3">
          <CardBody>
            <h2 className="font-medium mb-3">Invoices</h2>
            {/* List controls: per-page and jump-to-page (plain GET forms, no client JS) */}
            <div className="mb-3 flex flex-wrap items-end gap-3 text-sm">
              <form method="get" className="flex items-end gap-2">
                <div>
                  <label className="block text-xs text-gray-600 mb-1" htmlFor="status">Status</label>
                  <select id="status" name="status" defaultValue={statusParam} className="border rounded px-2 py-1">
                    <option value="">All</option>
                    <option value="draft">Draft</option>
                    <option value="sent">Sent</option>
                    <option value="paid">Paid</option>
                    <option value="void">Void</option>
                  </select>
                </div>
                {/* Preserve current pagination when filtering */}
                <input type="hidden" name="per_page" value={String(meta?.per_page ?? per_page)} />
                <input type="hidden" name="page" value={String(meta?.current_page ?? page)} />
                <button type="submit" className="rounded border px-2 py-1 hover:border-black">Filter</button>
              </form>
              <form method="get" className="flex items-end gap-2">
                <div>
                  <label className="block text-xs text-gray-600 mb-1" htmlFor="per_page">Per page</label>
                  <select id="per_page" name="per_page" defaultValue={(meta?.per_page ?? per_page).toString()} className="border rounded px-2 py-1">
                    {[10,20,50].map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
                {/* Preserve current page when changing per_page */}
                <input type="hidden" name="page" value={(meta?.current_page ?? page).toString()} />
                {statusParam && <input type="hidden" name="status" value={statusParam} />}
                <button type="submit" className="rounded border px-2 py-1 hover:border-black">Apply</button>
              </form>

              <form method="get" className="flex items-end gap-2">
                {/* Preserve current per_page when jumping pages */}
                <input type="hidden" name="per_page" value={(meta?.per_page ?? per_page).toString()} />
                {statusParam && <input type="hidden" name="status" value={statusParam} />}
                <div>
                  <label className="block text-xs text-gray-600 mb-1" htmlFor="page">Go to page</label>
                  <input id="page" name="page" type="number" min={1} max={(meta?.last_page ?? Math.ceil((meta?.total ?? 0) / (meta?.per_page ?? per_page))) || 1} defaultValue={(meta?.current_page ?? page).toString()} className="w-24 border rounded px-2 py-1" />
                </div>
                <button type="submit" className="rounded border px-2 py-1 hover:border-black">Go</button>
              </form>
              <div className="ml-auto">
                <a
                  href={`/dashboard/billing/export${statusParam ? `?status=${encodeURIComponent(statusParam)}` : ''}`}
                  className="inline-block rounded border px-2 py-1 hover:border-black"
                >Export CSV</a>
              </div>
            </div>
            {invoices.length === 0 ? (
              <p className="text-sm text-gray-600">No invoices yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500">
                      <th className="px-3 py-2">Number</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2">Amount</th>
                      <th className="px-3 py-2">Due</th>
                      <th className="px-3 py-2">Created</th>
                      <th className="px-3 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((inv) => (
                      <tr key={inv.id} className="border-t">
                        <td className="px-3 py-2 font-mono">
                          {inv.number}
                          {inv.meta && (inv.meta as any).recurring && !('recurring_parent_id' in (inv.meta as any)) && (
                            <span className="ml-2 inline-block text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">Recurring</span>
                          )}
                        </td>
                        <td className="px-3 py-2">{inv.status}</td>
                        <td className="px-3 py-2">
                          <AmountDisplay value={inv.amount_cents / 100} currency={inv.currency ?? 'USD'} />
                        </td>
                        <td className="px-3 py-2">
                          <AmountDisplay value={inv.amount_due_cents / 100} currency={inv.currency ?? 'USD'} />
                        </td>
                        <td className="px-3 py-2">{inv.created_at?.slice(0,10) ?? '—'}</td>
                        <td className="px-3 py-2">
                          <a href={`/dashboard/billing/invoices/${inv.id}`} className="text-blue-600 hover:underline">View</a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {/* Pagination controls */}
            {meta && meta.total > (meta.per_page ?? per_page) && (
              <div className="mt-3 flex items-center justify-between text-sm">
                <div className="text-gray-600">Page {meta.current_page ?? page} of {meta.last_page ?? Math.ceil(meta.total / (meta.per_page ?? per_page))}</div>
                <div className="flex items-center gap-2">
                  <a
                    href={`?page=${Math.max(1, (meta.current_page ?? page) - 1)}&per_page=${meta.per_page ?? per_page}`}
                    className={`px-2 py-1 rounded border ${((meta.current_page ?? page) <= 1) ? 'pointer-events-none opacity-40' : 'hover:border-black'}`}
                    aria-disabled={(meta.current_page ?? page) <= 1}
                  >Prev</a>
                  <a
                    href={`?page=${Math.min((meta.last_page ?? Math.ceil(meta.total / (meta.per_page ?? per_page))), (meta.current_page ?? page) + 1)}&per_page=${meta.per_page ?? per_page}`}
                    className={`px-2 py-1 rounded border ${((meta.current_page ?? page) >= (meta.last_page ?? Math.ceil(meta.total / (meta.per_page ?? per_page)))) ? 'pointer-events-none opacity-40' : 'hover:border-black'}`}
                    aria-disabled={(meta.current_page ?? page) >= (meta.last_page ?? Math.ceil(meta.total / (meta.per_page ?? per_page)))}
                  >Next</a>
                </div>
              </div>
            )}
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <h2 className="font-medium mb-2">Payments</h2>
            <p className="text-sm text-gray-600">None yet.</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <h2 className="font-medium mb-2">Dunning</h2>
            <p className="text-sm text-gray-600">All quiet.</p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
