// app/dashboard/invoices/[id]/page.tsx
// Admin: invoice detail with send and record payment actions.

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import Link from 'next/link';
import { api, type Invoice } from '@/app/lib/api';
import { TOKEN_COOKIE_NAME, LEGACY_COOKIE_NAME } from '@/app/lib/cookies';
import { fetchSupabaseUserByToken } from '@/app/lib/supabase-user';
import { PageHeader, Card, CardHeader, CardBody, ToolbarButton } from '@/app/dashboard/_components/UI';

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

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const token = await getToken();
  if (!token) redirect('/auth/login');
  const me = await fetchSupabaseUserByToken(token);
  if (!me) redirect('/auth/login');

  const id = Number((await params).id);
  if (!Number.isFinite(id)) redirect('/dashboard/invoices');

  let invoice: Invoice | null = null;
  try {
    const res = await api.adminGetInvoice(id, token);
    invoice = res.data;
  } catch {
    redirect('/dashboard/invoices');
  }

  async function sendInvoiceAction() {
    'use server';
    const token = await getToken();
    if (!token) return redirect('/auth/login');
    await api.adminSendInvoice(id, token).catch(() => null);
    revalidatePath(`/dashboard/invoices/${id}`);
  }

  async function recordPaymentAction(formData: FormData) {
    'use server';
    const token = await getToken();
    if (!token) return redirect('/auth/login');
    const dollars = Number(formData.get('amount') || 0);
    const amount_cents = Math.max(0, Math.round(dollars * 100));
    const status = String(formData.get('status') || 'succeeded') as any;
    const currency = (invoice?.currency || 'USD');
    await api.adminRecordPayment(id, { amount_cents, currency, status }, token).catch(() => null);
    revalidatePath(`/dashboard/invoices/${id}`);
  }

  return (
    <div className="space-y-6 reveal-in fade-only">
      <PageHeader
        title={`Invoice ${invoice?.number ?? id}`}
        subtitle={`Status: ${invoice?.status ?? '—'}`}
        actions={<Link className="text-sm underline" href="/dashboard/invoices">Back to list</Link>}
      />

      <Card>
        <CardHeader>Summary</CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <div><span className="text-gray-600">Tenant:</span> <span className="font-mono">{invoice?.tenant_id ?? '—'}</span></div>
            <div><span className="text-gray-600">Number:</span> <span className="font-mono">{invoice?.number}</span></div>
            <div><span className="text-gray-600">Amount:</span> {formatMoney(invoice?.amount_cents, invoice?.currency)}</div>
            <div><span className="text-gray-600">Amount paid:</span> {formatMoney(invoice?.amount_paid_cents, invoice?.currency)}</div>
            <div><span className="text-gray-600">Amount due:</span> {formatMoney(invoice?.amount_due_cents, invoice?.currency)}</div>
            <div><span className="text-gray-600">Due date:</span> {invoice?.due_date ? new Date(invoice.due_date).toLocaleDateString() : '—'}</div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>Line items</CardHeader>
        <CardBody>
          {invoice?.items && invoice.items.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600">
                  <th className="px-2 py-1">Description</th>
                  <th className="px-2 py-1">Qty</th>
                  <th className="px-2 py-1">Unit</th>
                  <th className="px-2 py-1">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((it, idx) => (
                  <tr key={idx} className="border-t">
                    <td className="px-2 py-1">{it.description}</td>
                    <td className="px-2 py-1">{it.quantity ?? 1}</td>
                    <td className="px-2 py-1">{formatMoney(it.unit_amount_cents, invoice?.currency)}</td>
                    <td className="px-2 py-1">{formatMoney(it.total_cents, invoice?.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-sm text-gray-600">No items.</div>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>Actions</CardHeader>
        <CardBody className="space-y-4">
          <form action={sendInvoiceAction} className="inline-block">
            <button type="submit" className="inline-flex items-center rounded-md bg-blue-600 text-white px-3 py-2 text-sm hover:bg-blue-500">
              Send invoice
            </button>
          </form>
          <form action={recordPaymentAction} className="grid grid-cols-1 sm:grid-cols-[160px_1fr_100px] items-end gap-3">
            <label className="block">
              <div className="text-sm text-gray-700 mb-1">Amount ({invoice?.currency || 'USD'})</div>
              <input type="number" step="0.01" name="amount" placeholder="0.00" className="w-full border rounded px-3 py-2" />
            </label>
            <label className="block">
              <div className="text-sm text-gray-700 mb-1">Status</div>
              <select name="status" defaultValue="succeeded" className="w-full border rounded px-3 py-2">
                <option value="succeeded">Succeeded</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </label>
            <button type="submit" className="inline-flex items-center rounded-md bg-emerald-600 text-white px-3 py-2 text-sm hover:bg-emerald-500">Record payment</button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
