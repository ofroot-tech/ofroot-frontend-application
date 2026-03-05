import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { PageHeader, Card, CardBody } from '@/app/dashboard/_components/UI';
import { TOKEN_COOKIE_NAME, LEGACY_COOKIE_NAME } from '@/app/lib/cookies';
import {
  listRecentFeatureRequests,
  getAutomationFunnelSummary,
  getUserFromSessionToken,
  listRecentLlcUpsellOpportunities,
  listRecentAutomationAbandonments,
  listRecentAutomationOnboardingLeads,
} from '@/app/lib/supabase-store';
import {
  getAutomationCatalogItem,
  isAutomationCatalogId,
  type AutomationCatalogId,
} from '@/app/lib/automation-catalog';

const OWNER_EMAIL_FALLBACK = 'dimitri.mcdaniel@gmail.com';

function canViewOwnerFunnel(email?: string | null) {
  const normalized = String(email || '').trim().toLowerCase();
  if (!normalized) return false;

  const allow = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  const ownerEmail = String(process.env.COMPANY_OWNER_EMAIL || OWNER_EMAIL_FALLBACK).trim().toLowerCase();
  return normalized === ownerEmail || allow.includes(normalized);
}

function formatDateTime(value?: string | null) {
  if (!value) return '-';
  return new Date(value).toLocaleString();
}

function formatSelectedAutomations(meta: Record<string, unknown> | null | undefined) {
  const services = (meta?.automation_services || {}) as Record<string, unknown>;
  const selectedRaw = Array.isArray(services?.selected_automations)
    ? services.selected_automations
    : [];

  const selected: AutomationCatalogId[] = [];
  for (const raw of selectedRaw) {
    const id = String(raw);
    if (isAutomationCatalogId(id) && !selected.includes(id)) selected.push(id);
  }

  if (selected.length === 0) {
    const fallback = String(services?.target_service_outcome || '').trim();
    return fallback || '-';
  }

  return selected.map((id) => getAutomationCatalogItem(id).label).join(', ');
}

