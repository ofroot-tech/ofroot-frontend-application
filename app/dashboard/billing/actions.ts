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

export async function recordPaymentAction(
  id: number,
  amountUsd: number,
  opts?: { provider?: string; reference?: string; status?: 'succeeded'|'pending'|'failed'|'refunded'; currency?: string }
) {
  const token = await getToken();
  if (!token) return { ok: false as const, error: 'unauthorized' };
  try {
    await api.adminRecordPayment(
      id,
      {
        amount_cents: Math.round(amountUsd * 100),
        currency: opts?.currency,
        status: opts?.status,
        provider: opts?.provider,
        // Backend maps provider_payment_id -> provider_charge_id for storage
        provider_payment_id: opts?.reference,
      },
      token
    );
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

export type RecurringConfig = { every: 'month'|'quarter'|'year'; count?: number };

export async function saveInvoiceDetailsAction(id: number, input: { due_date?: string | null; notes?: string | null; recurring?: RecurringConfig | null }) {
  const token = await getToken();
  if (!token) return { ok: false as const, error: 'unauthorized' };
  try {
    // Load current to safely merge meta
    const res = await api.adminGetInvoice(id, token);
    const current = res.data;
    const meta = { ...(current.meta as any) };
    if (typeof input.notes !== 'undefined') {
      if (input.notes === null || input.notes === '') delete meta.notes; else meta.notes = input.notes;
    }
    if (typeof input.recurring !== 'undefined') {
      if (!input.recurring) {
        if ('recurring' in meta) delete meta.recurring;
      } else {
        meta.recurring = { every: input.recurring.every, count: input.recurring.count, generated: (meta.recurring?.generated ?? 1) };
      }
    }
    const payload: any = { meta };
    if (typeof input.due_date !== 'undefined') payload.due_date = input.due_date || null;
    await api.adminUpdateInvoice(id, payload, token);
    revalidatePath(`/dashboard/billing/invoices/${id}`);
    revalidatePath('/dashboard/billing');
    return { ok: true as const };
  } catch (e: any) {
    return { ok: false as const, error: e?.message || 'Failed to save invoice details' };
  }
}

// Save invoice items (draft) into meta to allow inline editing before server-side recalculation.
// NOTE: The backend currently exposes adminUpdateInvoice for status/due_date/meta only.
// We persist items under meta.items_draft and a helper meta.items_draft_total_cents for preview.
export async function saveInvoiceItemsAction(id: number, formData: FormData) {
  const token = await getToken();
  if (!token) return { ok: false as const, error: 'unauthorized' };
  try {
    const raw = (formData.get('items') || '').toString();
    let parsed: any = [];
    try { parsed = JSON.parse(raw); } catch { parsed = []; }

    const items = Array.isArray(parsed) ? parsed.map((it) => ({
      description: String(it?.description ?? '').trim(),
      quantity: Math.max(1, Number.isFinite(Number(it?.quantity)) ? Number(it.quantity) : 1),
      unit_amount_cents: Math.max(0, Math.round(Number(it?.unit_amount_cents) || 0)),
    })) : [];

    const cleaned = items.filter((it) => it.description && it.unit_amount_cents > 0);
    const totalCents = cleaned.reduce((acc, it) => acc + it.quantity * it.unit_amount_cents, 0);

    // Optional pricing adjustments for preview
    const taxPercentRaw = formData.get('tax_percent');
    const discountCentsRaw = formData.get('discount_cents');
    const taxPercent = taxPercentRaw != null ? Number(taxPercentRaw) : undefined;
    const discountCents = discountCentsRaw != null ? Math.max(0, Math.round(Number(discountCentsRaw))) : undefined;

    // Merge into existing meta
    const current = (await api.adminGetInvoice(id, token)).data;
    const meta = { ...(current.meta as any) };
    (meta as any).items_draft = cleaned;
    (meta as any).items_draft_total_cents = totalCents;
    if (typeof taxPercent !== 'undefined' && !Number.isNaN(taxPercent)) {
      (meta as any).items_draft_tax_percent = taxPercent;
    }
    if (typeof discountCents !== 'undefined' && !Number.isNaN(discountCents)) {
      (meta as any).items_draft_discount_cents = discountCents;
    }

    await api.adminUpdateInvoice(id, { meta } as any, token);
    revalidatePath(`/dashboard/billing/invoices/${id}`);
    return { ok: true as const };
  } catch (e: any) {
    return { ok: false as const, error: e?.message || 'Failed to save invoice items' };
  }
}

// Finalize draft items by promoting them to meta.items_final and saving summary fields.
// NOTE: This does not update canonical invoice amounts on the backend; it stores
// the finalization in meta so the UI and print view can use the finalized set.
export async function finalizeInvoiceItemsAction(id: number) {
  const token = await getToken();
  if (!token) return { ok: false as const, error: 'unauthorized' };
  try {
    const current = (await api.adminGetInvoice(id, token)).data;
    const meta = { ...(current.meta as any) };
    const draft: Array<{ description: string; quantity: number; unit_amount_cents: number }> = Array.isArray(meta.items_draft) ? meta.items_draft : [];
    if (!draft.length) {
      return { ok: false as const, error: 'no draft items to finalize' };
    }
    const taxPercent = Number(meta.items_draft_tax_percent || 0) || 0;
    const discountCents = Number(meta.items_draft_discount_cents || 0) || 0;
    const subtotal = draft.reduce((acc: number, it: any) => acc + Math.max(1, Number(it.quantity || 0)) * Math.max(0, Number(it.unit_amount_cents || 0)), 0);
    const taxCents = Math.round((subtotal * taxPercent) / 100);
    const totalCents = Math.max(0, subtotal + taxCents - discountCents);

    meta.items_final = draft;
    meta.items_final_total_cents = totalCents;
    if (taxPercent) meta.items_final_tax_percent = taxPercent; else delete meta.items_final_tax_percent;
    if (discountCents) meta.items_final_discount_cents = discountCents; else delete meta.items_final_discount_cents;
    meta.finalized_at = new Date().toISOString();
    // Clear draft keys
    delete meta.items_draft;
    delete meta.items_draft_total_cents;
    delete meta.items_draft_tax_percent;
    delete meta.items_draft_discount_cents;

    await api.adminUpdateInvoice(id, { meta } as any, token);
    revalidatePath(`/dashboard/billing/invoices/${id}`);
    revalidatePath('/dashboard/billing');
    return { ok: true as const };
  } catch (e: any) {
    return { ok: false as const, error: e?.message || 'Failed to finalize items' };
  }
}

// Reopen finalized items for edits: move items_final back to items_draft and clear final fields.
export async function reopenInvoiceItemsAction(id: number) {
  const token = await getToken();
  if (!token) return { ok: false as const, error: 'unauthorized' };
  try {
    const current = (await api.adminGetInvoice(id, token)).data;
    const meta = { ...(current.meta as any) };
    const final: Array<{ description: string; quantity: number; unit_amount_cents: number }> = Array.isArray(meta.items_final) ? meta.items_final : [];
    if (!final.length) return { ok: false as const, error: 'no finalized items' };

    meta.items_draft = final;
    meta.items_draft_total_cents = Number(meta.items_final_total_cents || 0) || undefined;
    if (meta.items_final_tax_percent != null) meta.items_draft_tax_percent = meta.items_final_tax_percent;
    if (meta.items_final_discount_cents != null) meta.items_draft_discount_cents = meta.items_final_discount_cents;

    delete meta.items_final;
    delete meta.items_final_total_cents;
    delete meta.items_final_tax_percent;
    delete meta.items_final_discount_cents;
    delete meta.finalized_at;

    await api.adminUpdateInvoice(id, { meta } as any, token);
    revalidatePath(`/dashboard/billing/invoices/${id}`);
    return { ok: true as const };
  } catch (e: any) {
    return { ok: false as const, error: e?.message || 'Failed to reopen items' };
  }
}
