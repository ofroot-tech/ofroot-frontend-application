import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Card, CardBody, CardHeader, DataTable, KpiCard, PageHeader, ToolbarButton } from '@/app/dashboard/_components/UI';
import { upgradeEditionAction } from '@/app/dashboard/platform-actions';
import { TOKEN_COOKIE_NAME, LEGACY_COOKIE_NAME } from '@/app/lib/cookies';
import { hasEditionAccess } from '@/app/lib/platform-access';
import { getUserFromSessionToken, listLeadsPaginated } from '@/app/lib/supabase-store';
import { listWorkflowDefinitions } from '@/app/lib/workflows/store';

async function getToken() {
  const store = await cookies();
  return store.get(TOKEN_COOKIE_NAME)?.value || store.get(LEGACY_COOKIE_NAME)?.value;
}

const focusAreas = [
  {
    title: 'Lead capture surfaces',
    body: 'Launch landing pages and forms that route new demand into the shared customer record from day one.',
    href: '/landing/new',
    cta: 'Build landing page',
  },
  {
    title: 'Lead routing and follow-up',
    body: 'Move inbound leads into the CRM, then automate response speed without creating a second operations stack.',
    href: '/dashboard/crm/leads',
    cta: 'Open leads',
  },
  {
    title: 'Shared workflow engine',
    body: 'Use the same workflow layer for nurture, reminders, routing, and downstream operations handoff.',
    href: '/dashboard/crm/workflows',
    cta: 'Open workflows',
  },
  {
    title: 'Shared CRM lifecycle',
    body: 'See every customer stage from captured lead to paid invoice without splitting records between products.',
    href: '/dashboard/crm/lifecycle',
    cta: 'Open lifecycle',
  },
];

const sharedPlatformNotes = [
  'Leads and customers stay on one shared record.',
  'Growth automations feed the same CRM used by operations.',
  'Tenants, billing, and access remain on one platform model.',
];

function formatDateTime(value?: string | null) {
  if (!value) return '—';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '—';
  return parsed.toLocaleString();
}

function sourceLabel(value?: string | null) {
  const normalized = String(value || '').trim();
  if (!normalized) return 'Unknown';
  return normalized.replace(/[_-]+/g, ' ');
}

async function countLeadsByStatus(tenantId: number | null, status?: string) {
  const res = await listLeadsPaginated({
    page: 1,
    per_page: 1,
    tenant_id: tenantId,
    status,
  }).catch(() => null);
  return res?.meta?.total ?? 0;
}

