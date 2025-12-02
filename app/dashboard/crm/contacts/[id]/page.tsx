// app/dashboard/crm/contacts/[id]/page.tsx
// Contact detail with edit form for segments and notes.

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { api, type Contact } from '@/app/lib/api';
import { TOKEN_COOKIE_NAME, LEGACY_COOKIE_NAME } from '@/app/lib/cookies';
import { PageHeader, Card, CardBody, CardHeader } from '@/app/dashboard/_components/UI';

async function getToken() {
  const store = await cookies();
  return store.get(TOKEN_COOKIE_NAME)?.value || store.get(LEGACY_COOKIE_NAME)?.value;
}

export default async function ContactDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const contactId = Number(id);
  const token = await getToken();
  if (!token) redirect('/auth/login');

  const me = await api.me(token).catch(() => null);
  if (!me) redirect('/auth/login');

  const contact = await api.adminGetContact(contactId, token).then(r => r.data).catch(() => null);
  if (!contact) redirect('/dashboard/crm/contacts');

  async function saveAction(formData: FormData) {
    'use server';
    const token = await getToken();
    if (!token) return;
    const id = Number(formData.get('contact_id'));
    const notes = String(formData.get('notes') || '');
    const segmentsRaw = String(formData.get('segments') || '').trim();
    const segments = segmentsRaw ? segmentsRaw.split(',').map(s => s.trim()).filter(Boolean) : [];
    try { await api.adminUpdateContact(id, { notes, segments }, token); } catch {}
    revalidatePath(`/dashboard/crm/contacts/${id}`);
  }

  const segString = Array.isArray(contact.segments) ? (contact.segments as any[]).join(', ') : '';

  const fullName = [contact.first_name, contact.last_name].filter(Boolean).join(' ');
  const addressLine = [contact.address1, contact.address2].filter(Boolean).join(', ');
  const cityStateZip = [contact.city, contact.state, contact.zip].filter(Boolean).join(', ');

  return (
    <div className="space-y-6 reveal-in fade-only">
      <PageHeader
        title={fullName || `Contact #${contact.id}`}
        subtitle={contact.company || contact.email || 'Contact'}
        meta={<span className="text-xs">Last updated {contact.updated_at ? new Date(contact.updated_at).toLocaleString() : '—'}</span>}
      />

      <Card>
        <CardHeader>
          <div className="text-sm font-medium">Profile</div>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="text-sm text-gray-500">Name</div>
              <div className="text-sm font-medium">{fullName || '—'}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Company</div>
              <div className="text-sm font-medium">{contact.company || '—'}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Email</div>
              <div className="text-sm font-medium">{contact.email || '—'}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Phone</div>
              <div className="text-sm font-medium">{contact.phone || '—'}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Address</div>
              <div className="text-sm font-medium">{addressLine || cityStateZip || '—'}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">ZIP</div>
              <div className="text-sm font-medium">{contact.zip || '—'}</div>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">Segments & Notes</div>
            <span className="text-xs text-gray-600">Tenant ID: {contact.tenant_id ?? '—'}</span>
          </div>
        </CardHeader>
        <CardBody>
          <form action={saveAction} className="space-y-4">
            <input type="hidden" name="contact_id" value={contact.id} />
            <div>
              <label className="block text-xs text-gray-600 mb-1">Segments (comma-separated)</label>
              <input
                type="text"
                name="segments"
                defaultValue={segString}
                className="w-full border rounded px-3 py-2 text-sm"
                placeholder="vip, newsletter, customer"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Notes</label>
              <textarea
                name="notes"
                defaultValue={contact.notes ?? ''}
                className="w-full border rounded px-3 py-2 text-sm min-h-[120px]"
                placeholder="Add notes about this contact..."
              />
            </div>
            <div>
              <button type="submit" className="border rounded px-3 py-1 text-sm">Save</button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
