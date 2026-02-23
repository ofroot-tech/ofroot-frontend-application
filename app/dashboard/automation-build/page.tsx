import Link from 'next/link';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { TOKEN_COOKIE_NAME, LEGACY_COOKIE_NAME } from '@/app/lib/cookies';
import { PageHeader, Card, CardBody } from '@/app/dashboard/_components/UI';
import { getAutomationBuildProgressForToken } from '@/app/lib/automation-progress';
import type { AutomationDeliveryStatus } from '@/app/lib/automation-catalog';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;
type BuildTab = 'timeline' | 'selected' | 'catalog';

async function getToken() {
  const store = await cookies();
  return store.get(TOKEN_COOKIE_NAME)?.value || store.get(LEGACY_COOKIE_NAME)?.value;
}

function chipClass(state: 'complete' | 'current' | 'upcoming') {
  if (state === 'complete') return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  if (state === 'current') return 'bg-amber-100 text-amber-800 border-amber-200';
  return 'bg-gray-100 text-gray-600 border-gray-200';
}

function automationChipClass(status: AutomationDeliveryStatus) {
  if (status === 'online') return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  if (status === 'in_progress') return 'bg-amber-100 text-amber-800 border-amber-200';
  if (status === 'queued') return 'bg-blue-100 text-blue-700 border-blue-200';
  return 'bg-gray-100 text-gray-500 border-gray-200';
}

function automationChipLabel(status: AutomationDeliveryStatus) {
  if (status === 'in_progress') return 'in progress';
  if (status === 'not_selected') return 'not selected';
  return status;
}

export default async function AutomationBuildPage({ searchParams }: { searchParams?: SearchParams }) {
  const token = await getToken();
  if (!token) redirect('/auth/login?next=%2Fdashboard%2Fautomation-build');

  const sp = (await searchParams) || {};
  const submitted = (Array.isArray(sp.submitted) ? sp.submitted[0] : sp.submitted) === '1';
  const requestedTab = Array.isArray(sp.tab) ? sp.tab[0] : sp.tab;
  const tab: BuildTab = requestedTab === 'selected' || requestedTab === 'catalog' ? requestedTab : 'timeline';

  const progress = await getAutomationBuildProgressForToken(token);

  const queryBase = new URLSearchParams();
  if (submitted) queryBase.set('submitted', '1');
  const tabHref = (nextTab: BuildTab) => {
    const next = new URLSearchParams(queryBase);
    if (nextTab !== 'timeline') next.set('tab', nextTab);
    const query = next.toString();
    return query ? `/dashboard/automation-build?${query}` : '/dashboard/automation-build';
  };

  return (
    <div className="space-y-6 reveal-in fade-only">
      <PageHeader
        title="Automation Build"
        subtitle="Track onboarding progress and your selected automation rollout in one place."
      />

      {submitted ? (
        <Card>
          <CardBody>
            <p className="text-sm text-emerald-700">
              Your automation setup was submitted successfully. We have started processing your build.
            </p>
          </CardBody>
        </Card>
      ) : null}

      {!progress.available ? (
        <Card>
          <CardBody>
            <p className="text-sm text-gray-700">
              Progress is temporarily unavailable. {progress.reason || 'Please refresh shortly.'}
            </p>
          </CardBody>
        </Card>
      ) : null}

      {progress.currentStage === 'not_started' ? (
        <Card>
          <CardBody className="space-y-3">
            <p className="text-sm text-gray-700">No automation onboarding submission found for <span className="font-medium">{progress.email}</span>.</p>
            <Link href="/onboarding/automations" className="inline-flex rounded-md bg-[#FF9312] px-4 py-2 text-sm font-semibold text-white hover:bg-[#E07F00]">
              Start onboarding
            </Link>
          </CardBody>
        </Card>
      ) : (
        <Card>
          <CardBody className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs uppercase tracking-wide text-gray-500">Lead ID</span>
              <span className="rounded border px-2 py-0.5 text-xs text-gray-700">{progress.leadId}</span>
              {progress.leadStatus ? (
                <span className="rounded border px-2 py-0.5 text-xs text-gray-700">Status: {progress.leadStatus}</span>
              ) : null}
            </div>
            {progress.lastUpdatedAt ? (
              <p className="text-sm text-gray-600">Last updated: {new Date(progress.lastUpdatedAt).toLocaleString()}</p>
            ) : null}
            {progress.blocked ? (
              <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {progress.blockedReason || 'This build is paused.'}
              </div>
            ) : null}
          </CardBody>
        </Card>
      )}

      <Card>
        <CardBody>
          <div className="inline-flex rounded-md border bg-white p-1">
            <Link
              href={tabHref('timeline')}
              className={`rounded px-3 py-1.5 text-sm ${tab === 'timeline' ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              Build timeline
            </Link>
            <Link
              href={tabHref('selected')}
              className={`rounded px-3 py-1.5 text-sm ${tab === 'selected' ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              Your automations
            </Link>
            <Link
              href={tabHref('catalog')}
              className={`rounded px-3 py-1.5 text-sm ${tab === 'catalog' ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              Automation catalog
            </Link>
          </div>
        </CardBody>
      </Card>

      {tab === 'timeline' ? (
        <Card>
          <CardBody>
            <h2 className="text-sm font-semibold text-gray-900">Build timeline</h2>
            <div className="mt-4 space-y-3">
              {progress.stages.map((stage) => (
                <div key={stage.id} className="rounded-md border border-gray-200 px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{stage.label}</p>
                      <p className="text-sm text-gray-600">{stage.description}</p>
                    </div>
                    <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${chipClass(stage.state)}`}>
                      {stage.state}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      ) : null}

      {tab === 'selected' ? (
        <Card>
          <CardBody>
            <h2 className="text-sm font-semibold text-gray-900">Your selected automations</h2>
            {progress.selectedAutomations.length === 0 ? (
              <p className="mt-3 text-sm text-gray-600">
                No automations selected yet. Complete onboarding to choose the automations you want us to build.
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                {progress.selectedAutomations.map((automation) => (
                  <div key={automation.id} className="rounded-md border border-gray-200 px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{automation.label}</p>
                        <p className="text-sm text-gray-600">{automation.description}</p>
                      </div>
                      <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${automationChipClass(automation.status)}`}>
                        {automationChipLabel(automation.status)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      ) : null}

      {tab === 'catalog' ? (
        <Card>
          <CardBody>
            <h2 className="text-sm font-semibold text-gray-900">Most-used business automations</h2>
            <p className="mt-1 text-sm text-gray-600">
              Grayed items are available options that are not selected in your current build.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {progress.catalogAutomations.map((automation) => (
                <div
                  key={automation.id}
                  className={`rounded-md border px-4 py-3 ${
                    automation.selected
                      ? 'border-gray-200 bg-white text-gray-900'
                      : 'border-gray-200 bg-gray-50 text-gray-500 opacity-65'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium">{automation.label}</p>
                    <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${automationChipClass(automation.status)}`}>
                      {automationChipLabel(automation.status)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm">{automation.description}</p>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      ) : null}

      <Card>
        <CardBody className="space-y-2">
          <h2 className="text-sm font-semibold text-gray-900">Need an update?</h2>
          <p className="text-sm text-gray-600">Book a check-in if you want to review scope, timeline, or launch readiness.</p>
          <Link href="/consulting/book" className="inline-flex rounded-md border px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50">
            Book integration call
          </Link>
        </CardBody>
      </Card>
    </div>
  );
}
