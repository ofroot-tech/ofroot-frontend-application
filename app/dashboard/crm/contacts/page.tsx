// app/dashboard/crm/contacts/page.tsx
// Contacts list with basic filters and pagination.

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { api, type Contact } from '@/app/lib/api';
import { TOKEN_COOKIE_NAME, LEGACY_COOKIE_NAME } from '@/app/lib/cookies';
import { fetchSupabaseUserByToken } from '@/app/lib/supabase-user';
import { PageHeader, Card, CardHeader, CardBody, DataTable, Pagination } from '@/app/dashboard/_components/UI';

async function getToken() {
  const store = await cookies();
  return store.get(TOKEN_COOKIE_NAME)?.value || store.get(LEGACY_COOKIE_NAME)?.value;
}

export default async function ContactsPage({ searchParams }: { searchParams?: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const token = await getToken();
  if (!token) redirect('/auth/login');

  const me = await fetchSupabaseUserByToken(token);
  if (!me) redirect('/auth/login');

  const sp = (await searchParams) || {};
  const perPage = 25;
  const pageParam = Array.isArray(sp.page) ? sp.page[0] : sp.page;
  const page = Math.max(1, Number.parseInt(pageParam ?? '1', 10) || 1);
  const q = (Array.isArray(sp.q) ? sp.q[0] : sp.q) ?? '';
  const segment = (Array.isArray(sp.segment) ? sp.segment[0] : sp.segment) ?? '';

  let rows: Contact[] = [];
  let total = 0;
  let currentPage = page;
  let lastPage = page;

  try {
    const res = await api.adminListContacts(token, { page, per_page: perPage, q, segment });
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

  return (
    <div className="space-y-6 reveal-in fade-only">
      <PageHeader
        title="Contacts"
        subtitle="Store customer details and segments."
        meta={<span>Showing {rows.length} of {total}</span>}
      />

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between w-full">
            <div className="flex items-center gap-2">
              <form className="flex items-center gap-2" action="/dashboard/crm/contacts" method="get">
                <input name="q" defaultValue={q} placeholder="Search name, email, phone, company" className="border rounded px-2 py-1 text-sm w-64" />
                <input name="segment" defaultValue={segment} placeholder="Segment (e.g., vip)" className="border rounded px-2 py-1 text-sm w-40" />
                <button className="border rounded px-3 py-1 text-sm">Filter</button>
              </form>
            </div>
            <Pagination basePath="/dashboard/crm/contacts" current={currentPage} last={lastPage} />
          </div>
        </CardHeader>
        <CardBody className="p-0">
          <DataTable columns={[
            { key: 'name', title: 'Name' },
            { key: 'company', title: 'Company' },
            { key: 'contact', title: 'Contact' },
            { key: 'location', title: 'Location' },
            { key: 'segments', title: 'Segments' },
            { key: 'actions', title: 'Actions' },
          ]}>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-600">No contacts yet.</td>
              </tr>
            ) : (
              rows.map((c) => (
                <tr key={c.id} className="border-t">
                  <td className="px-4 py-3">{[c.first_name, c.last_name].filter(Boolean).join(' ') || '—'}</td>
                  <td className="px-4 py-3">{c.company || '—'}</td>
                  <td className="px-4 py-3">{c.email || c.phone || '—'}</td>
                  <td className="px-4 py-3">{[c.city, c.state, c.zip].filter(Boolean).join(', ') || '—'}</td>
                  <td className="px-4 py-3">
                    {(c.segments && c.segments.length > 0) ? (
                      <div className="flex flex-wrap gap-1">
                        {c.segments.map((s) => (
                          <span key={s} className="text-xs rounded-full px-2 py-0.5 bg-gray-100 text-gray-700">{s}</span>
                        ))}
                      </div>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <a href={`/dashboard/crm/contacts/${c.id}`} className="text-blue-600 hover:underline">View</a>
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
