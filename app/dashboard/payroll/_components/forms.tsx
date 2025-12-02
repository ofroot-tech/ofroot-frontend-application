'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useTransition, useState, useEffect } from 'react';
import {
  createPayScheduleAction,
  createPayrollRunAction,
  approveTimeEntryAction,
  rejectTimeEntryAction,
  decideTimeOffAction,
  createEmployeeAction,
  bulkTaxUpdateAction,
  bulkBenefitSyncAction,
  updateBrandSettingsAction,
  type ActionResult,
} from '../actions';
import type { BenefitPlan, Employee, PaySchedule, TenantBrandSettings } from '@/app/lib/api';

function arrayToCsv(rows: Array<Record<string, any>>) {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  const csvRows = [headers.join(',')];
  for (const row of rows) {
    csvRows.push(headers.map((key) => JSON.stringify(row[key] ?? '')).join(','));
  }
  return csvRows.join('\n');
}

export function useRosterExport(employees: Employee[]) {
  return () => {
    if (!employees.length) return;
    const csv = arrayToCsv(
      employees.map((employee) => ({
        id: employee.id,
        name: `${employee.first_name} ${employee.last_name}`.trim(),
        email: employee.email,
        employment_type: employee.employment_type,
        compensation_type: employee.compensation_type,
        status: employee.status,
        job_title: employee.job_title,
        department: employee.department,
        hire_date: employee.hire_date ?? '',
        base_salary_cents: employee.base_salary_cents ?? '',
        hourly_rate_cents: employee.hourly_rate_cents ?? '',
      }))
    );
    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'payroll-roster.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  };
}

const idleState: ActionResult = { status: 'idle' };

function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
    >
      {pending ? 'Saving…' : children}
    </button>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-xs font-medium text-gray-600">{children}</span>;
}

export function FormMessage({ state }: { state: ActionResult }) {
  if (state.status === 'idle') return null;
  const isError = state.status === 'error';
  return (
    <div
      className={`rounded-md px-3 py-2 text-sm ${
        isError ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'
      }`}
    >
      {state.message || (isError ? 'Something went wrong.' : 'Success.')}
    </div>
  );
}

export function CreatePayScheduleForm({ tenantId }: { tenantId?: number | null }) {
  const [state, formAction] = useFormState(createPayScheduleAction, idleState);

  if (!tenantId) {
    return <p className="text-sm text-gray-500">Select a tenant to configure schedules.</p>;
  }

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="tenant_id" value={tenantId} />
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <FieldLabel>Name</FieldLabel>
          <input name="name" className="rounded-md border px-2 py-1" placeholder="Biweekly Payroll" required />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <FieldLabel>Frequency</FieldLabel>
          <select name="frequency" className="rounded-md border px-2 py-1">
            <option value="weekly">Weekly</option>
            <option value="biweekly">Biweekly</option>
            <option value="semimonthly">Semi-monthly</option>
            <option value="monthly">Monthly</option>
            <option value="custom">Custom</option>
          </select>
        </label>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <FieldLabel>Timezone</FieldLabel>
          <input name="timezone" defaultValue="America/New_York" className="rounded-md border px-2 py-1" required />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <FieldLabel>Payday offset (days)</FieldLabel>
          <input name="pay_day_offset" type="number" className="rounded-md border px-2 py-1" placeholder="2" />
        </label>
      </div>
      <label className="inline-flex items-center gap-2 text-sm text-gray-600">
        <input type="checkbox" name="active" defaultChecked /> Active
      </label>
      <FormMessage state={state} />
      <SubmitButton>Save schedule</SubmitButton>
    </form>
  );
}

export function CreatePayrollRunForm({ tenantId, schedules }: { tenantId?: number | null; schedules: PaySchedule[] }) {
  const [state, formAction] = useFormState(createPayrollRunAction, idleState);

  if (!tenantId) {
    return <p className="text-sm text-gray-500">Select a tenant to run payroll.</p>;
  }

  if (!schedules.length) {
    return <p className="text-sm text-gray-500">Create a pay schedule first.</p>;
  }

  const defaultSchedule = schedules[0];

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="tenant_id" value={tenantId} />
      <label className="flex flex-col gap-1 text-sm">
        <FieldLabel>Pay schedule</FieldLabel>
        <select name="pay_schedule_id" className="rounded-md border px-2 py-1">
          {schedules.map((schedule) => (
            <option key={schedule.id} value={schedule.id}>
              {schedule.name} ({schedule.frequency})
            </option>
          ))}
        </select>
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <FieldLabel>Period start</FieldLabel>
          <input name="period_start" type="date" className="rounded-md border px-2 py-1" required />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <FieldLabel>Period end</FieldLabel>
          <input name="period_end" type="date" className="rounded-md border px-2 py-1" required />
        </label>
      </div>
      <label className="flex flex-col gap-1 text-sm">
        <FieldLabel>Check date</FieldLabel>
        <input name="check_date" type="date" className="rounded-md border px-2 py-1" defaultValue={defaultSchedule.next_run_on ?? undefined} />
      </label>
      <FormMessage state={state} />
      <SubmitButton>Draft payroll</SubmitButton>
    </form>
  );
}

