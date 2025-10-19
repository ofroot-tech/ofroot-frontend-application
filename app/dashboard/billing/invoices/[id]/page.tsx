// app/dashboard/billing/invoices/[id]/page.tsx
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { TOKEN_COOKIE_NAME, LEGACY_COOKIE_NAME } from '@/app/lib/cookies';
import { api, type Invoice, type Tenant, type AdminUser } from '@/app/lib/api';
import { PageHeader, Card, CardBody } from '@/app/dashboard/_components/UI';
import { revalidatePath } from 'next/cache';
import ClientControls from '@/app/dashboard/billing/invoices/[id]/ClientControls';

async function getToken() {
  const store = await cookies();
  return store.get(TOKEN_COOKIE_NAME)?.value || store.get(LEGACY_COOKIE_NAME)?.value;
}

export default async function InvoiceDetailPage({ params }: { params: { id: string } }) {
  const token = await getToken();
  if (!token) redirect('/auth/login');

  const id = Number(params.id);
  if (!Number.isFinite(id)) redirect('/dashboard/billing');

  const [res, tenantsRes, usersRes] = await Promise.all([
    api.adminGetInvoice(id, token).catch(() => null),
    api.adminListTenants(token).catch(() => null),
    api.adminListUsers(token).catch(() => null),
  ]);
  const invoice: Invoice | undefined = res?.data;
  if (!invoice) redirect('/dashboard/billing');
  const tenants: Tenant[] = tenantsRes?.data ?? [];
  const users: AdminUser[] = usersRes?.data ?? [];

  const paid = (invoice.amount_paid_cents ?? 0) / 100;
  const total = (invoice.amount_cents ?? 0) / 100;
  const due = (invoice.amount_due_cents ?? 0) / 100;
  const recurring = (invoice.meta as any)?.recurring as { every?: 'month'|'quarter'|'year'; count?: number; generated?: number } | undefined;
  const isChild = (invoice.meta as any)?.recurring_parent_id != null;

  function computeNextDue(base?: string | null, r?: { every?: 'month'|'quarter'|'year'; generated?: number }) {
    if (!base || !r?.every) return null;
    const d = new Date(base);
    if (Number.isNaN(d.getTime())) return null;
    const n = Math.max(1, Number(r.generated || 1));
    const next = new Date(d.getTime());
    if (r.every === 'year') {
      next.setFullYear(next.getFullYear() + n);
    } else if (r.every === 'quarter') {
      next.setMonth(next.getMonth() + 3 * n);
    } else {
      next.setMonth(next.getMonth() + n);
    }
    return next.toISOString().slice(0,10);
  }
  const nextDue = !isChild ? computeNextDue(invoice.due_date ?? invoice.created_at, recurring) : null;

  return (
    <div className="space-y-6 reveal-in fade-only">
      <PageHeader title={`Invoice ${invoice.number}`} subtitle={`Status: ${invoice.status}`} />
      <div>
        <a href={`/dashboard/billing/invoices/${invoice.id}/print`} target="_blank" className="text-sm text-blue-600 hover:underline">Open print view</a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2">
          <CardBody>
            <ClientControls id={invoice.id} status={invoice.status} amountDue={due} />
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm text-gray-500">Total</div>
                <div className="text-2xl font-semibold">${total.toFixed(2)} {invoice.currency?.toUpperCase()}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Due</div>
                <div className="text-xl font-medium">${due.toFixed(2)}</div>
                {invoice.due_date && <div className="text-xs text-gray-600 mt-1">Due {invoice.due_date.slice(0,10)}</div>}
              </div>
            </div>

            <h3 className="font-medium mt-6 mb-2">Line Items</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500">
                    <th className="px-3 py-2">Description</th>
                    <th className="px-3 py-2">Qty</th>
                    <th className="px-3 py-2">Unit</th>
                    <th className="px-3 py-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items?.map((it) => (
                    <tr key={it.id} className="border-t">
                      <td className="px-3 py-2">{it.description}</td>
                      <td className="px-3 py-2">{it.quantity}</td>
                      <td className="px-3 py-2">${(it.unit_amount_cents/100).toFixed(2)}</td>
                      <td className="px-3 py-2">${(it.total_cents/100).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                      <div className="text-sm text-gray-600 mt-4">Reassign</div>
                      <form action={async (formData) => {
                        'use server';
                        const tokenInner = await getToken();
                        if (!tokenInner) redirect('/auth/login');
                        const tenantVal = (formData.get('tenant_id') ?? '').toString().trim();
                        const userVal = (formData.get('user_id') ?? '').toString().trim();
                        const tenantNum = /^\d+$/.test(tenantVal) ? Number(tenantVal) : undefined;
                        const userNum = /^\d+$/.test(userVal) ? Number(userVal) : undefined;
                        await api.adminUpdateInvoice(invoice.id, {
                          tenant_id: tenantNum,
                          user_id: userNum,
                        } as any, tokenInner);
                        revalidatePath(`/dashboard/billing/invoices/${invoice.id}`);
                      }} className="space-y-2">
                        <select name="tenant_id" defaultValue={invoice.tenant_id ?? ''} className="w-full border rounded px-2 py-1 text-sm">
                          <option value="">—</option>
                          {tenants.map((t) => (
                            <option key={t.id} value={t.id}>{t.name || `Tenant #${t.id}`}</option>
                          ))}
                        </select>
                        <select name="user_id" defaultValue={invoice.user_id ?? ''} className="w-full border rounded px-2 py-1 text-sm">
                          <option value="">—</option>
                          {users.map((u) => (
                            <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                          ))}
                        </select>
                        <button type="submit" className="text-xs px-3 py-1.5 rounded border border-gray-300 hover:border-black">Save</button>
                      </form>
                      <div className="text-sm text-gray-600 mt-4">Payments</div>
                      {invoice.payments && invoice.payments.length > 0 ? (
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="text-left text-gray-500">
                              <th className="py-1">Date</th>
                              <th className="py-1">Amount</th>
                              <th className="py-1">Status</th>
                              <th className="py-1">Provider</th>
                            </tr>
                          </thead>
                          <tbody>
                            {invoice.payments.map((p) => (
                              <tr key={p.id}>
                                <td className="py-1">{p.created_at?.slice(0,10) ?? '—'}</td>
                                <td className="py-1">${(p.amount_cents/100).toFixed(2)} {p.currency?.toUpperCase()}</td>
                                <td className="py-1">{p.status}</td>
                                <td className="py-1">{p.provider ?? '—'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <div className="text-sm text-gray-600">No payments yet.</div>
                      )}
              </table>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="space-y-2">
              <div className="text-sm text-gray-600">Paid</div>
              <div className="text-lg font-medium">${paid.toFixed(2)}</div>
              <div className="text-sm text-gray-600">Created</div>
              <div className="text-sm">{invoice.created_at?.slice(0,10) ?? '—'}</div>
              <div className="text-sm text-gray-600">External ID</div>
              <div className="text-sm">{invoice.external_id ?? '—'}</div>
              <div className="text-sm text-gray-600 mt-4">Payments</div>
              {invoice.payments && invoice.payments.length > 0 ? (
                <ul className="text-sm list-disc ml-4">
                  {invoice.payments.map((p) => (
                    <li key={p.id}>
                      ${(p.amount_cents/100).toFixed(2)} {p.currency?.toUpperCase()} — {p.status} {p.created_at ? `on ${p.created_at.slice(0,10)}` : ''}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-sm text-gray-600">No payments yet.</div>
              )}

              {!isChild && recurring && (
                <div className="mt-6 border-t pt-4">
                  <div className="text-sm text-gray-600">Recurring</div>
                  <div className="text-sm">
                    Every <span className="font-medium">{recurring.every}</span>, for up to <span className="font-medium">{recurring.count ?? '—'}</span> occurrences.
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    Generated so far: {recurring.generated ?? 1} {recurring.count ? `(of ${recurring.count})` : ''}
                  </div>
                  {nextDue && (
                    <div className="text-xs text-gray-600 mt-1">Next copy due on <span className="font-medium">{nextDue}</span> (created by the daily generator)</div>
                  )}
                  <form action={async () => {
                    'use server';
                    const tokenInner = await getToken();
                    if (!tokenInner) redirect('/auth/login');
                    const meta = { ...(invoice.meta as any) };
                    if (meta && 'recurring' in meta) {
                      delete meta.recurring;
                    }
                    await api.adminUpdateInvoice(invoice.id, { meta } as any, tokenInner);
                    revalidatePath(`/dashboard/billing/invoices/${invoice.id}`);
                  }} className="mt-3">
                    <button type="submit" className="text-xs px-3 py-1.5 rounded border border-red-300 text-red-700 hover:border-red-600">Stop recurring</button>
                  </form>
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
