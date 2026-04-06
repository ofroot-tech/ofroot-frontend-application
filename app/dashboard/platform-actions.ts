'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { TOKEN_COOKIE_NAME, LEGACY_COOKIE_NAME } from '@/app/lib/cookies';
import { normalizeEdition } from '@/app/lib/platform-access';
import { createOrUpdateReviewRequest, enableEditionForTenant, updateReviewRequestStatus, type ReviewRequestStatus } from '@/app/lib/platform-store';
import { getUserFromSessionToken } from '@/app/lib/supabase-store';
import { installWorkflowTemplate, listWorkflowTemplates } from '@/app/lib/workflow-templates';

async function getSessionUser() {
  const store = await cookies();
  const token = store.get(TOKEN_COOKIE_NAME)?.value || store.get(LEGACY_COOKIE_NAME)?.value;
  if (!token) return null;
  return getUserFromSessionToken(token).catch(() => null);
}

type SessionUser = Awaited<ReturnType<typeof getSessionUser>>;

function isTenantManager(user: SessionUser): user is NonNullable<SessionUser> & { tenant_id: number } {
  if (!user?.tenant_id) return false;
  const role = String(user.top_role || '').trim().toLowerCase();
  return role === 'owner' || role === 'admin';
}

export async function upgradeEditionAction(formData: FormData) {
  const user = await getSessionUser();
  if (!isTenantManager(user)) return;
  const currentUser = user;

  const edition = normalizeEdition(formData.get('edition'));
  if (!edition) return;

  await enableEditionForTenant(currentUser.tenant_id!, edition);

  const seedTemplates = String(formData.get('seed_templates') || 'true').trim().toLowerCase() !== 'false';
  if (seedTemplates) {
    for (const template of listWorkflowTemplates(edition)) {
      await installWorkflowTemplate({
        tenantId: currentUser.tenant_id!,
        userId: currentUser.id,
        userEmail: currentUser.email,
        templateKey: template.key,
      }).catch(() => null);
    }
  }

  revalidatePath('/dashboard/overview');
  revalidatePath('/dashboard/helpr');
  revalidatePath('/dashboard/ontask');
  revalidatePath('/dashboard/crm/workflows');
  revalidatePath('/dashboard/tenants');
  revalidatePath(`/dashboard/tenants/${currentUser.tenant_id}`);
  revalidatePath(String(formData.get('refresh_path') || `/dashboard/${edition}`));
}

export async function installWorkflowTemplateAction(formData: FormData) {
  const user = await getSessionUser();
  if (!isTenantManager(user)) return;
  const currentUser = user;

  const templateKey = String(formData.get('template_key') || '').trim();
  if (!templateKey) return;

  await installWorkflowTemplate({
    tenantId: currentUser.tenant_id!,
    userId: currentUser.id,
    userEmail: currentUser.email,
    templateKey,
  }).catch(() => null);

  revalidatePath('/dashboard/crm/workflows');
  revalidatePath(String(formData.get('refresh_path') || '/dashboard/crm/workflows'));
}

export async function createReviewRequestAction(formData: FormData) {
  const user = await getSessionUser();
  if (!user?.tenant_id) return;

  const invoiceIdRaw = String(formData.get('invoice_id') || '').trim();
  const paymentIdRaw = String(formData.get('payment_id') || '').trim();
  const recipientName = String(formData.get('recipient_name') || '').trim();
  const recipientEmail = String(formData.get('recipient_email') || '').trim();
  const recipientPhone = String(formData.get('recipient_phone') || '').trim();
  const reviewUrl = String(formData.get('review_url') || '').trim();
  const notes = String(formData.get('notes') || '').trim();

  if (!recipientName && !recipientEmail && !recipientPhone) return;

  await createOrUpdateReviewRequest({
    tenant_id: user.tenant_id,
    invoice_id: /^\d+$/.test(invoiceIdRaw) ? Number(invoiceIdRaw) : null,
    payment_id: /^\d+$/.test(paymentIdRaw) ? Number(paymentIdRaw) : null,
    recipient_name: recipientName || null,
    recipient_email: recipientEmail || null,
    recipient_phone: recipientPhone || null,
    review_url: reviewUrl || null,
    notes: notes || null,
    source: 'manual',
    status: 'draft',
  }).catch(() => null);

  revalidatePath('/dashboard/reviews');
  if (/^\d+$/.test(invoiceIdRaw)) {
    revalidatePath(`/dashboard/billing/invoices/${invoiceIdRaw}`);
  }
  revalidatePath(String(formData.get('refresh_path') || '/dashboard/reviews'));
}

export async function updateReviewRequestStatusAction(formData: FormData) {
  const user = await getSessionUser();
  if (!user?.tenant_id) return;

  const idRaw = String(formData.get('review_request_id') || '').trim();
  const status = String(formData.get('status') || '').trim() as ReviewRequestStatus;
  const invoiceIdRaw = String(formData.get('invoice_id') || '').trim();
  if (!/^\d+$/.test(idRaw)) return;
  if (!['draft', 'sent', 'completed', 'dismissed'].includes(status)) return;

  await updateReviewRequestStatus(Number(idRaw), status).catch(() => null);

  revalidatePath('/dashboard/reviews');
  if (/^\d+$/.test(invoiceIdRaw)) {
    revalidatePath(`/dashboard/billing/invoices/${invoiceIdRaw}`);
  }
  revalidatePath(String(formData.get('refresh_path') || '/dashboard/reviews'));
}
