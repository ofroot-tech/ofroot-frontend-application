"use client";

import { useMemo } from 'react';
import type { Employee } from '@/app/lib/api';
import { Card, CardHeader, CardBody, EmptyState } from '@/app/dashboard/_components/UI';
import { useRosterExport } from './forms';

type Props = {
  employees: Employee[];
  aggregates?: Record<string, number | undefined> | null;
};

function badgeClass(status: string) {
  switch (status) {
    case 'active':
      return 'bg-green-50 text-green-700 border-green-200';
    case 'on_leave':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'terminated':
      return 'bg-gray-100 text-gray-600 border-gray-200';
    default:
      return 'bg-blue-50 text-blue-700 border-blue-200';
  }
}

export function RosterCard({ employees, aggregates }: Props) {
  const rosterSlice = employees.slice(0, 8);
  const exportCsv = useRosterExport(employees);
  const summary = useMemo(() => {
    const defaults = { active: 0, contractors: 0, onboarding: 0 };
    if (!aggregates) {
      const active = employees.filter((employee) => employee.status === 'active').length;
      const contractors = employees.filter((employee) => employee.employment_type === 'contractor').length;
      return { ...defaults, active, contractors, onboarding: 0 };
    }
    return {
      active: aggregates.active ?? 0,
      contractors: aggregates.contractors ?? 0,
      onboarding: aggregates.onboarding ?? 0,
    };
  }, [aggregates, employees]);

  return (
    <Card>
      <CardHeader className="flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
        <div>
          <div className="text-sm font-medium text-gray-800">Employee roster</div>
          <p className="text-sm text-gray-500">Track full-time, part-time, and contractors in one pane.</p>
        </div>
        <div className="flex flex-wrap gap-3 text-xs text-gray-600">
          <span className="rounded-md border border-gray-200 px-2 py-1">Active · {summary.active}</span>
          <span className="rounded-md border border-gray-200 px-2 py-1">Contractors · {summary.contractors}</span>
          <span className="rounded-md border border-gray-200 px-2 py-1">Onboarding · {summary.onboarding}</span>
        </div>
        <button
          type="button"
          onClick={exportCsv}
          className="ml-auto inline-flex items-center rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Download CSV
        </button>
      </CardHeader>
      <CardBody>
        {employees.length === 0 ? (
          <EmptyState title="No people yet" description="Add your first employee to unlock payroll automations." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {rosterSlice.map((employee) => (
              <div key={employee.id} className="rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      {employee.first_name} {employee.last_name}
                    </div>
                    <div className="text-xs text-gray-500">{employee.job_title || 'Role TBD'}</div>
                  </div>
                  <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${badgeClass(employee.status)}`}>
                    {employee.status.replace('_', ' ')}
                  </span>
                </div>
                <dl className="mt-4 space-y-2 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <dt>Employment</dt>
                    <dd className="font-medium capitalize">{employee.employment_type.replace('_', ' ')}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>Comp</dt>
                    <dd className="font-medium capitalize">{employee.compensation_type}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>Hire date</dt>
                    <dd>{employee.hire_date ? new Date(employee.hire_date).toLocaleDateString() : '—'}</dd>
                  </div>
                </dl>
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
}

export default RosterCard;
