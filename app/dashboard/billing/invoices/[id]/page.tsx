// app/dashboard/billing/invoices/[id]/page.tsx
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { TOKEN_COOKIE_NAME, LEGACY_COOKIE_NAME } from '@/app/lib/cookies';
import { api, type Invoice, type Tenant, type AdminUser } from '@/app/lib/api';
import { PageHeader, Card, CardBody } from '@/app/dashboard/_components/UI';
import { LiquidReveal } from '@/app/lib/ui/LiquidReveal';
import { revalidatePath } from 'next/cache';
import ClientControls from '@/app/dashboard/billing/invoices/[id]/ClientControls';
import AmountDisplay from '@/app/dashboard/billing/_components/AmountDisplay';
import CopyInvoiceLinkButton from '@/app/dashboard/billing/invoices/[id]/CopyInvoiceLinkButton';
import PrintButton from '@/app/dashboard/billing/invoices/[id]/PrintButton';
import { saveInvoiceDetailsAction, updateInvoiceStatusAction, sendInvoiceAction, recordPaymentAction, finalizeInvoiceItemsAction, reopenInvoiceItemsAction } from '@/app/dashboard/billing/actions';
import ItemsEditor from '@/app/dashboard/billing/invoices/[id]/ItemsEditor';

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
  const draftItems = (invoice.meta as any)?.items_draft as Array<{ description: string; quantity: number; unit_amount_cents: number }> | undefined;

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
      {(invoice.meta as any)?.finalized_at && (
        <div className="-mt-4">
          <div className="inline-flex items-center gap-2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 text-xs">
            Finalized <span className="opacity-75">{new Date((invoice.meta as any).finalized_at).toISOString().slice(0,10)}</span>
          </div>
        </div>
      )}
      <div className="flex items-center gap-3">
        <a href={`/dashboard/billing/invoices/${invoice.id}/print`} target="_blank" className="text-sm text-blue-600 hover:underline">Open print view</a>
        <PrintButton id={invoice.id} />
        <CopyInvoiceLinkButton id={invoice.id} externalId={invoice.external_id} publicUrl={(invoice.meta as any)?.public_url} />
      </div>

      {/* Status & delivery controls */}
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        <form action={async () => {
          'use server';
          const tokenInner = await getToken();
          if (!tokenInner) redirect('/auth/login');
          await sendInvoiceAction(invoice.id);
          revalidatePath(`/dashboard/billing/invoices/${invoice.id}`);
        }}>
          <button type="submit" className="rounded border px-2 py-1 hover:border-black">Send invoice</button>
        </form>
        <form action={async () => {
          'use server';
          const tokenInner = await getToken();
          if (!tokenInner) redirect('/auth/login');
          await updateInvoiceStatusAction(invoice.id, 'sent');
          revalidatePath(`/dashboard/billing/invoices/${invoice.id}`);
          revalidatePath('/dashboard/billing');
        }}>
          <button type="submit" className="rounded border px-2 py-1 hover:border-black">Mark sent</button>
        </form>
        <form action={async () => {
          'use server';
          const tokenInner = await getToken();
          if (!tokenInner) redirect('/auth/login');
          await updateInvoiceStatusAction(invoice.id, 'void');
          revalidatePath(`/dashboard/billing/invoices/${invoice.id}`);
          revalidatePath('/dashboard/billing');
        }}>
          <button type="submit" className="rounded border border-red-300 text-red-700 px-2 py-1 hover:border-red-600">Void</button>
        </form>
        {/* Record payment */}
        <form action={async (formData) => {
          'use server';
          const tokenInner = await getToken();
          if (!tokenInner) redirect('/auth/login');
          const amountStr = (formData.get('amount_usd') || '').toString();
          const amount = Math.max(0, Number(amountStr || 0));
          const provider = (formData.get('provider') || '').toString() || undefined;
          const reference = (formData.get('reference') || '').toString() || undefined;
          if (amount > 0) {
            await recordPaymentAction(invoice.id, amount, { provider, reference, status: 'succeeded', currency: invoice.currency });
            revalidatePath(`/dashboard/billing/invoices/${invoice.id}`);
            revalidatePath('/dashboard/billing');
          }
        }} className="flex items-center gap-2">
          <label className="inline-flex items-center gap-1">
            <span className="text-gray-600">Payment</span>
            <input name="amount_usd" placeholder="0.00" className="w-24 border rounded px-2 py-1" />
          </label>
          <input name="provider" placeholder="Provider" className="w-28 border rounded px-2 py-1" />
          <input name="reference" placeholder="Reference" className="w-36 border rounded px-2 py-1" />
          <button type="submit" className="rounded border px-2 py-1 hover:border-black">Record</button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2">
          <CardBody>
            <LiquidReveal active={true} className="block">
            <ClientControls id={invoice.id} status={invoice.status} amountDue={due} />
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm text-gray-500">Total</div>
                <div className="text-2xl font-semibold"><AmountDisplay value={total} currency={invoice.currency} /></div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Due</div>
                <div className="text-xl font-medium"><AmountDisplay value={due} currency={invoice.currency} /></div>
                {invoice.due_date && <div className="text-xs text-gray-600 mt-1">Due {invoice.due_date.slice(0,10)}</div>}
              </div>
            </div>

            {/* Quick details editor */}
            <form
              action={async (formData) => {
                'use server';
                const tokenInner = await getToken();
                if (!tokenInner) redirect('/auth/login');
                const due = (formData.get('due_date') || '') as string;
                const notes = (formData.get('notes') || '') as string;
                const every = (formData.get('recurring_every') || '') as string;
                const countRaw = (formData.get('recurring_count') || '') as string;
                const recurring = every ? { every: every as 'month'|'quarter'|'year', count: countRaw ? Number(countRaw) : undefined } : null;
                await saveInvoiceDetailsAction(invoice.id, {
                  due_date: due || null,
                  notes: notes || null,
                  recurring,
                });
              }}
              className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm"
            >
              <div>
                <label className="block text-xs text-gray-600 mb-1">Due date</label>
                <input type="date" name="due_date" defaultValue={invoice.due_date?.slice(0,10) || ''} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-black" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs text-gray-600 mb-1">Notes</label>
                <input type="text" name="notes" placeholder="Private notes…" defaultValue={(invoice.meta as any)?.notes || ''} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-black" />
              </div>
              <div className="md:col-span-3 flex flex-wrap items-end gap-2">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Recurring</label>
                  <select name="recurring_every" defaultValue={(recurring?.every) || ''} className="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-black">
                    <option value="">— none —</option>
                    <option value="month">Every month</option>
                    <option value="quarter">Every quarter</option>
                    <option value="year">Every year</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Max count (optional)</label>
                  <input name="recurring_count" type="number" min={1} defaultValue={(recurring?.count as any) || ''} className="w-28 rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-black" />
                </div>
                <button type="submit" className="text-xs px-3 py-2 rounded-lg border border-gray-300 hover:border-black focus:outline-none focus:ring-2 focus:ring-black focus:border-black">Save details</button>
              </div>
            </form>

            <h3 className="font-medium mt-6 mb-2">Line Items</h3>
            {/* Reminder schedule note */}
            <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 p-3 text-xs">
              <div className="font-medium text-gray-800">Invoice reminders</div>
              <p className="mt-1">
                Customers receive due/overdue reminders automatically on a daily schedule.
                Cadence and send time are configured by the system admin (default offsets: 7, 3, 1, 0 days at ~09:00).
                <a href="/docs/invoicing" target="_blank" className="ml-1 underline">Learn more</a>
              </p>
            </div>

            <LiquidReveal active={true} className="block">
            <ItemsEditor
              invoiceId={invoice.id}
              currency={invoice.currency}
              isReadOnly={Boolean((invoice.meta as any)?.finalized_at) || invoice.status === 'paid' || invoice.status === 'void'}
              items={(draftItems && draftItems.length > 0 ? draftItems : (invoice.items || []).map((it) => ({
                id: it.id,
                description: it.description,
                quantity: it.quantity,
                unit_amount_cents: it.unit_amount_cents,
              })))}
            />
            </LiquidReveal>
            <div className="mt-3 flex items-center gap-2 text-xs">
              <form action={async () => {
                'use server';
                const tokenInner = await getToken();
                if (!tokenInner) redirect('/auth/login');
                await finalizeInvoiceItemsAction(invoice.id);
                revalidatePath(`/dashboard/billing/invoices/${invoice.id}`);
              }}>
                <button type="submit" className="rounded border px-2 py-1 hover:border-black">Finalize items</button>
              </form>
              <form action={async () => {
                'use server';
                const tokenInner = await getToken();
                if (!tokenInner) redirect('/auth/login');
                await reopenInvoiceItemsAction(invoice.id);
                revalidatePath(`/dashboard/billing/invoices/${invoice.id}`);
              }}>
                <button type="submit" className="rounded border px-2 py-1 hover:border-black">Reopen items</button>
              </form>
            </div>

            {/* Reassign form (outside of table for valid DOM) */}
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
              <select name="tenant_id" defaultValue={invoice.tenant_id ?? ''} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black">
                <option value="">—</option>
                {tenants.map((t) => (
                  <option key={t.id} value={t.id}>{t.name || `Tenant #${t.id}`}</option>
                ))}
              </select>
              <select name="user_id" defaultValue={invoice.user_id ?? ''} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black">
                <option value="">—</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                ))}
              </select>
              <button type="submit" className="text-xs px-3 py-2 rounded-lg border border-gray-300 hover:border-black focus:outline-none focus:ring-2 focus:ring-black focus:border-black">Save</button>
            </form>

            {/* Payments table (separate table) */}
            <div className="text-sm text-gray-600 mt-4">Payments</div>
            {invoice.payments && invoice.payments.length > 0 ? (
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-gray-500">
                    <th className="py-1">Date</th>
                    <th className="py-1">Amount</th>
                    <th className="py-1">Status</th>
                    <th className="py-1">Provider</th>
                    <th className="py-1">Reference</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.payments.map((p) => (
                    <tr key={p.id}>
                      <td className="py-1">{p.created_at?.slice(0,10) ?? '—'}</td>
                      <td className="py-1">${(p.amount_cents/100).toFixed(2)} {p.currency?.toUpperCase()}</td>
                      <td className="py-1">{p.status}</td>
                      <td className="py-1">{p.provider ?? '—'}</td>
                      <td className="py-1">{(p as any).provider_payment_id ?? (p as any).provider_charge_id ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-sm text-gray-600">No payments yet.</div>
            )}
            </LiquidReveal>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <LiquidReveal active={true} className="block">
            <div className="space-y-2">
              <div className="text-sm text-gray-600">Paid</div>
              <div className="text-lg font-medium">${paid.toFixed(2)}</div>
              <div className="text-sm text-gray-600">Created</div>
              <div className="text-sm">{invoice.created_at?.slice(0,10) ?? '—'}</div>
              <div className="text-sm text-gray-600">External ID</div>
              <div className="text-sm">{invoice.external_id ?? '—'}</div>
              {(invoice.meta as any)?.notes && (
                <div className="text-sm text-gray-600 mt-4">Notes
                  <div className="text-sm text-gray-800 mt-1">{(invoice.meta as any).notes}</div>
                </div>
              )}
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
            </LiquidReveal>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
