// app/dashboard/crm/leads/page.tsx
// Leads list with basic filters and pagination.

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { api, type Lead } from '@/app/lib/api';
import { TOKEN_COOKIE_NAME, LEGACY_COOKIE_NAME } from '@/app/lib/cookies';
import { PageHeader, Card, CardHeader, CardBody, DataTable, Pagination } from '@/app/dashboard/_components/UI';

async function getToken() {
  const store = await cookies();
  return store.get(TOKEN_COOKIE_NAME)?.value || store.get(LEGACY_COOKIE_NAME)?.value;
}

export default async function LeadsPage({ searchParams }: { searchParams?: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const token = await getToken();
  if (!token) redirect('/auth/login');

  const me = await api.me(token).catch(() => null);
  if (!me) redirect('/auth/login');

  const sp = (await searchParams) || {};
  const perPage = 25;
  const pageParam = Array.isArray(sp.page) ? sp.page[0] : sp.page;
  const page = Math.max(1, Number.parseInt(pageParam ?? '1', 10) || 1);
  const q = (Array.isArray(sp.q) ? sp.q[0] : sp.q) ?? '';
  const status = (Array.isArray(sp.status) ? sp.status[0] : sp.status) ?? '';

  let rows: Lead[] = [];
  let total = 0;
  let currentPage = page;
  let lastPage = page;

  try {
    const res = await api.adminListLeads(token, { page, per_page: perPage, q, status });
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

  async function convertLeadAction(formData: FormData) {
    'use server';
    const token = await getToken();
    if (!token) return;
    const id = Number(formData.get('lead_id'));
    try {
      await api.adminConvertLead(id, token);
    } catch {}
    revalidatePath('/dashboard/crm/leads');
  }

  return (
    <div className="space-y-6 reveal-in fade-only">
      <PageHeader
        title="Leads"
        subtitle="Track inbound inquiries through your pipeline."
        meta={<span>Showing {rows.length} of {total}</span>}
      />

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between w-full">
            <div className="flex items-center gap-2">
              <form className="flex items-center gap-2" action="/dashboard/crm/leads" method="get">
                <input name="q" defaultValue={q} placeholder="Search name, email, phone, service" className="border rounded px-2 py-1 text-sm w-64" />
                <select name="status" defaultValue={status} className="border rounded px-2 py-1 text-sm">
                  <option value="">Any status</option>
                  <option value="new">New</option>
                  <option value="routed">Routed</option>
                  <option value="accepted">Accepted</option>
                  <option value="failed">Failed</option>
                  <option value="quoted">Quoted</option>
                  <option value="won">Won</option>
                  <option value="lost">Lost</option>
                </select>
                <button className="border rounded px-3 py-1 text-sm">Filter</button>
              </form>
            </div>
            <Pagination basePath="/dashboard/crm/leads" current={currentPage} last={lastPage} />
          </div>
        </CardHeader>
        <CardBody className="p-0">
          <DataTable columns={[
            { key: 'when', title: 'Created' },
            { key: 'name', title: 'Name' },
            { key: 'contact', title: 'Contact' },
            { key: 'service', title: 'Service' },
            { key: 'zip', title: 'ZIP' },
            { key: 'status', title: 'Status' },
            { key: 'actions', title: '', align: 'right' },
          ]}>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-gray-600">No leads yet.</td>
              </tr>
            ) : (
              rows.map((l) => (
                <tr key={l.id} className="border-t">
                  <td className="px-4 py-3">{l.created_at ? new Date(l.created_at).toLocaleString() : '—'}</td>
                  <td className="px-4 py-3">{l.name || '—'}</td>
                  <td className="px-4 py-3">{l.email || l.phone || '—'}</td>
                  <td className="px-4 py-3">{l.service}</td>
                  <td className="px-4 py-3">{l.zip}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs rounded-full px-2 py-0.5 bg-gray-100 text-gray-700">{l.status || 'new'}</span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-3">
                    <a className="text-xs underline" href={`/dashboard/crm/leads/${l.id}`}>View</a>
                    <form action={convertLeadAction} className="inline-flex items-center gap-2">
                      <input type="hidden" name="lead_id" value={l.id} />
                      <button type="submit" className="text-xs underline">Convert to contact</button>
                    </form>
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
