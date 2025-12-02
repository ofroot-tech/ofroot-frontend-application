'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { api, type BenefitEnrollment, type Employee, type PaySchedule, type TenantBrandSettings } from '@/app/lib/api';
import { TOKEN_COOKIE_NAME, LEGACY_COOKIE_NAME } from '@/app/lib/cookies';

export type ActionResult = { status: 'idle' | 'success' | 'error'; message?: string };

async function getToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(TOKEN_COOKIE_NAME)?.value || store.get(LEGACY_COOKIE_NAME)?.value || null;
}

function errorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (error && typeof error === 'object' && 'message' in error && typeof (error as any).message === 'string') {
    return (error as any).message;
  }
  return fallback;
}

function toCents(value: FormDataEntryValue | null): number | undefined {
  if (value == null) return undefined;
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return undefined;
  return Math.round(numeric * 100);
}

export async function createPayScheduleAction(prevState: ActionResult, formData: FormData): Promise<ActionResult> {
  const token = await getToken();
  if (!token) {
    return { status: 'error', message: 'Authentication required.' };
  }

  const tenantId = Number(formData.get('tenant_id'));
  const payload = {
    tenant_id: tenantId,
    name: String(formData.get('name') || ''),
    frequency: formData.get('frequency') as PaySchedule['frequency'],
    timezone: String(formData.get('timezone') || 'UTC'),
    period_anchor_day: formData.get('period_anchor_day') ? Number(formData.get('period_anchor_day')) : undefined,
    period_anchor_date: formData.get('period_anchor_date') ? Number(formData.get('period_anchor_date')) : undefined,
    pay_day_offset: formData.get('pay_day_offset') ? Number(formData.get('pay_day_offset')) : undefined,
    next_run_on: formData.get('next_run_on') ? String(formData.get('next_run_on')) : undefined,
    active: formData.get('active') === 'on',
  };

  if (!payload.tenant_id || !payload.name) {
    return { status: 'error', message: 'Tenant and name are required.' };
  }

  try {
    await api.payrollCreateSchedule(token, payload);
    revalidatePath('/dashboard/payroll');
    return { status: 'success', message: 'Pay schedule created.' };
  } catch (error) {
    return { status: 'error', message: errorMessage(error) };
  }
}

export async function createPayrollRunAction(prevState: ActionResult, formData: FormData): Promise<ActionResult> {
  const token = await getToken();
  if (!token) {
    return { status: 'error', message: 'Authentication required.' };
  }

  const tenantId = Number(formData.get('tenant_id'));
  const scheduleId = Number(formData.get('pay_schedule_id'));
  const periodStart = String(formData.get('period_start') || '');
  const periodEnd = String(formData.get('period_end') || '');
  const checkDate = formData.get('check_date') ? String(formData.get('check_date')) : undefined;

  if (!tenantId || !scheduleId || !periodStart || !periodEnd) {
    return { status: 'error', message: 'All fields are required to run payroll.' };
  }

  try {
    await api.payrollCreateRun(token, {
      tenant_id: tenantId,
      pay_schedule_id: scheduleId,
      period_start: periodStart,
      period_end: periodEnd,
      check_date: checkDate,
    });
    revalidatePath('/dashboard/payroll');
    return { status: 'success', message: 'Payroll run drafted.' };
  } catch (error) {
    return { status: 'error', message: errorMessage(error) };
  }
}

export async function createEmployeeAction(prevState: ActionResult, formData: FormData): Promise<ActionResult> {
  const token = await getToken();
  if (!token) {
    return { status: 'error', message: 'Authentication required.' };
  }

  const tenantId = Number(formData.get('tenant_id'));
  const payload = {
    tenant_id: tenantId,
    first_name: String(formData.get('first_name') || ''),
    last_name: String(formData.get('last_name') || ''),
    email: String(formData.get('email') || ''),
    job_title: formData.get('job_title') ? String(formData.get('job_title')) : undefined,
    department: formData.get('department') ? String(formData.get('department')) : undefined,
    employment_type: (formData.get('employment_type') as Employee['employment_type']) || 'full_time',
    compensation_type: (formData.get('compensation_type') as Employee['compensation_type']) || 'salary',
    base_salary_cents: toCents(formData.get('base_salary')) || undefined,
    hourly_rate_cents: toCents(formData.get('hourly_rate')) || undefined,
    hire_date: formData.get('hire_date') ? String(formData.get('hire_date')) : undefined,
    location: formData.get('location') ? String(formData.get('location')) : undefined,
    phone: formData.get('phone') ? String(formData.get('phone')) : undefined,
  };

  if (!payload.tenant_id || !payload.first_name || !payload.last_name || !payload.email) {
    return { status: 'error', message: 'Name and email are required.' };
  }

  try {
    await api.payrollCreateEmployee(token, payload);
    revalidatePath('/dashboard/payroll');
    return { status: 'success', message: 'Employee created.' };
  } catch (error) {
    return { status: 'error', message: errorMessage(error) };
  }
}

