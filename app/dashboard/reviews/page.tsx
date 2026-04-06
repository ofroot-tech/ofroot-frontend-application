import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { api } from '@/app/lib/api';
import { Card, CardBody, CardHeader, DataTable, KpiCard, PageHeader, ToolbarButton } from '@/app/dashboard/_components/UI';
import { createReviewRequestAction, updateReviewRequestStatusAction } from '@/app/dashboard/platform-actions';
import { TOKEN_COOKIE_NAME, LEGACY_COOKIE_NAME } from '@/app/lib/cookies';
import { listReviewRequests } from '@/app/lib/platform-store';
import { getUserFromSessionToken } from '@/app/lib/supabase-store';

async function getToken() {
  const store = await cookies();
  return store.get(TOKEN_COOKIE_NAME)?.value || store.get(LEGACY_COOKIE_NAME)?.value;
}

export default async function ReviewsPage({ searchParams }: { searchParams?: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const token = await getToken();
  if (!token) redirect('/auth/login');

  const me = await getUserFromSessionToken(token).catch(() => null);
  if (!me) redirect('/auth/login');

  const sp = (await searchParams) || {};
  const status = (Array.isArray(sp.status) ? sp.status[0] : sp.status) ?? '';
  const rows = await listReviewRequests({
    tenant_id: me.tenant_id ?? undefined,
    status: status ? (status as any) : undefined,
  }).catch(() => []);

  const invoiceIds = Array.from(new Set(rows.map((row) => row.invoice_id).filter((value): value is number => value != null)));
  const invoices = await Promise.all(
    invoiceIds.map(async (id) => {
      const invoice = await api.adminGetInvoice(id, token).catch(() => null);
      return [id, invoice?.data || null] as const;
    })
  );
  const invoiceMap = new Map<number, Awaited<(typeof invoices)[number]>[1]>(invoices);

  const draftCount = rows.filter((row) => row.status === 'draft').length;
  const sentCount = rows.filter((row) => row.status === 'sent').length;
  const completedCount = rows.filter((row) => row.status === 'completed').length;

  return (
    <div className="space-y-6 reveal-in fade-only">
      <PageHeader
        title="Reviews"
        subtitle="Run post-payment review requests without leaving the shared tenant record."
        actions={
          <div className="flex items-center gap-2">
            <ToolbarButton href="/dashboard/payments">Open payments</ToolbarButton>
            <ToolbarButton href="/dashboard/crm/lifecycle">Open lifecycle</ToolbarButton>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <KpiCard label="Draft requests" value={draftCount} />
        <KpiCard label="Sent requests" value={sentCount} />
        <KpiCard label="Completed reviews" value={completedCount} />
      </div>

      <Card>
        <CardHeader>
          <div>
            <div className="font-semibold">Create review request</div>
            <p className="mt-1 text-sm text-gray-600">Create manual review outreach or attach it to a specific invoice.</p>
          </div>
        </CardHeader>
        <CardBody>
          <form action={createReviewRequestAction} className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <input type="hidden" name="refresh_path" value="/dashboard/reviews" />
            <input name="recipient_name" placeholder="Customer name" className="rounded-md border px-3 py-2 text-sm" />
            <input name="recipient_email" placeholder="Customer email" className="rounded-md border px-3 py-2 text-sm" />
            <input name="recipient_phone" placeholder="Customer phone" className="rounded-md border px-3 py-2 text-sm" />
            <input name="invoice_id" placeholder="Invoice ID (optional)" className="rounded-md border px-3 py-2 text-sm" />
            <input name="review_url" placeholder="Review URL" defaultValue="https://www.google.com/search?q=leave+a+business+review" className="rounded-md border px-3 py-2 text-sm" />
            <input name="notes" placeholder="Internal notes" className="rounded-md border px-3 py-2 text-sm" />
            <div className="xl:col-span-3">
              <button type="submit" className="rounded-md bg-gray-950 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">
                Create request
              </button>
            </div>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <form method="get" action="/dashboard/reviews" className="flex w-full flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <select name="status" defaultValue={status} className="rounded-md border px-3 py-2 text-sm">
              <option value="">All statuses</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="completed">Completed</option>
              <option value="dismissed">Dismissed</option>
            </select>
            <button type="submit" className="rounded-md border px-3 py-2 text-sm font-medium hover:border-black">
              Filter
            </button>
          </form>
        </CardHeader>
        <CardBody className="p-0">
          <DataTable
            columns={[
              { key: 'recipient', title: 'Recipient' },
              { key: 'source', title: 'Source' },
              { key: 'invoice', title: 'Invoice' },
              { key: 'status', title: 'Status' },
              { key: 'updated', title: 'Updated' },
              { key: 'actions', title: '', align: 'right' },
            ]}
          >
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-600">No review requests found.</td>
              </tr>
            ) : (
              rows.map((row) => {
                const invoice = row.invoice_id ? invoiceMap.get(row.invoice_id) || null : null;
                return (
                  <tr key={row.id} className="border-t align-top">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-950">{row.recipient_name || 'Unknown customer'}</div>
                      <div className="text-xs text-gray-500">{row.recipient_email || row.recipient_phone || 'No delivery detail'}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{row.source.replace(/_/g, ' ')}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {invoice ? (
                        <Link href={`/dashboard/billing/invoices/${invoice.id}`} className="underline">
                          {invoice.number}
                        </Link>
                      ) : row.invoice_id ? (
                        `Invoice #${row.invoice_id}`
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">{row.status}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{new Date(row.updated_at).toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex flex-col items-end gap-2 text-sm">
                        {row.review_url ? (
                          <Link href={row.review_url} className="underline" target="_blank" rel="noreferrer">
                            Open review link
                          </Link>
                        ) : null}
                        {(['draft', 'sent'] as const).map((nextStatus) => (
                          row.status !== nextStatus ? (
                            <form key={nextStatus} action={updateReviewRequestStatusAction}>
                              <input type="hidden" name="review_request_id" value={row.id} />
                              <input type="hidden" name="status" value={nextStatus} />
                              <input type="hidden" name="invoice_id" value={row.invoice_id ?? ''} />
                              <input type="hidden" name="refresh_path" value="/dashboard/reviews" />
                              <button type="submit" className="underline">
                                Mark {nextStatus}
                              </button>
                            </form>
                          ) : null
                        ))}
                        {row.status !== 'completed' ? (
                          <form action={updateReviewRequestStatusAction}>
                            <input type="hidden" name="review_request_id" value={row.id} />
                            <input type="hidden" name="status" value="completed" />
                            <input type="hidden" name="invoice_id" value={row.invoice_id ?? ''} />
                            <input type="hidden" name="refresh_path" value="/dashboard/reviews" />
                            <button type="submit" className="underline">
                              Mark completed
                            </button>
                          </form>
                        ) : null}
                        {row.status !== 'dismissed' ? (
                          <form action={updateReviewRequestStatusAction}>
                            <input type="hidden" name="review_request_id" value={row.id} />
                            <input type="hidden" name="status" value="dismissed" />
                            <input type="hidden" name="invoice_id" value={row.invoice_id ?? ''} />
                            <input type="hidden" name="refresh_path" value="/dashboard/reviews" />
                            <button type="submit" className="underline">
                              Dismiss
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
