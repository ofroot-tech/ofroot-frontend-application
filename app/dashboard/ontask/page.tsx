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

export default async function OnTaskWorkspacePage() {
  const token = await getToken();
  if (!token) redirect('/auth/login');

  const me = await getUserFromSessionToken(token).catch(() => null);
  if (!me) redirect('/auth/login');

  const hasAccess = hasEditionAccess(me, 'ontask');
  const hasHelprAccess = hasEditionAccess(me, 'helpr');
  const canManageTenant = me.tenant_id != null && ['owner', 'admin'].includes(String(me.top_role || '').trim().toLowerCase());

  return (
    <div className="space-y-6 reveal-in fade-only">
      <PageHeader
        title="OnTask"
        subtitle="Operations edition on the shared OfRoot platform. Handle billing, execution, and customer operations without duplicating the CRM or tenant model."
        actions={hasAccess ? <ToolbarButton href="/platform?edition=ontask">View positioning</ToolbarButton> : <ToolbarButton href="/subscribe?product=ontask">Start OnTask</ToolbarButton>}
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
