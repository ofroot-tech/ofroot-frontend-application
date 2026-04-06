import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { api, type Quote, type QuoteStatus } from '@/app/lib/api';
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

function customerLabel(quote: Quote) {
  const contactName = [quote.contact?.first_name, quote.contact?.last_name].filter(Boolean).join(' ').trim();
  if (contactName) return contactName;
  if (quote.contact?.company) return quote.contact.company;
  if (quote.lead?.name) return quote.lead.name;
  return quote.title || `Quote #${quote.id}`;
}

export default async function QuotesPage({ searchParams }: { searchParams?: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const token = await getToken();
  if (!token) redirect('/auth/login');

  const me = await getUserFromSessionToken(token).catch(() => null);
  if (!me) redirect('/auth/login');

  const sp = (await searchParams) || {};
  const perPage = 25;
  const pageParam = Array.isArray(sp.page) ? sp.page[0] : sp.page;
  const q = (Array.isArray(sp.q) ? sp.q[0] : sp.q) ?? '';
  const status = (Array.isArray(sp.status) ? sp.status[0] : sp.status) ?? '';
  const page = Math.max(1, Number.parseInt(pageParam ?? '1', 10) || 1);

  let rows: Quote[] = [];
  let total = 0;
  let currentPage = page;
  let lastPage = page;

  try {
    const res = await api.adminListQuotes(token, {
      page,
      per_page: perPage,
      q,
      status: status ? (status as QuoteStatus) : undefined,
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

  const openValue = rows
    .filter((quote) => ['draft', 'sent', 'viewed', 'approved'].includes(String(quote.status)))
    .reduce((sum, quote) => sum + (quote.total_cents || 0), 0);
  const approvedCount = rows.filter((quote) => quote.status === 'approved').length;
  const convertedCount = rows.filter((quote) => quote.status === 'converted').length;

  async function sendQuoteAction(formData: FormData) {
    'use server';
    const token = await getToken();
    if (!token) return;
    const id = Number(formData.get('quote_id'));
    const email = String(formData.get('email') || '').trim() || undefined;
    if (!Number.isFinite(id)) return;
    await api.adminSendQuote(token, id, email).catch(() => null);
    revalidatePath('/dashboard/quotes');
    revalidatePath('/dashboard/crm/lifecycle');
  }

  async function convertQuoteAction(formData: FormData) {
    'use server';
    const token = await getToken();
    if (!token) return;
    const id = Number(formData.get('quote_id'));
    if (!Number.isFinite(id)) return;
    await api.adminConvertQuoteToInvoice(token, id).catch(() => null);
    revalidatePath('/dashboard/quotes');
    revalidatePath('/dashboard/billing');
    revalidatePath('/dashboard/crm/lifecycle');
  }

  return (
    <div className="space-y-6 reveal-in fade-only">
      <PageHeader
        title="Quotes"
        subtitle="Run estimates and approvals inside the shared lead-to-cash system."
        actions={
          <div className="flex items-center gap-2">
            <ToolbarButton href="/dashboard/billing">Open billing</ToolbarButton>
            <ToolbarButton href="/dashboard/crm/lifecycle">Open lifecycle</ToolbarButton>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <KpiCard label="Quotes in view" value={rows.length} />
        <KpiCard label="Open quote value" value={formatMoney(openValue, 'USD')} />
        <KpiCard label="Approved / converted" value={`${approvedCount} / ${convertedCount}`} />
      </div>

      <Card>
        <CardHeader>
          <form method="get" action="/dashboard/quotes" className="flex w-full flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-1 flex-wrap items-end gap-2">
              <input name="q" defaultValue={q} placeholder="Search quote number, title, customer..." className="w-full max-w-xs rounded-md border px-3 py-2 text-sm" />
              <select name="status" defaultValue={status} className="rounded-md border px-3 py-2 text-sm">
                <option value="">All statuses</option>
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="viewed">Viewed</option>
                <option value="approved">Approved</option>
                <option value="declined">Declined</option>
                <option value="expired">Expired</option>
                <option value="converted">Converted</option>
              </select>
              <button type="submit" className="rounded-md border px-3 py-2 text-sm font-medium hover:border-black">
                Filter
              </button>
            </div>
            <Pagination basePath="/dashboard/quotes" current={currentPage} last={lastPage} extraParams={{ q, status }} />
          </form>
        </CardHeader>
        <CardBody className="p-0">
          <DataTable
            columns={[
              { key: 'quote', title: 'Quote' },
              { key: 'customer', title: 'Customer' },
              { key: 'status', title: 'Status' },
              { key: 'value', title: 'Value' },
              { key: 'valid', title: 'Valid until' },
              { key: 'actions', title: '', align: 'right' },
            ]}
          >
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-600">No quotes found.</td>
              </tr>
            ) : (
              rows.map((quote) => {
                const recipientEmail = quote.contact?.email || quote.lead?.email || '';
                const canConvert = !['declined', 'expired', 'converted'].includes(String(quote.status));
                return (
                  <tr key={quote.id} className="border-t align-top">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-950">{quote.quote_number}</div>
                      <div className="text-xs text-gray-500">{quote.title}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900">{customerLabel(quote)}</div>
                      <div className="text-xs text-gray-500">{recipientEmail || 'No email on file'}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">{quote.status}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{formatMoney(quote.total_cents || 0, quote.currency || 'USD')}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{quote.valid_until ? quote.valid_until.slice(0, 10) : '—'}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex flex-col items-end gap-2 text-sm">
                        {quote.external_id ? (
                          <Link href={`/quotes/${quote.external_id}`} className="underline">
                            Public view
                          </Link>
                        ) : null}
                        {quote.status === 'draft' ? (
                          <form action={sendQuoteAction}>
                            <input type="hidden" name="quote_id" value={quote.id} />
                            <input type="hidden" name="email" value={recipientEmail} />
                            <button type="submit" className="underline">
                              Send quote
                            </button>
                          </form>
                        ) : null}
                        {canConvert ? (
                          <form action={convertQuoteAction}>
                            <input type="hidden" name="quote_id" value={quote.id} />
                            <button type="submit" className="underline">
                              Convert to invoice
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
