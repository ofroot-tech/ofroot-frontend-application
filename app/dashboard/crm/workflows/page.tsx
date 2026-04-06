import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { api, type Lead } from '@/app/lib/api';
import { installWorkflowTemplateAction } from '@/app/dashboard/platform-actions';
import { TOKEN_COOKIE_NAME, LEGACY_COOKIE_NAME } from '@/app/lib/cookies';
import { hasEditionAccess, PLATFORM_EDITION_CATALOG, type PlatformEdition } from '@/app/lib/platform-access';
import { getUserFromSessionToken } from '@/app/lib/supabase-store';
import { listWorkflowTemplates } from '@/app/lib/workflow-templates';
import { listWorkflowDefinitions } from '@/app/lib/workflows/store';
import {
  Card,
  CardBody,
  CardHeader,
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
  const canManageTemplates = me.tenant_id != null && ['owner', 'admin'].includes(String(me.top_role || '').trim().toLowerCase());
  const workflows = await listWorkflowDefinitions(me.tenant_id ?? null).catch(() => []);
  const templateGroups = (['helpr', 'ontask'] as PlatformEdition[]).map((edition) => ({
    edition,
    catalog: PLATFORM_EDITION_CATALOG[edition],
    enabled: hasEditionAccess(me, edition),
    templates: listWorkflowTemplates(edition),
  }));

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
        actions={
          <div className="flex items-center gap-2">
            <ToolbarButton href="/dashboard/crm/leads">Open leads</ToolbarButton>
            <ToolbarButton href="/dashboard/crm/lifecycle">Open lifecycle</ToolbarButton>
            <ToolbarButton href="/dashboard/automation-build">Open engine</ToolbarButton>
          </div>
        }
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
        <CardHeader>
          <div>
            <div className="font-semibold">Edition workflow templates</div>
            <p className="mt-1 text-sm text-gray-600">Install recommended automations for Helpr and OnTask on the shared tenant workflow engine.</p>
          </div>
        </CardHeader>
        <CardBody className="grid gap-4 lg:grid-cols-2">
          {templateGroups.map((group) => (
            <div key={group.edition} className={`rounded-xl border p-4 ${group.enabled ? 'border-gray-200 bg-white' : 'border-amber-200 bg-amber-50/50'}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">{group.catalog.label}</div>
                  <h2 className="mt-1 text-lg font-semibold text-gray-950">{group.catalog.name}</h2>
                  <p className="mt-2 text-sm leading-6 text-gray-600">{group.catalog.description}</p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${group.enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                  {group.enabled ? 'Enabled' : 'Locked'}
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {group.templates.map((template) => {
                  const installed = workflows.some((workflow) => workflow.name === template.name);
                  return (
                    <div key={template.key} className="rounded-lg border border-gray-200 bg-white p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{template.name}</div>
                          <div className="mt-1 text-sm text-gray-600">{template.description}</div>
                          <div className="mt-2 text-xs uppercase tracking-[0.12em] text-gray-500">Trigger: {template.trigger_type.replace(/\./g, ' ')}</div>
                        </div>
                        {installed ? (
                          <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-800">
                            Installed
                          </span>
                        ) : canManageTemplates && group.enabled ? (
                          <form action={installWorkflowTemplateAction}>
                            <input type="hidden" name="template_key" value={template.key} />
                            <input type="hidden" name="refresh_path" value="/dashboard/crm/workflows" />
                            <button type="submit" className="rounded-md border px-3 py-2 text-sm font-medium hover:border-black">
                              Install
                            </button>
                          </form>
                        ) : (
                          <span className="text-xs text-gray-500">
                            {group.enabled ? 'Owner or admin access required' : 'Enable this edition first'}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <div className="font-semibold">Installed workflows</div>
            <p className="mt-1 text-sm text-gray-600">Live tenant automations currently available to the shared CRM.</p>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          <DataTable
            columns={[
              { key: 'name', title: 'Workflow' },
              { key: 'edition', title: 'Edition' },
              { key: 'trigger', title: 'Trigger' },
              { key: 'status', title: 'Status' },
              { key: 'updated', title: 'Updated' },
            ]}
          >
            {workflows.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-center text-gray-600" colSpan={5}>
                  No workflow definitions installed yet.
                </td>
              </tr>
            ) : (
              workflows.map((workflow) => {
                const matchedEdition = templateGroups.find((group) =>
                  group.templates.some((template) => template.name === workflow.name)
                )?.catalog.name;
                return (
                  <tr key={workflow.id} className="border-t">
                    <td className="px-4 py-3 font-medium text-gray-950">{workflow.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{matchedEdition || 'Shared'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{workflow.trigger_type.replace(/\./g, ' ')}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">{workflow.status}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{new Date(workflow.updated_at).toLocaleString()}</td>
                  </tr>
                );
              })
            )}
          </DataTable>
        </CardBody>
      </Card>

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
