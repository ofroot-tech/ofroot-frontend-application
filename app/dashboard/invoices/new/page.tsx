// app/dashboard/invoices/new/page.tsx
// Admin: create a new invoice with a minimal single-line item form.

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { api } from '@/app/lib/api';
import { TOKEN_COOKIE_NAME, LEGACY_COOKIE_NAME } from '@/app/lib/cookies';
import { fetchSupabaseUserByToken } from '@/app/lib/supabase-user';
import { PageHeader, Card, CardHeader, CardBody, ToolbarButton } from '@/app/dashboard/_components/UI';

async function getToken() {
  const store = await cookies();
  return store.get(TOKEN_COOKIE_NAME)?.value || store.get(LEGACY_COOKIE_NAME)?.value;
}

export default async function NewInvoicePage() {
  const token = await getToken();
  if (!token) redirect('/auth/login');
  const me = await fetchSupabaseUserByToken(token);
  if (!me) redirect('/auth/login');

  async function createInvoiceAction(formData: FormData) {
    'use server';
    const token = await getToken();
    if (!token) return redirect('/auth/login');

    const tenantId = formData.get('tenant_id');
    const currency = String(formData.get('currency') || 'USD');
    const due = String(formData.get('due_date') || '');
    const desc = String(formData.get('description') || '').trim();
    const qty = Number(formData.get('quantity') || 1);
    const unitDollars = Number(formData.get('unit_amount') || 0);
    const unitCents = Math.round(unitDollars * 100);

    const payload = {
      tenant_id: tenantId != null && tenantId !== '' ? Number(tenantId) : undefined,
      currency,
      due_date: due || undefined,
      items: [
        { description: desc || 'Service', quantity: qty > 0 ? qty : 1, unit_amount_cents: unitCents },
      ],
      meta: {},
    } as const;

    const res = await api.adminCreateInvoice(payload as any, token);
    revalidatePath('/dashboard/invoices');
    redirect(`/dashboard/invoices/${res.data.id}`);
  }

  return (
    <div className="space-y-6 reveal-in fade-only">
      <PageHeader title="New invoice" subtitle="Create an invoice with one or more line items." />
      <Card>
        <CardHeader>Basic details</CardHeader>
        <CardBody>
          <form action={createInvoiceAction} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="block">
                <div className="text-sm text-gray-700 mb-1">Tenant ID (optional)</div>
                <input type="number" name="tenant_id" className="w-full border rounded px-3 py-2" placeholder="e.g., 1" />
              </label>
              <label className="block">
                <div className="text-sm text-gray-700 mb-1">Currency</div>
                <input name="currency" defaultValue="USD" className="w-full border rounded px-3 py-2" />
              </label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="block">
                <div className="text-sm text-gray-700 mb-1">Due date</div>
                <input type="date" name="due_date" className="w-full border rounded px-3 py-2" />
              </label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <label className="block sm:col-span-2">
                <div className="text-sm text-gray-700 mb-1">Description</div>
                <input name="description" className="w-full border rounded px-3 py-2" placeholder="Work performed" />
              </label>
              <label className="block">
                <div className="text-sm text-gray-700 mb-1">Quantity</div>
                <input type="number" name="quantity" defaultValue={1} min={1} className="w-full border rounded px-3 py-2" />
              </label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <label className="block sm:col-span-1">
                <div className="text-sm text-gray-700 mb-1">Unit amount (USD)</div>
                <input type="number" step="0.01" name="unit_amount" defaultValue={100} className="w-full border rounded px-3 py-2" />
              </label>
            </div>
            <div>
              <button type="submit" className="inline-flex items-center rounded-md bg-gray-900 text-white px-3 py-2 text-sm hover:bg-gray-800">
                Create invoice
              </button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
