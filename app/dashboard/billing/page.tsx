// app/dashboard/billing/page.tsx
// Billing — invoices, payments, dunning.

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { api, type Invoice, type Tenant, type AdminUser } from '@/app/lib/api';
import { TOKEN_COOKIE_NAME, LEGACY_COOKIE_NAME } from '@/app/lib/cookies';
import { PageHeader, Card, CardBody } from '@/app/dashboard/_components/UI';
import CreateInvoiceForm from './_components/CreateInvoiceForm';

async function getToken() {
  const store = await cookies();
  return store.get(TOKEN_COOKIE_NAME)?.value || store.get(LEGACY_COOKIE_NAME)?.value;
}

export default async function BillingPage() {
  const token = await getToken();
  if (!token) redirect('/auth/login');

  const me = await api.me(token).catch(() => null);
  if (!me) redirect('/auth/login');

  const [list, tenantsRes, usersRes] = await Promise.all([
    api.adminListInvoices(token).catch(() => null),
    api.adminListTenants(token).catch(() => null),
    api.adminListUsers(token).catch(() => null),
  ]);
  const invoices: Invoice[] = list?.data ?? [];
  const tenants: Tenant[] = tenantsRes?.data ?? [];
  const users: AdminUser[] = usersRes?.data ?? [];
  return (
    <div className="space-y-6 reveal-in fade-only">
      <PageHeader title="Billing" subtitle="Invoices, payments, and dunning." />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-3">
          <CardBody>
            <h2 className="font-medium mb-3">Create Invoice</h2>
            <CreateInvoiceForm tenants={tenants} users={users} />
          </CardBody>
        </Card>
        <Card className="md:col-span-3">
          <CardBody>
            <h2 className="font-medium mb-3">Invoices</h2>
            {invoices.length === 0 ? (
              <p className="text-sm text-gray-600">No invoices yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500">
                      <th className="px-3 py-2">Number</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2">Amount</th>
                      <th className="px-3 py-2">Due</th>
                      <th className="px-3 py-2">Created</th>
                      <th className="px-3 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((inv) => (
                      <tr key={inv.id} className="border-t">
                        <td className="px-3 py-2 font-mono">
                          {inv.number}
                          {inv.meta && (inv.meta as any).recurring && !('recurring_parent_id' in (inv.meta as any)) && (
                            <span className="ml-2 inline-block text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">Recurring</span>
                          )}
                        </td>
                        <td className="px-3 py-2">{inv.status}</td>
                        <td className="px-3 py-2">${(inv.amount_cents / 100).toFixed(2)} {inv.currency?.toUpperCase()}</td>
                        <td className="px-3 py-2">${(inv.amount_due_cents / 100).toFixed(2)}</td>
                        <td className="px-3 py-2">{inv.created_at?.slice(0,10) ?? '—'}</td>
                        <td className="px-3 py-2">
                          <a href={`/dashboard/billing/invoices/${inv.id}`} className="text-blue-600 hover:underline">View</a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <h2 className="font-medium mb-2">Payments</h2>
            <p className="text-sm text-gray-600">None yet.</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <h2 className="font-medium mb-2">Dunning</h2>
            <p className="text-sm text-gray-600">All quiet.</p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
