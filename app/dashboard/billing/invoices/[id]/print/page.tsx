// A minimal, print-friendly invoice view — zero-cost PDF via browser print.
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { TOKEN_COOKIE_NAME, LEGACY_COOKIE_NAME } from '@/app/lib/cookies';
import { api } from '@/app/lib/api';

async function getToken() {
  const store = await cookies();
  return store.get(TOKEN_COOKIE_NAME)?.value || store.get(LEGACY_COOKIE_NAME)?.value;
}

export default async function PrintInvoicePage({ params }: { params: { id: string } }) {
  const token = await getToken();
  if (!token) redirect('/auth/login');
  const id = Number(params.id);
  if (!Number.isFinite(id)) redirect('/dashboard/billing');
  const res = await api.adminGetInvoice(id, token).catch(() => null);
  const inv = res?.data;
  if (!inv) redirect('/dashboard/billing');

  const total = (inv.amount_cents ?? 0) / 100;

  return (
    <div className="p-6 print:p-0 max-w-3xl mx-auto text-sm">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="text-xl font-semibold">Invoice {inv.number}</div>
          <div className="text-gray-600">{inv.created_at?.slice(0,10) ?? ''}</div>
          {inv.due_date && <div className="text-gray-600">Due {inv.due_date.slice(0,10)}</div>}
        </div>
        <div className="text-right">
          {inv.meta?.bill_to && <div className="font-medium">Bill To</div>}
          {inv.meta?.bill_to && <div>{inv.meta?.bill_to}</div>}
        </div>
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr className="text-left text-gray-600">
            <th className="border-b py-2">Description</th>
            <th className="border-b py-2 w-16">Qty</th>
            <th className="border-b py-2 w-28 text-right">Unit</th>
            <th className="border-b py-2 w-28 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {inv.items?.map((it) => (
            <tr key={it.id} className="align-top">
              <td className="py-2 border-b">{it.description}</td>
              <td className="py-2 border-b">{it.quantity}</td>
              <td className="py-2 border-b text-right">${(it.unit_amount_cents/100).toFixed(2)}</td>
              <td className="py-2 border-b text-right">${(it.total_cents/100).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="text-right mt-4">
        <div className="text-lg font-semibold">Total ${total.toFixed(2)} {inv.currency?.toUpperCase()}</div>
      </div>
    </div>
  );
}
