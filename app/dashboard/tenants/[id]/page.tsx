// app/dashboard/tenants/[id]/page.tsx
// Tenant detail page: show basic info and allow simple updates (name, domain, plan)

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { api, type Tenant } from '@/app/lib/api';
import { TOKEN_COOKIE_NAME, LEGACY_COOKIE_NAME } from '@/app/lib/cookies';
import { fetchSupabaseUserByToken } from '@/app/lib/supabase-user';
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

  const me = await fetchSupabaseUserByToken(token);
  if (!me) redirect('/auth/login');

  const id = Number(idParam);
  if (!Number.isFinite(id)) redirect('/dashboard/tenants');

  const tenant = await fetchTenantById(id, token);
  if (!tenant) redirect('/dashboard/tenants');

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
    </div>
  );
}
