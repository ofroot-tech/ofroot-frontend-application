'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { api } from '@/app/lib/api';
import { TOKEN_COOKIE_NAME, LEGACY_COOKIE_NAME } from '@/app/lib/cookies';

async function getToken() {
  const store = await cookies();
  return store.get(TOKEN_COOKIE_NAME)?.value || store.get(LEGACY_COOKIE_NAME)?.value;
}

export type CreateInvoicePayload = {
  tenant_id?: number | null;
  user_id?: number | null;
  currency: string;
  due_date?: string;
  items: Array<{ description: string; quantity?: number; unit_amount_cents: number }>;
  meta?: Record<string, any>;
};

export async function createInvoiceAction(payload: CreateInvoicePayload) {
  const token = await getToken();
  if (!token) {
    return { ok: false as const, error: 'unauthorized' };
  }

  try {
    // sanitize ids to avoid NaN or invalid numbers reaching API
    const safe: CreateInvoicePayload = {
      ...payload,
      tenant_id: typeof payload.tenant_id === 'number' && Number.isFinite(payload.tenant_id) ? payload.tenant_id : undefined,
      user_id: typeof payload.user_id === 'number' && Number.isFinite(payload.user_id) ? payload.user_id : undefined,
      items: payload.items.map((it) => ({
        description: String(it.description || '').trim(),
        quantity: it.quantity && it.quantity > 0 ? it.quantity : 1,
        unit_amount_cents: Math.max(0, Math.round(it.unit_amount_cents || 0)),
      })).filter((it) => it.description && it.unit_amount_cents > 0),
    };
    const res = await api.adminCreateInvoice(safe, token);
    revalidatePath('/dashboard/billing');
    return { ok: true as const, id: res.data.id };
  } catch (e: any) {
    const msg = e?.message || 'Failed to create invoice';
    return { ok: false as const, error: msg };
  }
}

export async function updateInvoiceStatusAction(id: number, status: 'draft'|'sent'|'paid'|'void') {
  const token = await getToken();
  if (!token) return { ok: false as const, error: 'unauthorized' };
  try {
    await api.adminUpdateInvoice(id, { status }, token);
    revalidatePath(`/dashboard/billing/invoices/${id}`);
    revalidatePath('/dashboard/billing');
    return { ok: true as const };
  } catch (e: any) {
    return { ok: false as const, error: e?.message || 'Failed to update status' };
  }
}

export async function recordPaymentAction(id: number, amountUsd: number) {
  const token = await getToken();
  if (!token) return { ok: false as const, error: 'unauthorized' };
  try {
    await api.adminRecordPayment(id, { amount_cents: Math.round(amountUsd * 100) }, token);
    revalidatePath(`/dashboard/billing/invoices/${id}`);
    revalidatePath('/dashboard/billing');
    return { ok: true as const };
  } catch (e: any) {
    return { ok: false as const, error: e?.message || 'Failed to record payment' };
  }
}

export async function sendInvoiceAction(id: number) {
  const token = await getToken();
  if (!token) return { ok: false as const, error: 'unauthorized' };
  try {
    await api.adminSendInvoice(id, token);
    revalidatePath(`/dashboard/billing/invoices/${id}`);
    return { ok: true as const };
  } catch (e: any) {
    return { ok: false as const, error: e?.message || 'Failed to send invoice' };
  }
}

export async function reassignInvoiceAction(id: number, input: { tenant_id?: number; user_id?: number }) {
  const token = await getToken();
  if (!token) return { ok: false as const, error: 'unauthorized' };
  try {
    await api.adminUpdateInvoice(id, input as any, token);
    revalidatePath(`/dashboard/billing/invoices/${id}`);
    return { ok: true as const };
  } catch (e: any) {
    return { ok: false as const, error: e?.message || 'Failed to update invoice' };
  }
}
