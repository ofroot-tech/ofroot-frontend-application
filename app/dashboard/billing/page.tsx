// app/dashboard/billing/page.tsx
// Billing — invoices, payments, dunning.

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { api } from '@/app/lib/api';
import { TOKEN_COOKIE_NAME, LEGACY_COOKIE_NAME } from '@/app/lib/cookies';
import { PageHeader, Card, CardBody } from '@/app/dashboard/_components/UI';

async function getToken() {
  const store = await cookies();
  return store.get(TOKEN_COOKIE_NAME)?.value || store.get(LEGACY_COOKIE_NAME)?.value;
}

export default async function BillingPage() {
  const token = await getToken();
  if (!token) redirect('/auth/login');

  const me = await api.me(token).catch(() => null);
  if (!me) redirect('/auth/login');

  // Skeleton cards
  return (
    <div className="space-y-6">
      <PageHeader title="Billing" subtitle="Invoices, payments, and dunning." />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardBody>
            <h2 className="font-medium mb-2">Invoices</h2>
            <p className="text-sm text-gray-600">None yet.</p>
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
