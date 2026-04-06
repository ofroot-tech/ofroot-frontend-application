// app/dashboard/tenants/[id]/page.tsx
// Tenant detail page: show basic info and allow simple updates (name, domain, plan)

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import { api, type Tenant } from '@/app/lib/api';
import { TOKEN_COOKIE_NAME, LEGACY_COOKIE_NAME } from '@/app/lib/cookies';
import { PLATFORM_EDITION_CATALOG, type PlatformEdition } from '@/app/lib/platform-access';
import { enableEditionForTenant, listManageableFeatureKeys, listTenantFeatureStates, setTenantFeatureEnabled } from '@/app/lib/platform-store';
import { getUserFromSessionToken } from '@/app/lib/supabase-store';
import { PageHeader, Card, CardHeader, CardBody, ToolbarButton } from '@/app/dashboard/_components/UI';

async function getToken() {
  const store = await cookies();
  return store.get(TOKEN_COOKIE_NAME)?.value || store.get(LEGACY_COOKIE_NAME)?.value;
}

async function fetchTenantById(id: number, token: string): Promise<Tenant | null> {
  // There is no single-tenant GET endpoint; scan paginated admin list.
  // Start with page 1 and walk pages until found or exhausted.
  let page = 1;
  const perPage = 50;
  for (let i = 0; i < 20; i++) { // hard cap 20 pages to avoid unbounded loops
    const res = await api.adminListTenants(token, { page, per_page: perPage }).catch(() => null);
    if (!res) return null;
    const match = (res.data || []).find((t) => t.id === id);
    if (match) return match;
    const last = res.meta?.last_page ?? page;
    if (page >= last) break;
    page += 1;
  }
  return null;
}

export default async function TenantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: idParam } = await params;
  const token = await getToken();
  if (!token) redirect('/auth/login');

  const me = await getUserFromSessionToken(token).catch(() => null);
  if (!me) redirect('/auth/login');

  const id = Number(idParam);
  if (!Number.isFinite(id)) redirect('/dashboard/tenants');

  const tenant = await fetchTenantById(id, token);
  if (!tenant) redirect('/dashboard/tenants');
  const featureRows = await listTenantFeatureStates(id).catch(() => []);
  const enabledFeatures = new Set(featureRows.filter((row) => row.enabled).map((row) => row.feature_key));
  const manageableFeatures = listManageableFeatureKeys();

  async function updateTenant(formData: FormData) {
    'use server';
    const tokenInner = await getToken();
    if (!tokenInner) redirect('/auth/login');
    const name = (formData.get('name') as string | null) || undefined;
    const domain = (formData.get('domain') as string | null) || undefined;
    const plan = (formData.get('plan') as string | null) || undefined;
    try {
      await api.updateTenant(id, { name, domain, plan }, tokenInner);
    } catch (e) {
      // swallow for now; in future, surface message in UI
    }
  }

  async function applyEditionDefaults(formData: FormData) {
    'use server';
    const edition = String(formData.get('edition') || '').trim().toLowerCase() as PlatformEdition;
    if (edition !== 'helpr' && edition !== 'ontask') return;
    await enableEditionForTenant(id, edition);
    revalidatePath(`/dashboard/tenants/${id}`);
  }

  async function updateTenantFeature(formData: FormData) {
    'use server';
    const featureKey = String(formData.get('feature_key') || '').trim().toLowerCase();
    const enabled = String(formData.get('enabled') || '').trim() === 'true';
    if (!featureKey) return;
    await setTenantFeatureEnabled(id, featureKey, enabled);
    revalidatePath(`/dashboard/tenants/${id}`);
  }

  return (
    <div className="space-y-6 reveal-in fade-only">
      <PageHeader
        title={tenant.name || `Tenant #${tenant.id}`}
        subtitle={tenant.domain ? `${tenant.domain}` : 'No domain assigned'}
        actions={(
          <div className="flex items-center gap-3">
            <Link href="/dashboard/tenants" className="text-sm underline">Back to Tenants</Link>
            <ToolbarButton disabled>Impersonate</ToolbarButton>
          </div>
        )}
      />

      <Card>
        <CardHeader>
          <div className="font-semibold">Profile</div>
        </CardHeader>
        <CardBody>
          <form action={updateTenant} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input name="name" defaultValue={tenant.name ?? ''} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Domain</label>
              <input name="domain" defaultValue={tenant.domain ?? ''} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
              <input name="plan" defaultValue={tenant.plan ?? ''} className="w-full border rounded px-3 py-2" />
            </div>
            <div className="md:col-span-2 flex justify-end mt-2">
              <button type="submit" className="inline-flex items-center gap-2 rounded-md bg-black text-white px-4 py-2 text-sm font-medium shadow hover:bg-gray-800">
                Save
              </button>
            </div>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <div className="font-semibold">Edition entitlements</div>
            <p className="mt-1 text-sm text-gray-600">Apply Helpr or OnTask defaults, then fine-tune individual shared-platform features for this tenant.</p>
          </div>
        </CardHeader>
        <CardBody className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            {(['helpr', 'ontask'] as PlatformEdition[]).map((edition) => {
              const catalog = PLATFORM_EDITION_CATALOG[edition];
              const enabled = enabledFeatures.has(`edition_${edition}`);
              return (
                <div key={edition} className={`rounded-xl border p-4 ${enabled ? 'border-emerald-200 bg-emerald-50/60' : 'border-gray-200 bg-white'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">{catalog.label}</div>
                      <h2 className="mt-1 text-lg font-semibold text-gray-950">{catalog.name}</h2>
                      <p className="mt-2 text-sm leading-6 text-gray-600">{catalog.description}</p>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                      {enabled ? 'Enabled' : 'Not enabled'}
                    </span>
                  </div>
                  <form action={applyEditionDefaults} className="mt-4">
                    <input type="hidden" name="edition" value={edition} />
                    <button type="submit" className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium hover:border-black">
                      Apply {catalog.name} defaults
                    </button>
                  </form>
                </div>
              );
            })}
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900">Feature flags</h3>
            <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
              {manageableFeatures.map((featureKey) => {
                const enabled = enabledFeatures.has(featureKey);
                return (
                  <form key={featureKey} action={updateTenantFeature} className={`rounded-lg border p-3 ${enabled ? 'border-emerald-200 bg-emerald-50/40' : 'border-gray-200 bg-white'}`}>
                    <input type="hidden" name="feature_key" value={featureKey} />
                    <input type="hidden" name="enabled" value={enabled ? 'false' : 'true'} />
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{featureKey}</div>
                        <div className="text-xs text-gray-500">{enabled ? 'Enabled for this tenant' : 'Disabled for this tenant'}</div>
                      </div>
                      <button type="submit" className={`rounded-md border px-3 py-1.5 text-xs font-medium ${enabled ? 'border-emerald-300 text-emerald-800' : 'border-gray-300 text-gray-700'}`}>
                        {enabled ? 'Disable' : 'Enable'}
                      </button>
                    </div>
                  </form>
                );
              })}
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
