import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { api, type Invoice, type Payment, type Quote } from '@/app/lib/api';
import { Card, CardBody, CardHeader, DataTable, KpiCard, PageHeader, ToolbarButton } from '@/app/dashboard/_components/UI';
import { upgradeEditionAction } from '@/app/dashboard/platform-actions';
import { TOKEN_COOKIE_NAME, LEGACY_COOKIE_NAME } from '@/app/lib/cookies';
import { hasEditionAccess } from '@/app/lib/platform-access';
import { listReviewRequests, type ReviewRequestRecord } from '@/app/lib/platform-store';
import { getUserFromSessionToken } from '@/app/lib/supabase-store';

async function getToken() {
  const store = await cookies();
  return store.get(TOKEN_COOKIE_NAME)?.value || store.get(LEGACY_COOKIE_NAME)?.value;
}

const focusAreas = [
  {
    title: 'Billing and invoice operations',
    body: 'Manage invoices, public payment links, and cash-collection workflows from the same shared customer record.',
    href: '/dashboard/billing',
    cta: 'Open billing',
  },
  {
    title: 'Quotes and approvals',
    body: 'Issue quotes, track approvals, and move accepted work into invoicing without rebuilding customer context.',
    href: '/dashboard/quotes',
    cta: 'Open quotes',
  },
  {
    title: 'Payments and collections',
    body: 'Track succeeded, pending, and refunded payments while keeping invoice balances and collections work visible.',
    href: '/dashboard/payments',
    cta: 'Open payments',
  },
  {
    title: 'Reviews and retention',
    body: 'Launch review requests after payment and keep post-service retention work visible in the same platform.',
    href: '/dashboard/reviews',
    cta: 'Open reviews',
  },
];

const sharedPlatformNotes = [
  'Operations run on the same tenant, auth, and billing foundation.',
  'Helpr-created leads can turn into operational customers without migration.',
  'Reminder and follow-up logic can reuse the same automation engine.',
];

async function collectAllPages<T>(
  fetchPage: (page: number, perPage: number) => Promise<{ data?: T[]; meta?: { last_page?: number } } | null>,
  perPage: number = 100,
  maxPages: number = 12
) {
  const items: T[] = [];
  let page = 1;
  let lastPage = 1;

  do {
    const response = await fetchPage(page, perPage);
    if (!response) break;
    items.push(...(response.data || []));
    lastPage = response.meta?.last_page ?? page;
    page += 1;
  } while (page <= lastPage && page <= maxPages);

  return items;
}

function formatMoney(cents: number, currency: string = 'USD') {
  return (cents / 100).toLocaleString(undefined, {
    style: 'currency',
    currency: currency || 'USD',
  });
}

function formatDateTime(value?: string | null) {
  if (!value) return '—';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '—';
  return parsed.toLocaleString();
}

function formatDate(value?: string | null) {
  if (!value) return '—';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '—';
  return parsed.toLocaleDateString();
}

function quoteLabel(quote: Quote) {
  return quote.quote_number || quote.title || `Quote #${quote.id}`;
}

function invoiceLabel(invoice: Invoice) {
  return invoice.number || `Invoice #${invoice.id}`;
}

type OperationsFeedItem = {
  key: string;
  type: 'invoice' | 'payment' | 'quote' | 'review';
  label: string;
  status: string;
  detail: string;
  href: string;
  at: string | null;
};

