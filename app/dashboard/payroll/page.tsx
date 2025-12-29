import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import {
  api,
  type PaySchedule,
  type TimeEntry,
  type TimeOffRequest,
  type Employee,
  type BenefitPlan,
  type PayrollAnalytics,
  type TenantBrandSettings,
} from '@/app/lib/api';
import { TOKEN_COOKIE_NAME, LEGACY_COOKIE_NAME } from '@/app/lib/cookies';
import { fetchSupabaseUserByToken } from '@/app/lib/supabase-user';
import { PageHeader, Card, CardHeader, CardBody, DataTable, KpiCard, EmptyState } from '@/app/dashboard/_components/UI';
import { TenantScopePicker } from './_components/TenantScopePicker';
import {
  CreatePayScheduleForm,
  CreatePayrollRunForm,
  TimeEntryActions,
  TimeOffActions,
  CreateEmployeeForm,
  BulkTaxUpdateForm,
  BulkBenefitUpdateForm,
  BrandSettingsForm,
} from './_components/forms';
import RosterCard from './_components/RosterCard';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;
type TrendPoint = PayrollAnalytics['cost_trend'][number];
type AnalyticsRange = PayrollAnalytics['range'];

async function getToken() {
  const store = await cookies();
  return store.get(TOKEN_COOKIE_NAME)?.value || store.get(LEGACY_COOKIE_NAME)?.value || null;
}