export default async function OwnerFunnelPage() {
  const store = await cookies();
  const token = store.get(TOKEN_COOKIE_NAME)?.value || store.get(LEGACY_COOKIE_NAME)?.value;
  if (!token) redirect('/auth/login?next=%2Fdashboard%2Fowner%2Ffunnel');

  const me = await getUserFromSessionToken(token);
  if (!me || !canViewOwnerFunnel(me.email)) {
    redirect('/dashboard/overview');
  }

  const [summary, leads, abandonments, llcUpsells, featureRequests] = await Promise.all([
    getAutomationFunnelSummary(),
    listRecentAutomationOnboardingLeads({ limit: 100 }),
    listRecentAutomationAbandonments({ limit: 100 }),
    listRecentLlcUpsellOpportunities({ limit: 100 }),
    listRecentFeatureRequests({ limit: 100 }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Owner Funnel Dashboard"
        subtitle="Monitor automation onboarding conversions and abandonment attempts."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card><CardBody><p className="text-xs uppercase text-gray-500">Total signups</p><p className="mt-1 text-2xl font-semibold">{summary.total_signups}</p></CardBody></Card>
        <Card><CardBody><p className="text-xs uppercase text-gray-500">Signups (30d)</p><p className="mt-1 text-2xl font-semibold">{summary.signups_30d}</p></CardBody></Card>
        <Card><CardBody><p className="text-xs uppercase text-gray-500">Abandons (all)</p><p className="mt-1 text-2xl font-semibold">{summary.total_abandons}</p></CardBody></Card>
        <Card><CardBody><p className="text-xs uppercase text-gray-500">Abandons converted</p><p className="mt-1 text-2xl font-semibold">{summary.abandons_converted}</p></CardBody></Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Card>
          <CardBody>
            <p className="text-xs uppercase text-gray-500">LLC upsell opportunities</p>
            <p className="mt-1 text-2xl font-semibold">{llcUpsells.length}</p>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardBody className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-900">LLC upsell opportunities (latest 100)</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Email</th>
                  <th className="px-3 py-2">Business name</th>
                  <th className="px-3 py-2">Formation status</th>
                  <th className="px-3 py-2">Submitted</th>
                </tr>
              </thead>
              <tbody>
                {llcUpsells.length === 0 ? (
                  <tr><td className="px-3 py-3 text-gray-500" colSpan={5}>No LLC upsell opportunities captured yet.</td></tr>
                ) : (
                  llcUpsells.map((item) => (
                    <tr key={item.id} className="border-t">
                      <td className="px-3 py-2">{item.name || '-'}</td>
                      <td className="px-3 py-2">{item.email || '-'}</td>
                      <td className="px-3 py-2">{item.business_name || '-'}</td>
                      <td className="px-3 py-2">{item.business_formation_status || '-'}</td>
                      <td className="px-3 py-2">{formatDateTime(item.created_at)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-900">Feature add-on enrollments (7-day trial, then manual review)</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="px-3 py-2">Email</th>
                  <th className="px-3 py-2">Feature</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Price</th>
                  <th className="px-3 py-2">Trial ends</th>
                  <th className="px-3 py-2">Review</th>
                  <th className="px-3 py-2">Requested</th>
                </tr>
              </thead>
              <tbody>
                {featureRequests.length === 0 ? (
                  <tr><td className="px-3 py-3 text-gray-500" colSpan={7}>No feature add-on enrollments yet.</td></tr>
                ) : (
                  featureRequests.map((item) => (
                    <tr key={item.id} className="border-t">
                      <td className="px-3 py-2">{item.email}</td>
                      <td className="px-3 py-2">{item.feature_key}</td>
                      <td className="px-3 py-2">{item.status}</td>
                      <td className="px-3 py-2">${(item.add_on_price_cents / 100).toFixed(2)}/mo</td>
                      <td className="px-3 py-2">{formatDateTime(item.trial_ends_at)}</td>
                      <td className="px-3 py-2">{item.review_status || 'pending_manual_review'}</td>
                      <td className="px-3 py-2">{formatDateTime(item.created_at)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-900">Who signed up (latest 100)</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Email</th>
                  <th className="px-3 py-2">Company</th>
                  <th className="px-3 py-2">Automations selected</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Submitted</th>
                </tr>
              </thead>
              <tbody>
                {leads.length === 0 ? (
                  <tr><td className="px-3 py-3 text-gray-500" colSpan={6}>No automation onboarding signups yet.</td></tr>
                ) : (
                  leads.map((lead) => {
                    const meta = (lead.meta || {}) as Record<string, any>;
                    const company = String(meta?.onboarding?.company_name || '').trim() || '-';
                    return (
                      <tr key={lead.id} className="border-t">
                        <td className="px-3 py-2">{lead.name || '-'}</td>
                        <td className="px-3 py-2">{lead.email || '-'}</td>
                        <td className="px-3 py-2">{company}</td>
                        <td className="px-3 py-2">{formatSelectedAutomations(meta)}</td>
                        <td className="px-3 py-2">{lead.status || 'new'}</td>
                        <td className="px-3 py-2">{formatDateTime(lead.created_at)}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-900">Who abandoned (latest 100)</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Email</th>
                  <th className="px-3 py-2">Company</th>
                  <th className="px-3 py-2">Stage</th>
                  <th className="px-3 py-2">Reason</th>
                  <th className="px-3 py-2">Last seen</th>
                  <th className="px-3 py-2">Converted?</th>
                  <th className="px-3 py-2">Notified?</th>
                </tr>
              </thead>
              <tbody>
                {abandonments.length === 0 ? (
                  <tr><td className="px-3 py-3 text-gray-500" colSpan={8}>No abandonment attempts captured yet.</td></tr>
                ) : (
                  abandonments.map((item) => (
                    <tr key={item.id} className="border-t">
                      <td className="px-3 py-2">{item.full_name || '-'}</td>
                      <td className="px-3 py-2">{item.email}</td>
                      <td className="px-3 py-2">{item.company_name || '-'}</td>
                      <td className="px-3 py-2">{item.stage}</td>
                      <td className="px-3 py-2">{item.reason || '-'}</td>
                      <td className="px-3 py-2">{formatDateTime(item.last_seen_at)}</td>
                      <td className="px-3 py-2">{item.converted ? 'yes' : 'no'}</td>
                      <td className="px-3 py-2">{item.notified_at ? 'yes' : 'no'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