export function CreateEmployeeForm({ tenantId }: { tenantId?: number | null }) {
  const [state, formAction] = useFormState(createEmployeeAction, idleState);

  if (!tenantId) return <p className="text-sm text-gray-500">Select a tenant first.</p>;

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="tenant_id" value={tenantId} />
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <FieldLabel>First name</FieldLabel>
          <input name="first_name" className="rounded-md border px-2 py-1" required />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <FieldLabel>Last name</FieldLabel>
          <input name="last_name" className="rounded-md border px-2 py-1" required />
        </label>
      </div>
      <label className="flex flex-col gap-1 text-sm">
        <FieldLabel>Email</FieldLabel>
        <input name="email" type="email" className="rounded-md border px-2 py-1" required />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <FieldLabel>Job title</FieldLabel>
          <input name="job_title" className="rounded-md border px-2 py-1" placeholder="Operations Manager" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <FieldLabel>Department</FieldLabel>
          <input name="department" className="rounded-md border px-2 py-1" placeholder="Ops" />
        </label>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <FieldLabel>Employment type</FieldLabel>
          <select name="employment_type" className="rounded-md border px-2 py-1">
            <option value="full_time">Full time</option>
            <option value="part_time">Part time</option>
            <option value="contractor">Contractor</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <FieldLabel>Compensation type</FieldLabel>
          <select name="compensation_type" className="rounded-md border px-2 py-1">
            <option value="salary">Salary</option>
            <option value="hourly">Hourly</option>
            <option value="contract">Contract</option>
          </select>
        </label>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <FieldLabel>Base salary ($)</FieldLabel>
          <input name="base_salary" type="number" step="0.01" className="rounded-md border px-2 py-1" placeholder="90000" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <FieldLabel>Hourly rate ($)</FieldLabel>
          <input name="hourly_rate" type="number" step="0.01" className="rounded-md border px-2 py-1" placeholder="45" />
        </label>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <FieldLabel>Hire date</FieldLabel>
          <input name="hire_date" type="date" className="rounded-md border px-2 py-1" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <FieldLabel>Location</FieldLabel>
          <input name="location" className="rounded-md border px-2 py-1" placeholder="Austin, TX" />
        </label>
      </div>
      <label className="flex flex-col gap-1 text-sm">
        <FieldLabel>Phone</FieldLabel>
        <input name="phone" className="rounded-md border px-2 py-1" />
      </label>
      <FormMessage state={state} />
      <SubmitButton>Create employee</SubmitButton>
    </form>
  );
}

export function BulkTaxUpdateForm({ tenantId, employees }: { tenantId?: number | null; employees: Employee[] }) {
  const [state, formAction] = useFormState(bulkTaxUpdateAction, idleState);
  if (!tenantId || !employees.length) return <p className="text-sm text-gray-500">Add employees to enable bulk updates.</p>;

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="tenant_id" value={tenantId} />
      <label className="flex flex-col gap-1 text-sm">
        <FieldLabel>Select employees</FieldLabel>
        <select name="employee_ids" multiple className="rounded-md border px-2 py-1 min-h-[120px]" required>
          {employees.map((employee) => (
            <option key={employee.id} value={employee.id}>
              {employee.first_name} {employee.last_name} · {employee.employment_type}
            </option>
          ))}
        </select>
        <span className="text-xs text-gray-500">Hold Cmd/Ctrl to multi-select.</span>
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <FieldLabel>Filing status</FieldLabel>
          <select name="filing_status" className="rounded-md border px-2 py-1">
            <option value="single">Single</option>
            <option value="married">Married</option>
            <option value="married_separately">Married filing separately</option>
            <option value="head_of_household">Head of household</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <FieldLabel>Allowances</FieldLabel>
          <input name="allowances" type="number" className="rounded-md border px-2 py-1" placeholder="0" />
        </label>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <FieldLabel>Extra withholding ($)</FieldLabel>
          <input name="extra_withholding" type="number" step="0.01" className="rounded-md border px-2 py-1" />
        </label>
        <div className="flex flex-col gap-2 text-sm text-gray-600">
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" name="exempt_federal" />
            Federal exempt
          </label>
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" name="exempt_state" />
            State exempt
          </label>
        </div>
      </div>
      <FormMessage state={state} />
      <SubmitButton>Apply update</SubmitButton>
    </form>
  );
}

