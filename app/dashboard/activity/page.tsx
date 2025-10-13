// app/dashboard/activity/page.tsx
// Cross-application activity feed for super-users.

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { api } from '@/app/lib/api';
import { TOKEN_COOKIE_NAME, LEGACY_COOKIE_NAME } from '@/app/lib/cookies';
import { PageHeader, Card, CardBody, DataTable } from '@/app/dashboard/_components/UI';

async function getToken() {
  const store = await cookies();
  return store.get(TOKEN_COOKIE_NAME)?.value || store.get(LEGACY_COOKIE_NAME)?.value;
}

export default async function ActivityPage({ searchParams }: { searchParams?: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const token = await getToken();
  if (!token) redirect('/auth/login');

  const me = await api.me(token).catch(() => null);
  if (!me) redirect('/auth/login');

  const sp = (await searchParams) || {};
  const type = Array.isArray(sp.type) ? sp.type[0] : sp.type; // e.g. 'users' | 'tenants' | 'billing' | 'system'
  const range = Array.isArray(sp.range) ? sp.range[0] : sp.range; // '7d' | '30d' | '90d'

  // Backend not ready yet; render honest zero state with filtering controls.
  const filters = (
    <div className="flex flex-wrap items-center gap-2">
      <a className={`text-xs rounded-full border px-3 py-1 ${!type ? 'bg-gray-100' : 'bg-white hover:bg-gray-50'}`} href={`/dashboard/activity${range ? `?range=${range}` : ''}`}>All</a>
      {['users','tenants','billing','system'].map((t) => {
        const qs = new URLSearchParams();
        qs.set('type', t);
        if (range) qs.set('range', range);
        return <a key={t} className={`text-xs rounded-full border px-3 py-1 ${type === t ? 'bg-gray-100' : 'bg-white hover:bg-gray-50'}`} href={`/dashboard/activity?${qs.toString()}`}>{t}</a>;
      })}
      <span className="mx-2 text-xs text-gray-400">•</span>
      {(['7d','30d','90d'] as const).map((r) => {
        const qs = new URLSearchParams();
        if (type) qs.set('type', type);
        if (r !== '7d') qs.set('range', r);
        return <a key={r} className={`text-xs rounded-full border px-3 py-1 ${range === r || (!range && r === '7d') ? 'bg-gray-100' : 'bg-white hover:bg-gray-50'}`} href={`/dashboard/activity${qs.toString() ? `?${qs.toString()}` : ''}`}>{r}</a>;
      })}
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Activity" subtitle="All notable events across users, tenants, billing, and system." meta={filters} />

      <Card>
        <CardBody className="p-0">
          <DataTable
            columns={[
              { key: 'time', title: 'Time' },
              { key: 'type', title: 'Type' },
              { key: 'subject', title: 'Subject' },
              { key: 'desc', title: 'Description' },
              { key: 'actor', title: 'Actor' },
            ]}
            scrollY={480}
          >
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-gray-600">No activity yet.</td>
            </tr>
          </DataTable>
        </CardBody>
      </Card>
    </div>
  );
}
