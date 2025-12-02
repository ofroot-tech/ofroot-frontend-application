'use client';

import { useRouter, useSearchParams } from 'next/navigation';

type TenantOption = {
  id: number;
  name?: string | null;
};

export function TenantScopePicker({ tenants, activeTenantId }: { tenants: TenantOption[]; activeTenantId?: number | null }) {
  const router = useRouter();
  const search = useSearchParams();

  if (!tenants.length) {
    return <span className="text-sm text-gray-500">No tenants available</span>;
  }

  const handleChange = (tenantId: string) => {
    const params = new URLSearchParams(search?.toString() || '');
    if (tenantId) params.set('tenant_id', tenantId);
    else params.delete('tenant_id');
    const qs = params.toString();
    router.push(`/dashboard/payroll${qs ? `?${qs}` : ''}`);
  };

  return (
    <label className="text-sm text-gray-600 inline-flex flex-col">
      <span className="text-xs uppercase tracking-wide text-gray-500">Tenant scope</span>
      <select
        className="mt-1 rounded-md border border-gray-300 bg-white px-2 py-1 text-sm"
        defaultValue={activeTenantId ? String(activeTenantId) : tenants[0] ? String(tenants[0].id) : ''}
        onChange={(event) => handleChange(event.currentTarget.value)}
      >
        {tenants.map((tenant) => (
          <option key={tenant.id} value={tenant.id}>
            {tenant.name || `Tenant #${tenant.id}`}
          </option>
        ))}
      </select>
    </label>
  );
}