export function BulkBenefitUpdateForm({ tenantId, plans, employees }: { tenantId?: number | null; plans: BenefitPlan[]; employees: Employee[] }) {
  const [state, formAction] = useFormState(bulkBenefitSyncAction, idleState);
  if (!tenantId || !plans.length || !employees.length) return <p className="text-sm text-gray-500">Add plans and employees to manage enrollments.</p>;

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="tenant_id" value={tenantId} />
      <label className="flex flex-col gap-1 text-sm">
        <FieldLabel>Select employees</FieldLabel>
        <select name="benefit_employee_ids" multiple className="rounded-md border px-2 py-1 min-h-[120px]" required>
          {employees.map((employee) => (
            <option key={employee.id} value={employee.id}>
              {employee.first_name} {employee.last_name} · {employee.employment_type}
            </option>
          ))}
        </select>
        <span className="text-xs text-gray-500">Hold Cmd/Ctrl to multi-select.</span>
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <FieldLabel>Benefit plan</FieldLabel>
        <select name="benefit_plan_id" className="rounded-md border px-2 py-1">
          {plans.map((plan) => (
            <option key={plan.id} value={plan.id}>
              {plan.name} ({plan.type})
            </option>
          ))}
        </select>
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <FieldLabel>Status</FieldLabel>
          <select name="benefit_status" className="rounded-md border px-2 py-1">
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="waived">Waived</option>
            <option value="terminated">Terminated</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <FieldLabel>Effective date</FieldLabel>
          <input name="benefit_effective_date" type="date" className="rounded-md border px-2 py-1" />
        </label>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <FieldLabel>Employee contribution ($)</FieldLabel>
          <input name="benefit_employee_contribution" type="number" step="0.01" className="rounded-md border px-2 py-1" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <FieldLabel>Employer contribution ($)</FieldLabel>
          <input name="benefit_employer_contribution" type="number" step="0.01" className="rounded-md border px-2 py-1" />
        </label>
      </div>
      <FormMessage state={state} />
      <SubmitButton>Sync benefits</SubmitButton>
    </form>
  );
}

export function BrandSettingsForm({ tenantId, defaults }: { tenantId?: number | null; defaults?: TenantBrandSettings | null }) {
  const [state, formAction] = useFormState(updateBrandSettingsAction, idleState);
  if (!tenantId) return null;

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="tenant_id" value={tenantId} />
      <label className="flex flex-col gap-1 text-sm">
        <FieldLabel>Display name</FieldLabel>
        <input name="display_name" className="rounded-md border px-2 py-1" defaultValue={defaults?.display_name || ''} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <FieldLabel>Logo URL</FieldLabel>
        <input name="logo_url" className="rounded-md border px-2 py-1" defaultValue={defaults?.logo_url || ''} />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <FieldLabel>Primary color</FieldLabel>
          <input name="primary_color" className="rounded-md border px-2 py-1" defaultValue={defaults?.primary_color || 'oklch(0.45 0.09 250)'} />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <FieldLabel>Accent color</FieldLabel>
          <input name="accent_color" className="rounded-md border px-2 py-1" defaultValue={defaults?.accent_color || 'oklch(0.65 0.13 200)'} />
        </label>
      </div>
      <label className="flex flex-col gap-1 text-sm">
        <FieldLabel>Font family</FieldLabel>
        <input name="font_family" className="rounded-md border px-2 py-1" defaultValue={defaults?.font_family || 'Inter'} />
      </label>
      <FormMessage state={state} />
      <SubmitButton>Save branding</SubmitButton>
    </form>
  );
}

function useActionFeedback() {
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const run = (fn: () => Promise<void>, successText: string) => {
    startTransition(async () => {
      try {
        await fn();
        setMessage(successText);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : 'Unable to complete action.');
      }
      setTimeout(() => setMessage(null), 4000);
    });
  };

  return { run, message, pending };
}

export function TimeEntryActions({ entryId, tenantId }: { entryId: number; tenantId: number }) {
  const { run, message, pending } = useActionFeedback();

  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => run(() => approveTimeEntryAction({ entryId, tenantId }), 'Entry approved.')}
          disabled={pending}
          className="rounded-md border border-green-200 bg-green-50 px-2 py-1 text-xs font-medium text-green-800 disabled:opacity-50"
        >
          Approve
        </button>
        <button
          type="button"
          onClick={() => run(() => rejectTimeEntryAction({ entryId, tenantId }), 'Entry rejected.')}
          disabled={pending}
          className="rounded-md border border-gray-300 px-2 py-1 text-xs font-medium text-gray-700 disabled:opacity-50"
        >
          Reject
        </button>
      </div>
      {message ? <span className="text-xs text-gray-500">{message}</span> : null}
    </div>
  );
}

export function TimeOffActions({ requestId, tenantId }: { requestId: number; tenantId: number }) {
  const { run, message, pending } = useActionFeedback();

  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => run(() => decideTimeOffAction({ requestId, tenantId, action: 'approve' }), 'Request approved.')}
          disabled={pending}
          className="rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-xs font-medium text-blue-800 disabled:opacity-50"
        >
          Approve
        </button>
        <button
          type="button"
          onClick={() => run(() => decideTimeOffAction({ requestId, tenantId, action: 'deny' }), 'Request denied.')}
          disabled={pending}
          className="rounded-md border border-gray-300 px-2 py-1 text-xs font-medium text-gray-700 disabled:opacity-50"
        >
          Deny
        </button>
      </div>
      {message ? <span className="text-xs text-gray-500">{message}</span> : null}
    </div>
  );
}
