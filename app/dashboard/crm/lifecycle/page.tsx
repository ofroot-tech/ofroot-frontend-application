import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { listCrmLifecycleRecords } from '@/app/lib/crm-lifecycle';
import { TOKEN_COOKIE_NAME, LEGACY_COOKIE_NAME } from '@/app/lib/cookies';
import { getUserFromSessionToken } from '@/app/lib/supabase-store';
import { Card, CardBody, CardHeader, DataTable, PageHeader, ToolbarButton } from '@/app/dashboard/_components/UI';

async function getToken() {
  const store = await cookies();
  return store.get(TOKEN_COOKIE_NAME)?.value || store.get(LEGACY_COOKIE_NAME)?.value;
}

function stageLabel(stage: string) {
  return stage.replace(/_/g, ' ');
}

function formatMoney(cents: number) {
  return (cents / 100).toLocaleString(undefined, { style: 'currency', currency: 'USD' });
}

export default async function CrmLifecyclePage({ searchParams }: { searchParams?: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const token = await getToken();
  if (!token) redirect('/auth/login');

  const me = await getUserFromSessionToken(token).catch(() => null);
  if (!me) redirect('/auth/login');

  const sp = (await searchParams) || {};
  const q = (Array.isArray(sp.q) ? sp.q[0] : sp.q) ?? '';
  const rows = await listCrmLifecycleRecords(token, { q }).catch(() => []);

  const totalDue = rows.reduce((sum, item) => sum + item.amountDueCents, 0);
  const totalPaid = rows.reduce((sum, item) => sum + item.amountPaidCents, 0);
  const activeQuotes = rows.reduce((sum, item) => sum + item.quotes.filter((quote) => ['sent', 'viewed', 'approved'].includes(String(quote.status))).length, 0);

  return (
    <div className="space-y-6 reveal-in fade-only">
      <PageHeader
        title="CRM Lifecycle"
        subtitle="Unified lead-to-cash view across Helpr and OnTask on one shared customer record."
        actions={
          <div className="flex items-center gap-2">
            <ToolbarButton href="/dashboard/crm/leads">Open leads</ToolbarButton>
            <ToolbarButton href="/dashboard/crm/contacts">Open contacts</ToolbarButton>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardBody>
            <div className="text-xs uppercase tracking-[0.12em] text-gray-500">Lifecycle records</div>
            <div className="mt-2 text-2xl font-semibold text-gray-950">{rows.length}</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="text-xs uppercase tracking-[0.12em] text-gray-500">Pipeline due</div>
            <div className="mt-2 text-2xl font-semibold text-gray-950">{formatMoney(totalDue)}</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="text-xs uppercase tracking-[0.12em] text-gray-500">Collected + open quotes</div>
            <div className="mt-2 text-2xl font-semibold text-gray-950">{formatMoney(totalPaid)}</div>
            <div className="mt-1 text-sm text-gray-600">{activeQuotes} active quotes in motion</div>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <form action="/dashboard/crm/lifecycle" method="get" className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <input
              name="q"
              defaultValue={q}
              placeholder="Search customer, email, phone, job, quote, invoice..."
              className="w-full max-w-xl rounded-md border px-3 py-2 text-sm"
            />
            <button type="submit" className="inline-flex rounded-md border px-3 py-2 text-sm font-medium hover:border-black">
              Filter
            </button>
          </form>
        </CardHeader>
        <CardBody className="p-0">
          <DataTable
            columns={[
              { key: 'customer', title: 'Customer' },
              { key: 'stage', title: 'Stage' },
              { key: 'pipeline', title: 'Pipeline state' },
              { key: 'money', title: 'Money' },
              { key: 'next', title: 'Next action' },
              { key: 'actions', title: '', align: 'right' },
            ]}
          >
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-600">No lifecycle records found.</td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.key} className="border-t align-top">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-950">{row.name}</div>
                    <div className="text-xs text-gray-500">{row.email || row.phone || 'No direct contact detail'}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">{stageLabel(row.stage)}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    <div>{row.lead ? `Lead: ${row.lead.status || 'new'}` : 'No lead record'}</div>
                    <div>{row.contact ? `Contact #${row.contact.id}` : 'No contact record'}</div>
                    <div>{row.quotes.length} quotes • {row.jobs.length} jobs • {row.invoices.length} invoices</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    <div>Due: {formatMoney(row.amountDueCents)}</div>
                    <div>Paid: {formatMoney(row.amountPaidCents)}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{row.nextAction}</td>
                  <td className="px-4 py-3 text-right text-sm">
                    <div className="flex flex-col items-end gap-1">
                      {row.lead ? <Link href={`/dashboard/crm/leads/${row.lead.id}`} className="underline">Lead</Link> : null}
                      {row.contact ? <Link href={`/dashboard/crm/contacts/${row.contact.id}`} className="underline">Contact</Link> : null}
                      {row.invoices[0] ? <Link href={`/dashboard/billing/invoices/${row.invoices[0].id}`} className="underline">Invoice</Link> : null}
                    </div>
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
