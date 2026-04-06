import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Card, CardBody, PageHeader, ToolbarButton } from '@/app/dashboard/_components/UI';
import { upgradeEditionAction } from '@/app/dashboard/platform-actions';
import { TOKEN_COOKIE_NAME, LEGACY_COOKIE_NAME } from '@/app/lib/cookies';
import { hasEditionAccess } from '@/app/lib/platform-access';
import { getUserFromSessionToken } from '@/app/lib/supabase-store';

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

export default async function HelprWorkspacePage() {
  const token = await getToken();
  if (!token) redirect('/auth/login');

  const me = await getUserFromSessionToken(token).catch(() => null);
  if (!me) redirect('/auth/login');

  const hasAccess = hasEditionAccess(me, 'helpr');
  const hasOnTaskAccess = hasEditionAccess(me, 'ontask');
  const canManageTenant = me.tenant_id != null && ['owner', 'admin'].includes(String(me.top_role || '').trim().toLowerCase());

  return (
    <div className="space-y-6 reveal-in fade-only">
      <PageHeader
        title="Helpr"
        subtitle="Growth edition on the shared OfRoot platform. Capture demand, route leads, and automate follow-up without splitting the customer lifecycle."
        actions={hasAccess ? <ToolbarButton href="/platform?edition=helpr">View positioning</ToolbarButton> : <ToolbarButton href="/subscribe?product=helpr">Start Helpr</ToolbarButton>}
      />

      {hasAccess ? (
        <>
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