function formatDate(value?: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatCurrency(cents?: number | null) {
  if (cents == null) return '—';
  const dollars = cents / 100;
  return dollars.toLocaleString(undefined, { style: 'currency', currency: 'USD' });
}

function analyticsRangeFromParam(value?: string | null): AnalyticsRange {
  if (value === '7d' || value === '90d') return value;
  return '30d';
}

function latestTrendPoint(points?: TrendPoint[]): TrendPoint | null {
  if (!points?.length) return null;
  return points[points.length - 1];
}

export default async function PayrollPage({ searchParams }: { searchParams?: SearchParams }) {
  const token = await getToken();
  if (!token) redirect('/auth/login');

  const me = await fetchSupabaseUserByToken(token);
  if (!me) redirect('/auth/login');

  const sp = (await searchParams) ?? {};
  const tenantParam = Array.isArray(sp.tenant_id) ? sp.tenant_id[0] : sp.tenant_id;
  const analyticsRangeParam = Array.isArray(sp.range) ? sp.range[0] : sp.range;
  const analyticsRange = analyticsRangeFromParam(analyticsRangeParam ?? null);

  const tenantRes = await api.adminListTenants(token, { per_page: 100 }).catch(() => null);
  const tenants = tenantRes?.data ?? [];
  const selectedTenantId = tenantParam ? Number(tenantParam) : tenants[0]?.id;

  const [schedulesRes, timeEntriesRes, timeOffRes, employeesRes, benefitPlansRes, analyticsRes, brandRes] = selectedTenantId
    ? await Promise.all([
        api.payrollListSchedules(token, { tenant_id: selectedTenantId, per_page: 10 }).catch(() => null),
        api
          .payrollListTimeEntries(token, {
            tenant_id: selectedTenantId,
            status: 'pending',
            per_page: 10,
          })
          .catch(() => null),
        api
          .payrollListTimeOffRequests(token, {
            tenant_id: selectedTenantId,
            status: 'pending',
            per_page: 10,
          })
          .catch(() => null),
        api
          .payrollListEmployees(token, {
            tenant_id: selectedTenantId,
            per_page: 25,
            include: ['tax_profile', 'benefits', 'compensation'],
          })
          .catch(() => null),
        api.payrollListBenefitPlans(token, { tenant_id: selectedTenantId, include: ['enrollments'], active: true }).catch(() => null),
        api
          .payrollAnalyticsOverview(token, {
            tenant_id: selectedTenantId,
            range: analyticsRange,
          })
          .catch(() => null),
        api.payrollGetBrandSettings(token, selectedTenantId).catch(() => null),
      ])
    : [null, null, null, null, null, null, null];

  const schedules: PaySchedule[] = schedulesRes?.data ?? [];
  const timeEntries: TimeEntry[] = timeEntriesRes?.data ?? [];
  const timeOffRequests: TimeOffRequest[] = timeOffRes?.data ?? [];
  const employees: Employee[] = employeesRes?.data ?? [];
  const benefitPlans: BenefitPlan[] = benefitPlansRes?.data ?? [];
  const analytics: PayrollAnalytics | null = analyticsRes?.data ?? null;
  const brandSettings: TenantBrandSettings | null = brandRes?.data ?? null;
  const rosterAggregates = (employeesRes?.meta as { aggregates?: Record<string, number> } | undefined)?.aggregates ?? null;

  const activeSchedules = schedules.filter((schedule) => schedule.active).length;
  const pendingEntriesCount = timeEntriesRes?.meta?.total ?? timeEntries.length;
  const pendingTimeOffCount = timeOffRes?.meta?.total ?? timeOffRequests.length;
  const totalEmployees = employees.length;
  const contractors = employees.filter((employee) => employee.employment_type === 'contractor').length;
  const latestTrend = latestTrendPoint(analytics?.cost_trend);
  const benefitEnrollments = benefitPlans.reduce((sum, plan) => sum + (plan.enrollments?.length ?? 0), 0);
  const benefitSpend = benefitPlans.reduce((sum, plan) => {
    const planTotal = plan.enrollments?.reduce((acc, enrollment) => {
      return acc + (enrollment.employee_contribution_cents ?? 0) + (enrollment.employer_contribution_cents ?? 0);
    }, 0);
    return sum + (planTotal ?? 0);
  }, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payroll hub"
        subtitle="Roster, benefits, approvals, and custom branding in one collaborative workspace."
        meta={<TenantScopePicker tenants={tenants} activeTenantId={selectedTenantId ?? null} />}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Headcount" value={totalEmployees || '—'} hint={`${contractors} contractors`} />
        <KpiCard label="Pending time" value={pendingEntriesCount || 0} hint="Hours need review" />
        <KpiCard label="Open PTO" value={pendingTimeOffCount || 0} hint="Awaiting decision" />
        <KpiCard label="Run volume" value={formatCurrency(latestTrend?.gross_cents)} hint={`Range · ${analyticsRange}`} />
      </div>

      {!selectedTenantId ? (
        <Card>
          <CardBody>
            <EmptyState title="Select a tenant" description="Choose a tenant to start orchestrating payroll." />
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-6">
          <RosterCard employees={employees} aggregates={rosterAggregates} />

          <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
            <Card>
              <CardHeader>
                <div>
                  <div className="text-sm font-medium text-gray-800">Pay schedules</div>
                  <p className="text-sm text-gray-500">Anchor cadence, offsets, and next run dates.</p>
                </div>
              </CardHeader>
              <CardBody className="space-y-4">
                {schedules.length === 0 ? (
                  <EmptyState title="No schedules" description="Create your first pay schedule to automate runs." />
                ) : (
                  <DataTable
                    columns={[
                      { key: 'name', title: 'Name' },
                      { key: 'frequency', title: 'Frequency' },
                      { key: 'next', title: 'Next run' },
                      { key: 'last', title: 'Last period end' },
                      { key: 'status', title: 'Status' },
                    ]}
                  >
                    {schedules.map((schedule) => (
                      <tr key={schedule.id} className="border-t">
                        <td className="px-4 py-2 font-medium">{schedule.name}</td>
                        <td className="px-4 py-2 capitalize">{schedule.frequency}</td>
                        <td className="px-4 py-2">{formatDate(schedule.next_run_on)}</td>
                        <td className="px-4 py-2">{formatDate(schedule.last_run_ended_on)}</td>
                        <td className="px-4 py-2">
                          <span
                            className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${
                              schedule.active ? 'border-green-200 bg-green-50 text-green-700' : 'border-gray-200 bg-gray-50 text-gray-600'
                            }`}
                          >
                            {schedule.active ? 'Active' : 'Paused'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </DataTable>
                )}
                <div className="rounded-lg border border-dashed p-4">
                  <h3 className="mb-2 text-sm font-semibold text-gray-800">Add schedule</h3>
                  <CreatePayScheduleForm tenantId={selectedTenantId} />
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <div>
                  <div className="text-sm font-medium text-gray-800">Run payroll</div>
                  <p className="text-sm text-gray-500">Draft, edit, and publish payroll runs with approvals.</p>
                </div>
              </CardHeader>
              <CardBody>
                <CreatePayrollRunForm tenantId={selectedTenantId} schedules={schedules} />
              </CardBody>
            </Card>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
            <Card>
              <CardHeader>
                <div>
                  <div className="text-sm font-medium text-gray-800">Payroll analytics</div>
                  <p className="text-sm text-gray-500">Gross vs. net trend plus run health for the selected range.</p>
                </div>
              </CardHeader>
              <CardBody className="space-y-6">
                {!analytics ? (
                  <EmptyState title="No analytics" description="Run payroll to unlock forecasting." />
                ) : (
                  <>
                    <div className="grid gap-4 md:grid-cols-3">
                      <KpiCard label="Gross" value={formatCurrency(latestTrend?.gross_cents)} hint="Most recent run" />
                      <KpiCard label="Net" value={formatCurrency(latestTrend?.net_cents)} hint="Most recent run" />
                      <KpiCard label="Runs processed" value={analytics.run_health?.processed ?? 0} hint="Within range" />
                    </div>
                    <div className="space-y-3">
                      <div className="text-xs font-semibold text-gray-500">Trend</div>
                      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {analytics.cost_trend.map((point) => (
                          <div key={point.label} className="rounded-lg border border-gray-200 p-3 text-sm">
                            <div className="text-xs text-gray-500">{point.label}</div>
                            <div className="text-base font-semibold text-gray-900">{formatCurrency(point.gross_cents)}</div>
                            <div className="text-xs text-gray-500">Net {formatCurrency(point.net_cents)}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    {analytics.headcount ? (
                      <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 text-sm text-gray-700">
                        <p className="font-semibold text-gray-900">Headcount</p>
                        <p className="text-xs text-gray-500">
                          {analytics.headcount.new_hires} new · {analytics.headcount.terminations} exits · {analytics.headcount.contractors} contractors
                        </p>
                      </div>
                    ) : null}
                  </>
                )}
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <div>
                  <div className="text-sm font-medium text-gray-800">Benefits & enrollments</div>
                  <p className="text-sm text-gray-500">Audit elections and sync with carriers in bulk.</p>
                </div>
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="grid gap-4">
                  <KpiCard label="Active plans" value={benefitPlans.length || '—'} hint={`${benefitEnrollments} enrollments`} />
                  <KpiCard label="Contribution" value={formatCurrency(benefitSpend)} hint="Employee + employer" />
                </div>
                <BulkBenefitUpdateForm tenantId={selectedTenantId} plans={benefitPlans} employees={employees} />
              </CardBody>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <div>
                  <div className="text-sm font-medium text-gray-800">Pending time entries</div>
                  <p className="text-sm text-gray-500">Approve or reject before payroll locks.</p>
                </div>
              </CardHeader>
              <CardBody>
                {timeEntries.length === 0 ? (
                  <EmptyState title="No pending entries" description="Approved hours post to the next draft automatically." />
                ) : (
                  <DataTable
                    columns={[
                      { key: 'employee', title: 'Employee' },
                      { key: 'window', title: 'Window' },
                      { key: 'hours', title: 'Hours' },
                      { key: 'actions', title: 'Actions' },
                    ]}
                  >
                    {timeEntries.map((entry) => (
                      <tr key={entry.id} className="border-t">
                        <td className="px-4 py-2">Employee #{entry.employee_id}</td>
                        <td className="px-4 py-2">
                          {formatDate(entry.started_at)} → {formatDate(entry.ended_at)}
                        </td>
                        <td className="px-4 py-2">{entry.hours.toFixed(2)}</td>
                        <td className="px-4 py-2">
                          <TimeEntryActions entryId={entry.id} tenantId={entry.tenant_id} />
                        </td>
                      </tr>
                    ))}
                  </DataTable>
                )}
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <div>
                  <div className="text-sm font-medium text-gray-800">Time off approvals</div>
                  <p className="text-sm text-gray-500">Stay ahead of PTO liability and leave trends.</p>
                </div>
              </CardHeader>
              <CardBody>
                {timeOffRequests.length === 0 ? (
                  <EmptyState title="No pending PTO" description="Employees have no open requests." />
                ) : (
                  <DataTable
                    columns={[
                      { key: 'employee', title: 'Employee' },
                      { key: 'dates', title: 'Dates' },
                      { key: 'hours', title: 'Hours' },
                      { key: 'actions', title: 'Actions' },
                    ]}
                  >
                    {timeOffRequests.map((request) => (
                      <tr key={request.id} className="border-t">
                        <td className="px-4 py-2">Employee #{request.employee_id}</td>
                        <td className="px-4 py-2">
                          {formatDate(request.start_date)} → {formatDate(request.end_date)}
                        </td>
                        <td className="px-4 py-2">{request.hours.toFixed(1)}</td>
                        <td className="px-4 py-2">
                          <TimeOffActions requestId={request.id} tenantId={request.tenant_id} />
                        </td>
                      </tr>
                    ))}
                  </DataTable>
                )}
              </CardBody>
            </Card>
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            <Card className="xl:col-span-2">
              <CardHeader>
                <div>
                  <div className="text-sm font-medium text-gray-800">People operations</div>
                  <p className="text-sm text-gray-500">Create teammates and keep taxes aligned with compliance.</p>
                </div>
              </CardHeader>
              <CardBody className="grid gap-6 lg:grid-cols-2">
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-gray-800">New hire</h3>
                  <CreateEmployeeForm tenantId={selectedTenantId} />
                </div>
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-gray-800">Bulk tax update</h3>
                  <BulkTaxUpdateForm tenantId={selectedTenantId} employees={employees} />
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <div>
                  <div className="text-sm font-medium text-gray-800">Payroll branding</div>
                  <p className="text-sm text-gray-500">Customize statements, emails, and employee portal visuals.</p>
                </div>
              </CardHeader>
              <CardBody>
                <BrandSettingsForm tenantId={selectedTenantId} defaults={brandSettings} />
              </CardBody>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
