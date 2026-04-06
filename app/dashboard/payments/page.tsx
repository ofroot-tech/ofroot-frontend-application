import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { api, type Invoice, type Payment } from '@/app/lib/api';
import { TOKEN_COOKIE_NAME, LEGACY_COOKIE_NAME } from '@/app/lib/cookies';
import { getUserFromSessionToken } from '@/app/lib/supabase-store';
import { Card, CardBody, CardHeader, DataTable, KpiCard, PageHeader, Pagination, ToolbarButton } from '@/app/dashboard/_components/UI';

async function getToken() {
  const store = await cookies();
  return store.get(TOKEN_COOKIE_NAME)?.value || store.get(LEGACY_COOKIE_NAME)?.value;
}

function formatMoney(cents: number, currency: string) {
  return (cents / 100).toLocaleString(undefined, { style: 'currency', currency: currency || 'USD' });
}

export default async function PaymentsPage({ searchParams }: { searchParams?: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const token = await getToken();
  if (!token) redirect('/auth/login');

  const me = await getUserFromSessionToken(token).catch(() => null);
  if (!me) redirect('/auth/login');

  const sp = (await searchParams) || {};
  const perPage = 25;
  const pageParam = Array.isArray(sp.page) ? sp.page[0] : sp.page;
  const status = (Array.isArray(sp.status) ? sp.status[0] : sp.status) ?? '';
  const invoiceIdParam = (Array.isArray(sp.invoice_id) ? sp.invoice_id[0] : sp.invoice_id) ?? '';
  const page = Math.max(1, Number.parseInt(pageParam ?? '1', 10) || 1);
  const invoiceId = /^\d+$/.test(invoiceIdParam) ? Number(invoiceIdParam) : undefined;

  let rows: Payment[] = [];
  let total = 0;
  let currentPage = page;
  let lastPage = page;

  try {
    const res = await api.adminListPayments(token, {
      page,
      per_page: perPage,
      status: status ? (status as Payment['status']) : undefined,
      invoice_id: invoiceId,
    });
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

  const invoiceIds = Array.from(new Set(rows.map((payment) => payment.invoice_id).filter((value) => Number.isFinite(value))));
  const invoices = await Promise.all(
    invoiceIds.map(async (id) => {
      const invoice = await api.adminGetInvoice(id, token).catch(() => null);
      return [id, invoice?.data || null] as const;
    })
  );
  const invoiceMap = new Map<number, Invoice | null>(invoices);

  const collected = rows.filter((payment) => payment.status === 'succeeded').reduce((sum, payment) => sum + (payment.amount_cents || 0), 0);
  const pending = rows.filter((payment) => payment.status === 'pending').reduce((sum, payment) => sum + (payment.amount_cents || 0), 0);
  const refunded = rows.filter((payment) => payment.status === 'refunded').reduce((sum, payment) => sum + (payment.amount_cents || 0), 0);

  async function refundPaymentAction(formData: FormData) {
    'use server';
    const token = await getToken();
    if (!token) return;
    const paymentId = Number(formData.get('payment_id'));
    const invoiceId = Number(formData.get('invoice_id'));
    if (!Number.isFinite(paymentId)) return;
    await api.adminRefundPayment(token, {
      payment_id: paymentId,
      reason: 'requested_by_customer',
    }).catch(() => null);
    revalidatePath('/dashboard/payments');
    revalidatePath('/dashboard/billing');
    if (Number.isFinite(invoiceId)) {
      revalidatePath(`/dashboard/billing/invoices/${invoiceId}`);
    }
  }

  return (
    <div className="space-y-6 reveal-in fade-only">
      <PageHeader
        title="Payments"
        subtitle="Track collections, pending money, and refunds across the OnTask workspace."
        actions={
          <div className="flex items-center gap-2">
            <ToolbarButton href="/dashboard/billing">Open billing</ToolbarButton>
            <ToolbarButton href="/dashboard/reviews">Open reviews</ToolbarButton>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <KpiCard label="Collected" value={formatMoney(collected, 'USD')} />
        <KpiCard label="Pending" value={formatMoney(pending, 'USD')} />
        <KpiCard label="Refunded" value={formatMoney(refunded, 'USD')} />
      </div>

      <Card>
        <CardHeader>
          <form method="get" action="/dashboard/payments" className="flex w-full flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-wrap items-end gap-2">
              <select name="status" defaultValue={status} className="rounded-md border px-3 py-2 text-sm">
                <option value="">All statuses</option>
                <option value="succeeded">Succeeded</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
              <input name="invoice_id" defaultValue={invoiceIdParam} placeholder="Invoice ID" className="rounded-md border px-3 py-2 text-sm" />
              <button type="submit" className="rounded-md border px-3 py-2 text-sm font-medium hover:border-black">
                Filter
              </button>
            </div>
            <Pagination basePath="/dashboard/payments" current={currentPage} last={lastPage} extraParams={{ status, invoice_id: invoiceIdParam }} />
          </form>
        </CardHeader>
        <CardBody className="p-0">
          <DataTable
            columns={[
              { key: 'created', title: 'Created' },
              { key: 'invoice', title: 'Invoice' },
              { key: 'provider', title: 'Provider' },
              { key: 'amount', title: 'Amount' },
              { key: 'status', title: 'Status' },
              { key: 'method', title: 'Method' },
              { key: 'actions', title: '', align: 'right' },
            ]}
          >
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-gray-600">No payments found.</td>
              </tr>
            ) : (
              rows.map((payment) => {
                const invoice = invoiceMap.get(payment.invoice_id) || null;
                return (
                  <tr key={payment.id} className="border-t align-top">
                    <td className="px-4 py-3 text-sm text-gray-700">{payment.created_at ? new Date(payment.created_at).toLocaleString() : '—'}</td>
                    <td className="px-4 py-3">
                      {invoice ? (
                        <div>
                          <div className="font-medium text-gray-950">{invoice.number}</div>
                          <div className="text-xs text-gray-500">Invoice #{payment.invoice_id}</div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-700">Invoice #{payment.invoice_id}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{payment.provider || 'manual'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{formatMoney(payment.amount_cents || 0, payment.currency || 'USD')}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">{payment.status}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {payment.payment_method_brand || payment.payment_method_type || '—'}
                      {payment.payment_method_last4 ? ` • ${payment.payment_method_last4}` : ''}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex flex-col items-end gap-2 text-sm">
                        {invoice ? (
                          <Link href={`/dashboard/billing/invoices/${payment.invoice_id}`} className="underline">
                            Open invoice
                          </Link>
                        ) : null}
                        {payment.status === 'succeeded' ? (
                          <form action={refundPaymentAction}>
                            <input type="hidden" name="payment_id" value={payment.id} />
                            <input type="hidden" name="invoice_id" value={payment.invoice_id} />
                            <button type="submit" className="underline">
                              Refund
                            </button>
                          </form>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </DataTable>
        </CardBody>
      </Card>
    </div>
  );
}