export async function approveTimeEntryAction(params: { entryId: number; tenantId: number }) {
  const token = await getToken();
  if (!token) throw new Error('Authentication required.');
  try {
    await api.payrollApproveTimeEntry(params.entryId, token, params.tenantId);
    revalidatePath('/dashboard/payroll');
  } catch (error) {
    throw new Error(errorMessage(error));
  }
}

export async function rejectTimeEntryAction(params: { entryId: number; tenantId: number }) {
  const token = await getToken();
  if (!token) throw new Error('Authentication required.');
  try {
    await api.payrollRejectTimeEntry(params.entryId, token, params.tenantId);
    revalidatePath('/dashboard/payroll');
  } catch (error) {
    throw new Error(errorMessage(error));
  }
}

export async function decideTimeOffAction(params: { requestId: number; tenantId: number; action: 'approve' | 'deny' | 'cancel' }) {
  const token = await getToken();
  if (!token) throw new Error('Authentication required.');
  try {
    await api.payrollDecideTimeOffRequest(params.requestId, token, {
      tenant_id: params.tenantId,
      action: params.action,
    });
    revalidatePath('/dashboard/payroll');
  } catch (error) {
    throw new Error(errorMessage(error));
  }
}

export async function bulkTaxUpdateAction(prevState: ActionResult, formData: FormData): Promise<ActionResult> {
  const token = await getToken();
  if (!token) return { status: 'error', message: 'Authentication required.' };

  const tenantId = Number(formData.get('tenant_id'));
  const employeeIds = formData
    .getAll('employee_ids')
    .map((value) => Number(value))
    .filter((id) => Number.isFinite(id));

  if (!tenantId || employeeIds.length === 0) {
    return { status: 'error', message: 'Pick at least one employee.' };
  }

  const allowances = formData.get('allowances') ? Number(formData.get('allowances')) : undefined;
  const payload = {
    tenant_id: tenantId,
    employee_ids: employeeIds,
    filing_status: formData.get('filing_status') ? String(formData.get('filing_status')) : undefined,
    allowances: typeof allowances === 'number' && !Number.isNaN(allowances) ? allowances : undefined,
    extra_withholding_cents: toCents(formData.get('extra_withholding')) || undefined,
    exempt_federal: formData.get('exempt_federal') === 'on',
    exempt_state: formData.get('exempt_state') === 'on',
  };

  try {
    await api.payrollBulkUpdateTaxProfiles(token, payload);
    revalidatePath('/dashboard/payroll');
    return { status: 'success', message: 'Tax profiles updated.' };
  } catch (error) {
    return { status: 'error', message: errorMessage(error) };
  }
}

export async function bulkBenefitSyncAction(prevState: ActionResult, formData: FormData): Promise<ActionResult> {
  const token = await getToken();
  if (!token) return { status: 'error', message: 'Authentication required.' };

  const tenantId = Number(formData.get('tenant_id'));
  const planId = Number(formData.get('benefit_plan_id'));
  const employeeIds = formData
    .getAll('benefit_employee_ids')
    .map((value) => Number(value))
    .filter((id) => Number.isFinite(id));

  if (!tenantId || !planId || employeeIds.length === 0) {
    return { status: 'error', message: 'Plan and employees are required.' };
  }

  const payload = {
    tenant_id: tenantId,
    benefit_plan_id: planId,
    employee_ids: employeeIds,
    status: (formData.get('benefit_status') as BenefitEnrollment['status']) || 'pending',
    effective_date: formData.get('benefit_effective_date') ? String(formData.get('benefit_effective_date')) : undefined,
    employee_contribution_cents: toCents(formData.get('benefit_employee_contribution')) || undefined,
    employer_contribution_cents: toCents(formData.get('benefit_employer_contribution')) || undefined,
  };

  try {
    await api.payrollBulkEnrollBenefits(token, payload);
    revalidatePath('/dashboard/payroll');
    return { status: 'success', message: 'Benefit enrollments updated.' };
  } catch (error) {
    return { status: 'error', message: errorMessage(error) };
  }
}

export async function updateBrandSettingsAction(prevState: ActionResult, formData: FormData): Promise<ActionResult> {
  const token = await getToken();
  if (!token) return { status: 'error', message: 'Authentication required.' };

  const tenantId = Number(formData.get('tenant_id'));
  if (!tenantId) return { status: 'error', message: 'Tenant is required.' };

  const payload: TenantBrandSettings & { tenant_id: number } = {
    tenant_id: tenantId,
    display_name: formData.get('display_name') ? String(formData.get('display_name')) : undefined,
    logo_url: formData.get('logo_url') ? String(formData.get('logo_url')) : undefined,
    primary_color: formData.get('primary_color') ? String(formData.get('primary_color')) : undefined,
    accent_color: formData.get('accent_color') ? String(formData.get('accent_color')) : undefined,
    font_family: formData.get('font_family') ? String(formData.get('font_family')) : undefined,
    options: undefined,
  };

  try {
    await api.payrollUpdateBrandSettings(token, payload);
    revalidatePath('/dashboard/payroll');
    return { status: 'success', message: 'Branding saved.' };
  } catch (error) {
    return { status: 'error', message: errorMessage(error) };
  }
}
