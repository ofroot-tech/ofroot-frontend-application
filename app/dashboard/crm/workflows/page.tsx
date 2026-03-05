import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { api, type Lead } from '@/app/lib/api';
import { TOKEN_COOKIE_NAME, LEGACY_COOKIE_NAME } from '@/app/lib/cookies';
import { getUserFromSessionToken } from '@/app/lib/supabase-store';
import {
  Card,
  CardBody,
  KpiCard,
  PageHeader,
  DataTable,
  ToolbarButton,
} from '@/app/dashboard/_components/UI';
import ImportLeadsPanel from './ImportLeadsPanel';

type SourceBucket = 'csv_upload' | 'hubspot' | 'facebook' | 'other' | 'unknown';

async function getToken() {
  const store = await cookies();
  return store.get(TOKEN_COOKIE_NAME)?.value || store.get(LEGACY_COOKIE_NAME)?.value;
}

function sourceBucket(source: string | null | undefined): SourceBucket {
  const s = String(source || '').toLowerCase();
  if (s === 'csv_upload') return 'csv_upload';
  if (s === 'hubspot') return 'hubspot';
  if (s === 'facebook') return 'facebook';
  if (s === 'other') return 'other';
  return 'unknown';
}

function parseDate(value?: string | null) {
  if (!value) return 0;
  const t = new Date(value).getTime();
  return Number.isNaN(t) ? 0 : t;
}

export default async function CrmWorkflowsPage() {
  const token = await getToken();
  if (!token) redirect('/auth/login');

  const me = await getUserFromSessionToken(token).catch(() => null);
  if (!me) redirect('/auth/login');

  const rows: Lead[] = [];
  const perPage = 200;
  let page = 1;
  let lastPage = 1;
  try {
    do {
      const res = await api.adminListLeads(token, { page, per_page: perPage });
      rows.push(...(res.data || []));
      lastPage = res.meta?.last_page ?? page;
      page += 1;
      if (page > 1000) break;
    } while (page <= lastPage);
  } catch {}

  const total = rows.length;
  const statusNew = rows.filter((l) => (l.status || 'new') === 'new').length;
  const statusWon = rows.filter((l) => (l.status || '') === 'won').length;
  const winRate = total > 0 ? ((statusWon / total) * 100).toFixed(1) : '0.0';

  const sourceCounts: Record<SourceBucket, number> = {
    csv_upload: 0,
    hubspot: 0,
    facebook: 0,
    other: 0,
    unknown: 0,
  };
  rows.forEach((l) => {
    sourceCounts[sourceBucket(l.source)] += 1;
  });

  const recent = [...rows]
    .sort((a, b) => parseDate(b.created_at) - parseDate(a.created_at))
    .slice(0, 25);

  return (
    <div className="space-y-6 reveal-in fade-only">
      <PageHeader
        title="CRM Workflows"
        subtitle="Import clients from multiple sources and track lead pipeline metrics."
        actions={<ToolbarButton href="/dashboard/crm/leads">Open leads</ToolbarButton>}
      />

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <KpiCard label="Total leads" value={total} />
        <KpiCard label="New leads" value={statusNew} />
        <KpiCard label="Won leads" value={statusWon} />
        <KpiCard label="Win rate" value={`${winRate}%`} />
        <KpiCard label="HubSpot" value={sourceCounts.hubspot} />
        <KpiCard label="Facebook" value={sourceCounts.facebook} />
      </div>

      <Card>
        <CardBody>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 text-sm">
            <div className="rounded border p-3"><span className="text-gray-500">CSV upload:</span> <span className="font-medium">{sourceCounts.csv_upload}</span></div>
            <div className="rounded border p-3"><span className="text-gray-500">HubSpot:</span> <span className="font-medium">{sourceCounts.hubspot}</span></div>
            <div className="rounded border p-3"><span className="text-gray-500">Facebook:</span> <span className="font-medium">{sourceCounts.facebook}</span></div>
            <div className="rounded border p-3"><span className="text-gray-500">Other:</span> <span className="font-medium">{sourceCounts.other}</span></div>
            <div className="rounded border p-3"><span className="text-gray-500">Unknown:</span> <span className="font-medium">{sourceCounts.unknown}</span></div>
          </div>
        </CardBody>
      </Card>

      <ImportLeadsPanel />

      <Card>
        <CardBody>
          <div className="mb-3 text-sm font-medium">Recent leads</div>
          <DataTable
            columns={[
              { key: 'created', title: 'Created' },
              { key: 'name', title: 'Name' },
              { key: 'contact', title: 'Contact' },
              { key: 'source', title: 'Source' },
              { key: 'status', title: 'Status' },
              { key: 'actions', title: '', align: 'right' },
            ]}
          >
            {recent.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-center text-gray-600" colSpan={6}>
                  No leads found.
                </td>
              </tr>
            ) : (
              recent.map((l) => (
                <tr key={l.id} className="border-t">
                  <td className="px-4 py-3">{l.created_at ? new Date(l.created_at).toLocaleString() : '—'}</td>
                  <td className="px-4 py-3">{l.name || '—'}</td>
                  <td className="px-4 py-3">{l.email || l.phone || '—'}</td>
                  <td className="px-4 py-3">{l.source || '—'}</td>
                  <td className="px-4 py-3">{l.status || 'new'}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/dashboard/crm/leads/${l.id}`} className="text-xs underline">
                      View
                    </Link>
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