export default async function HelprWorkspacePage() {
  const token = await getToken();
  if (!token) redirect('/auth/login');

  const me = await getUserFromSessionToken(token).catch(() => null);
  if (!me) redirect('/auth/login');

  const hasAccess = hasEditionAccess(me, 'helpr');
  const hasOnTaskAccess = hasEditionAccess(me, 'ontask');
  const canManageTenant = me.tenant_id != null && ['owner', 'admin'].includes(String(me.top_role || '').trim().toLowerCase());
  const tenantId = me.tenant_id ?? null;

  const [
    workflows,
    totalLeadCount,
    newLeadCount,
    routedLeadCount,
    acceptedLeadCount,
    quotedLeadCount,
    wonLeadCount,
    recentLeadSnapshot,
    sourceSample,
  ] = hasAccess ? await Promise.all([
    listWorkflowDefinitions(tenantId).catch(() => []),
    countLeadsByStatus(tenantId),
    countLeadsByStatus(tenantId, 'new'),
    countLeadsByStatus(tenantId, 'routed'),
    countLeadsByStatus(tenantId, 'accepted'),
    countLeadsByStatus(tenantId, 'quoted'),
    countLeadsByStatus(tenantId, 'won'),
    listLeadsPaginated({ page: 1, per_page: 8, tenant_id: tenantId }).catch(() => null),
    listLeadsPaginated({ page: 1, per_page: 50, tenant_id: tenantId }).catch(() => null),
  ]) : [[], 0, 0, 0, 0, 0, 0, null, null];

  const recentLeads = recentLeadSnapshot?.data ?? [];
  const activeWorkflowCount = workflows.filter((workflow) => workflow.status === 'active').length;
  const responseQueueCount = newLeadCount + routedLeadCount;
  const qualifiedLeadCount = acceptedLeadCount + quotedLeadCount + wonLeadCount;
  const sourceCounts = (sourceSample?.data ?? []).reduce<Record<string, number>>((acc, lead) => {
    const key = sourceLabel(lead.source);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const topSources = Object.entries(sourceCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);
  const recentWorkflows = workflows.slice(0, 5);

  return (
    <div className="space-y-6 reveal-in fade-only">
      <PageHeader
        title="Helpr"
        subtitle="Growth edition on the shared OfRoot platform. Capture demand, route leads, and automate follow-up without splitting the customer lifecycle."
        actions={hasAccess ? (
          <div className="flex flex-wrap gap-2">
            <ToolbarButton href="/dashboard/crm/leads">Open leads</ToolbarButton>
            <ToolbarButton href="/dashboard/crm/workflows">Open workflows</ToolbarButton>
            <ToolbarButton href="/platform?edition=helpr">View positioning</ToolbarButton>
          </div>
        ) : <ToolbarButton href="/subscribe?product=helpr">Start Helpr</ToolbarButton>}
      />

      {hasAccess ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <KpiCard label="Captured leads" value={totalLeadCount} hint="Shared tenant lead volume" />
            <KpiCard label="Needs response" value={responseQueueCount} hint="New and routed leads" />
            <KpiCard label="Qualified pipeline" value={qualifiedLeadCount} hint="Accepted, quoted, and won" />
            <KpiCard label="Active workflows" value={activeWorkflowCount} hint={`${workflows.length} installed for this tenant`} />
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.45fr_1fr]">
            <Card>
              <CardHeader>
                <div>
                  <div className="font-semibold">Recent inbound activity</div>
                  <p className="mt-1 text-sm text-gray-600">Latest captured leads inside the Helpr workspace.</p>
                </div>
              </CardHeader>
              <CardBody className="p-0">
                <DataTable
                  columns={[
                    { key: 'created', title: 'Created' },
                    { key: 'lead', title: 'Lead' },
                    { key: 'service', title: 'Service' },
                    { key: 'source', title: 'Source' },
                    { key: 'status', title: 'Status' },
                    { key: 'actions', title: '', align: 'right' },
                  ]}
                >
                  {recentLeads.length === 0 ? (
                    <tr>
                      <td className="px-4 py-6 text-center text-gray-600" colSpan={6}>
                        No Helpr leads captured yet.
                      </td>
                    </tr>
                  ) : (
                    recentLeads.map((lead) => (
                      <tr key={lead.id} className="border-t align-top">
                        <td className="px-4 py-3 text-sm text-gray-700">{formatDateTime(lead.created_at)}</td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-950">{lead.name || 'Unknown lead'}</div>
                          <div className="text-xs text-gray-500">{lead.email || lead.phone || 'No contact detail'}</div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">{lead.service || '—'}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{sourceLabel(lead.source)}</td>
                        <td className="px-4 py-3">
                          <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                            {lead.status || 'new'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link href={`/dashboard/crm/leads/${lead.id}`} className="text-sm underline">
                            Open
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </DataTable>
              </CardBody>
            </Card>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <div>
                    <div className="font-semibold">Workflow coverage</div>
                    <p className="mt-1 text-sm text-gray-600">Installed Helpr automations on the shared engine.</p>
                  </div>
                </CardHeader>
                <CardBody className="space-y-3">
                  {recentWorkflows.length === 0 ? (
                    <div className="text-sm text-gray-600">
                      No workflows installed yet. Add Helpr templates to activate routing and follow-up.
                    </div>
                  ) : (
                    recentWorkflows.map((workflow) => (
                      <div key={workflow.id} className="rounded-lg border border-gray-200 p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="font-medium text-gray-950">{workflow.name}</div>
                            <div className="mt-1 text-xs uppercase tracking-[0.12em] text-gray-500">
                              {workflow.trigger_type.replace(/\./g, ' ')}
                            </div>
                          </div>
                          <span className="rounded-full bg-gray-100 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-700">
                            {workflow.status}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                  <Link href="/dashboard/crm/workflows" className="inline-flex text-sm font-medium underline">
                    Manage workflows
                  </Link>
                </CardBody>
              </Card>

              <Card>
                <CardHeader>
                  <div>
                    <div className="font-semibold">Recent source mix</div>
                    <p className="mt-1 text-sm text-gray-600">Latest 50 leads by acquisition source.</p>
                  </div>
                </CardHeader>
                <CardBody>
                  {topSources.length === 0 ? (
                    <p className="text-sm text-gray-600">No recent source data yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {topSources.map(([source, count]) => (
                        <div key={source} className="flex items-center justify-between gap-4 text-sm">
                          <span className="text-gray-700">{source}</span>
                          <span className="font-medium text-gray-950">{count}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardBody>
              </Card>
            </div>
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

          <Card className="border-emerald-200 bg-[linear-gradient(145deg,rgba(236,253,245,1),rgba(255,255,255,1)_65%)]">
            <CardBody className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
              <div>
                <h2 className="text-xl font-semibold text-gray-950">What Helpr owns</h2>
                <p className="mt-2 text-sm leading-6 text-gray-700">
                  Helpr is the acquisition-first workspace. It is where teams launch landing pages, capture inbound demand, route leads, and track response performance.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <ToolbarButton href="/dashboard/competitive-analysis">Run crawl benchmark</ToolbarButton>
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

          {!hasOnTaskAccess ? (
            <Card className="border-sky-200 bg-[linear-gradient(145deg,rgba(239,246,255,1),rgba(255,255,255,1)_70%)]">
              <CardBody className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-950">Upgrade this tenant into OnTask</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
                    Keep the same tenant, CRM records, and workflows, then unlock quotes, payments, review requests, and invoice collection from the same customer record.
                  </p>
                </div>
                {canManageTenant ? (
                  <form action={upgradeEditionAction}>
                    <input type="hidden" name="edition" value="ontask" />
                    <input type="hidden" name="seed_templates" value="true" />
                    <input type="hidden" name="refresh_path" value="/dashboard/helpr" />
                    <button type="submit" className="inline-flex rounded-md bg-gray-950 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">
                      Enable OnTask
                    </button>
                  </form>
                ) : (
                  <p className="text-sm text-gray-600">A tenant owner or admin can enable OnTask from this workspace.</p>
                )}
              </CardBody>
            </Card>
          ) : null}
        </>
      ) : (
        <LockedEditionCard
          title="Unlock the Helpr workspace"
          body="Helpr is the growth edition for landing pages, inbound lead capture, routing, and nurture workflows on the shared OfRoot platform."
          primaryHref="/subscribe?product=helpr"
          primaryLabel="Start Helpr"
        />
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
    <Card className="overflow-hidden border-amber-200 bg-[linear-gradient(145deg,rgba(255,247,237,1),rgba(255,255,255,1)_65%,rgba(240,253,250,0.9))]">
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
          <ToolbarButton href="/platform?edition=helpr">See platform page</ToolbarButton>
        </div>
      </CardBody>
    </Card>
  );
}