export default async function OnTaskWorkspacePage() {
  const token = await getToken();
  if (!token) redirect('/auth/login');

  const me = await getUserFromSessionToken(token).catch(() => null);
  if (!me) redirect('/auth/login');

  const hasAccess = hasEditionAccess(me, 'ontask');
  const hasHelprAccess = hasEditionAccess(me, 'helpr');
  const canManageTenant = me.tenant_id != null && ['owner', 'admin'].includes(String(me.top_role || '').trim().toLowerCase());
  const tenantId = me.tenant_id ?? undefined;

  const [
    allInvoices,
    openQuotes,
    successfulPayments,
    recentInvoicesRes,
    recentQuotesRes,
    recentPaymentsRes,
    reviewRequests,
  ] = hasAccess ? await Promise.all([
    collectAllPages<Invoice>((page, perPage) => api.adminListInvoices(token, { page, per_page: perPage }).catch(() => null)),
    collectAllPages<Quote>((page, perPage) => api.adminListQuotes(token, {
      page,
      per_page: perPage,
      status: ['draft', 'sent', 'viewed', 'approved'],
    }).catch(() => null)),
    collectAllPages<Payment>((page, perPage) => api.adminListPayments(token, {
      page,
      per_page: perPage,
      status: 'succeeded',
    }).catch(() => null)),
    api.adminListInvoices(token, { page: 1, per_page: 8 }).catch(() => null),
    api.adminListQuotes(token, { page: 1, per_page: 8 }).catch(() => null),
    api.adminListPayments(token, { page: 1, per_page: 8 }).catch(() => null),
    listReviewRequests({ tenant_id: tenantId }).catch(() => []),
  ]) : [[], [], [], null, null, null, []];

  const outstandingInvoices = allInvoices
    .filter((invoice) => invoice.status !== 'paid' && invoice.status !== 'void' && (invoice.amount_due_cents || 0) > 0)
    .sort((a, b) => {
      const aTime = a.due_date ? new Date(a.due_date).getTime() : Number.MAX_SAFE_INTEGER;
      const bTime = b.due_date ? new Date(b.due_date).getTime() : Number.MAX_SAFE_INTEGER;
      return aTime - bTime;
    })
    .slice(0, 6);
  const openQuoteValueCents = openQuotes.reduce((sum, quote) => sum + (quote.total_cents || 0), 0);
  const outstandingInvoiceValueCents = outstandingInvoices.reduce((sum, invoice) => sum + (invoice.amount_due_cents || 0), 0);
  const collectedPaymentsCents = successfulPayments.reduce((sum, payment) => sum + (payment.amount_cents || 0), 0);
  const pendingReviewCount = reviewRequests.filter((request) => ['draft', 'sent'].includes(request.status)).length;
  const recentFeed = [
    ...(recentInvoicesRes?.data ?? []).map<OperationsFeedItem>((invoice) => ({
      key: `invoice-${invoice.id}`,
      type: 'invoice',
      label: invoiceLabel(invoice),
      status: invoice.status,
      detail: `${formatMoney(invoice.amount_due_cents || 0, invoice.currency)} due`,
      href: `/dashboard/billing/invoices/${invoice.id}`,
      at: invoice.updated_at || invoice.created_at || null,
    })),
    ...(recentQuotesRes?.data ?? []).map<OperationsFeedItem>((quote) => ({
      key: `quote-${quote.id}`,
      type: 'quote',
      label: quoteLabel(quote),
      status: quote.status,
      detail: formatMoney(quote.total_cents || 0, quote.currency || 'USD'),
      href: '/dashboard/quotes',
      at: quote.updated_at || quote.created_at || null,
    })),
    ...(recentPaymentsRes?.data ?? []).map<OperationsFeedItem>((payment) => ({
      key: `payment-${payment.id}`,
      type: 'payment',
      label: `Payment #${payment.id}`,
      status: payment.status,
      detail: formatMoney(payment.amount_cents || 0, payment.currency || 'USD'),
      href: '/dashboard/payments',
      at: payment.updated_at || payment.created_at || null,
    })),
    ...reviewRequests.slice(0, 8).map<OperationsFeedItem>((request: ReviewRequestRecord) => ({
      key: `review-${request.id}`,
      type: 'review',
      label: request.recipient_name || request.recipient_email || `Review request #${request.id}`,
      status: request.status,
      detail: request.review_url ? 'Review link ready' : 'Awaiting destination',
      href: '/dashboard/reviews',
      at: request.updated_at || request.created_at || null,
    })),
  ]
    .sort((a, b) => new Date(b.at || 0).getTime() - new Date(a.at || 0).getTime())
    .slice(0, 8);

  return (
    <div className="space-y-6 reveal-in fade-only">
      <PageHeader
        title="OnTask"
        subtitle="Operations edition on the shared OfRoot platform. Handle billing, execution, and customer operations without duplicating the CRM or tenant model."
        actions={hasAccess ? (
          <div className="flex flex-wrap gap-2">
            <ToolbarButton href="/dashboard/billing">Open billing</ToolbarButton>
            <ToolbarButton href="/dashboard/payments">Open payments</ToolbarButton>
            <ToolbarButton href="/platform?edition=ontask">View positioning</ToolbarButton>
          </div>
        ) : <ToolbarButton href="/subscribe?product=ontask">Start OnTask</ToolbarButton>}
      />

      {hasAccess ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <KpiCard label="Open quote value" value={formatMoney(openQuoteValueCents)} hint={`${openQuotes.length} active quotes`} />
            <KpiCard label="Outstanding invoices" value={formatMoney(outstandingInvoiceValueCents)} hint={`${outstandingInvoices.length} requiring collection`} />
            <KpiCard label="Collected payments" value={formatMoney(collectedPaymentsCents)} hint={`${successfulPayments.length} succeeded payments`} />
            <KpiCard label="Pending reviews" value={pendingReviewCount} hint="Draft and sent review requests" />
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.35fr_1fr]">
            <Card>
              <CardHeader>
                <div>
                  <div className="font-semibold">Collection queue</div>
                  <p className="mt-1 text-sm text-gray-600">Invoices that still need payment or follow-up.</p>
                </div>
              </CardHeader>
              <CardBody className="p-0">
                <DataTable
                  columns={[
                    { key: 'invoice', title: 'Invoice' },
                    { key: 'status', title: 'Status' },
                    { key: 'due_date', title: 'Due date' },
                    { key: 'amount_due', title: 'Amount due' },
                    { key: 'actions', title: '', align: 'right' },
                  ]}
                >
                  {outstandingInvoices.length === 0 ? (
                    <tr>
                      <td className="px-4 py-6 text-center text-gray-600" colSpan={5}>
                        No outstanding invoices right now.
                      </td>
                    </tr>
                  ) : (
                    outstandingInvoices.map((invoice) => (
                      <tr key={invoice.id} className="border-t">
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-950">{invoiceLabel(invoice)}</div>
                          <div className="text-xs text-gray-500">{formatDateTime(invoice.updated_at || invoice.created_at)}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">{invoice.status}</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">{formatDate(invoice.due_date)}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{formatMoney(invoice.amount_due_cents || 0, invoice.currency || 'USD')}</td>
                        <td className="px-4 py-3 text-right">
                          <Link href={`/dashboard/billing/invoices/${invoice.id}`} className="text-sm underline">
                            Open
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </DataTable>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <div>
                  <div className="font-semibold">Recent operational activity</div>
                  <p className="mt-1 text-sm text-gray-600">Latest invoice, payment, quote, and review movement.</p>
                </div>
              </CardHeader>
              <CardBody>
                {recentFeed.length === 0 ? (
                  <p className="text-sm text-gray-600">No OnTask activity yet.</p>
                ) : (
                  <div className="space-y-3">
                    {recentFeed.map((item) => (
                      <Link
                        key={item.key}
                        href={item.href}
                        className="flex items-start justify-between gap-4 rounded-lg border border-gray-200 p-3 hover:border-gray-300"
                      >
                        <div>
                          <div className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">{item.type}</div>
                          <div className="mt-1 font-medium text-gray-950">{item.label}</div>
                          <div className="mt-1 text-sm text-gray-600">{item.detail}</div>
                        </div>
                        <div className="text-right">
                          <div className="rounded-full bg-gray-100 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-700">
                            {item.status}
                          </div>
                          <div className="mt-2 text-xs text-gray-500">{formatDateTime(item.at)}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {focusAreas.map((item) => (
              <Card key={item.title}>
                <CardBody className="space-y-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-950">{item.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-gray-600">{item.body}</p>
                  </div>
                  <Link href={item.href} className="inline-flex rounded-md border px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50">
                    {item.cta}
                  </Link>
                </CardBody>
              </Card>
            ))}
          </div>

          <Card className="border-sky-200 bg-[linear-gradient(145deg,rgba(239,246,255,1),rgba(255,255,255,1)_65%)]">
            <CardBody className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
              <div>
                <h2 className="text-xl font-semibold text-gray-950">What OnTask owns</h2>
                <p className="mt-2 text-sm leading-6 text-gray-700">
                  OnTask is the operations-first workspace. It is where teams manage invoices, payment collection, customer execution, and the systems that turn work into revenue.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <ToolbarButton href="/dashboard/invoices/new">Create invoice</ToolbarButton>
                  <ToolbarButton href="/dashboard/crm/lifecycle">Open lifecycle</ToolbarButton>
                </div>
              </div>
              <div className="rounded-xl border bg-white/80 p-4">
                <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-gray-500">Shared platform advantages</h3>
                <ul className="mt-3 space-y-2 text-sm text-gray-700">
                  {sharedPlatformNotes.map((note) => (
                    <li key={note}>• {note}</li>
                  ))}
                </ul>
              </div>
            </CardBody>
          </Card>
        </>
      ) : (
        hasHelprAccess && canManageTenant ? (
          <Card className="overflow-hidden border-sky-200 bg-[linear-gradient(145deg,rgba(239,246,255,1),rgba(255,255,255,1)_65%,rgba(236,253,245,0.9))]">
            <CardBody className="space-y-5 p-6">
              <div>
                <span className="inline-flex rounded-full border border-sky-300 bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-800">
                  Upgrade available
                </span>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-gray-950">Enable OnTask on this Helpr tenant</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-700">
                  This upgrade keeps the same tenant, shared CRM, and workflow foundation. It adds quotes, payments, review requests, and operational billing surfaces without migration.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <form action={upgradeEditionAction}>
                  <input type="hidden" name="edition" value="ontask" />
                  <input type="hidden" name="seed_templates" value="true" />
                  <input type="hidden" name="refresh_path" value="/dashboard/ontask" />
                  <button type="submit" className="inline-flex rounded-md bg-gray-950 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">
                    Upgrade tenant to OnTask
                  </button>
                </form>
                <ToolbarButton href="/dashboard/helpr">Back to Helpr</ToolbarButton>
              </div>
            </CardBody>
          </Card>
        ) : (
          <LockedEditionCard
            title="Unlock the OnTask workspace"
            body="OnTask is the operations edition for invoices, payment collection, reminders, and day-to-day service workflows on the shared OfRoot platform."
            primaryHref="/subscribe?product=ontask"
            primaryLabel="Start OnTask"
          />
        )
      )}
    </div>
  );
}

function LockedEditionCard({
  title,
  body,
  primaryHref,
  primaryLabel,
}: {
  title: string;
  body: string;
  primaryHref: string;
  primaryLabel: string;
}) {
  return (
    <Card className="overflow-hidden border-amber-200 bg-[linear-gradient(145deg,rgba(255,247,237,1),rgba(255,255,255,1)_65%,rgba(239,246,255,0.9))]">
      <CardBody className="space-y-5 p-6">
        <div>
          <span className="inline-flex rounded-full border border-amber-300 bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-800">
            Edition access required
          </span>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-gray-950">{title}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-700">{body}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ToolbarButton href={primaryHref}>{primaryLabel}</ToolbarButton>
          <ToolbarButton href="/platform?edition=ontask">See platform page</ToolbarButton>
        </div>
      </CardBody>
    </Card>
  );
}
