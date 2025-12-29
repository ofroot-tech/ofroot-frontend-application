// app/dashboard/crm/leads/[id]/page.tsx
// Lead detail with status transitions and tenant assignment.

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { api, type Lead, type Tenant } from '@/app/lib/api';
import { TOKEN_COOKIE_NAME, LEGACY_COOKIE_NAME } from '@/app/lib/cookies';
import { fetchSupabaseUserByToken } from '@/app/lib/supabase-user';
import { PageHeader, Card, CardBody, CardHeader } from '@/app/dashboard/_components/UI';

async function getToken() {
  const store = await cookies();
  return store.get(TOKEN_COOKIE_NAME)?.value || store.get(LEGACY_COOKIE_NAME)?.value;
}

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const leadId = Number(id);
  const token = await getToken();
  if (!token) redirect('/auth/login');

  const me = await fetchSupabaseUserByToken(token);
  if (!me) redirect('/auth/login');

  const lead = await api.adminGetLead(leadId, token).then(r => r.data).catch(() => null);
  if (!lead) redirect('/dashboard/crm/leads');

  const tenants: Tenant[] = await api.listTenants(token).catch(() => []);

  async function updateStatusAction(formData: FormData) {
    'use server';
    const token = await getToken();
    if (!token) return;
    const id = Number(formData.get('lead_id'));
    const status = String(formData.get('status'));
    try { await api.adminUpdateLead(id, { status }, token); } catch {}
    revalidatePath(`/dashboard/crm/leads/${id}`);
  }

  async function assignAction(formData: FormData) {
    'use server';
    const token = await getToken();
    if (!token) return;
    const leadId = Number(formData.get('lead_id'));
    const tenantId = Number(formData.get('tenant_id'));
    try { await api.assignLead({ leadId, tenantId }, token); } catch {}
    revalidatePath(`/dashboard/crm/leads/${leadId}`);
  }

  async function unassignAction(formData: FormData) {
    'use server';
    const token = await getToken();
    if (!token) return;
    const leadId = Number(formData.get('lead_id'));
    try { await api.unassignLead({ leadId }, token); } catch {}
    revalidatePath(`/dashboard/crm/leads/${leadId}`);
  }

  const statuses = ['new','routed','accepted','quoted','won','lost'];

  return (
    <div className="space-y-6 reveal-in fade-only">
      <PageHeader
        title={`Lead #${lead.id}`}
        subtitle={lead.service}
        meta={<span className="text-xs">Created {lead.created_at ? new Date(lead.created_at).toLocaleString() : '—'}</span>}
      />

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="text-sm">Status:</div>
            <div className="flex flex-wrap gap-2">
              {statuses.map(s => (
                <form key={s} action={updateStatusAction}>
                  <input type="hidden" name="lead_id" value={lead.id} />
                  <input type="hidden" name="status" value={s} />
                  <button
                    type="submit"
                    className={`text-xs rounded-full px-2 py-1 border ${lead.status === s ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-gray-200 text-gray-700'}`}
                  >{s}</button>
                </form>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="text-sm text-gray-500">Name</div>
              <div className="text-sm font-medium">{lead.name || '—'}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Email</div>
              <div className="text-sm font-medium">{lead.email || '—'}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Phone</div>
              <div className="text-sm font-medium">{lead.phone || '—'}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">ZIP</div>
              <div className="text-sm font-medium">{lead.zip}</div>
            </div>
            <div className="md:col-span-2">
              <div className="text-sm text-gray-500">Source</div>
              <div className="text-sm font-medium">{lead.source || '—'}</div>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-medium">Assignment</div>
            <span className="text-xs text-gray-600">Tenant ID: {lead.tenant_id ?? '—'}</span>
          </div>
        </CardHeader>
        <CardBody>
          <div className="flex items-center gap-3 flex-wrap">
            <form action={assignAction} className="flex items-center gap-2">
              <input type="hidden" name="lead_id" value={lead.id} />
              <select name="tenant_id" className="border rounded px-2 py-1 text-sm">
                {tenants.map(t => (
                  <option key={t.id} value={t.id}>{t.name ?? `Tenant #${t.id}`}</option>
                ))}
              </select>
              <button type="submit" className="border rounded px-3 py-1 text-sm">Assign</button>
            </form>
            <form action={unassignAction}>
              <input type="hidden" name="lead_id" value={lead.id} />
              <button type="submit" className="underline text-sm">Unassign</button>
            </form>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
