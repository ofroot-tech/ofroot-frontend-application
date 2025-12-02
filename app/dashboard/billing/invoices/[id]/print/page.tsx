// A minimal, print-friendly invoice view — zero-cost PDF via browser print.
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { TOKEN_COOKIE_NAME, LEGACY_COOKIE_NAME } from '@/app/lib/cookies';
import { api } from '@/app/lib/api';

async function getToken() {
  const store = await cookies();
  return store.get(TOKEN_COOKIE_NAME)?.value || store.get(LEGACY_COOKIE_NAME)?.value;
}

export default async function PrintInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: idParam } = await params;
  const token = await getToken();
  if (!token) redirect('/auth/login');
  const id = Number(idParam);
  if (!Number.isFinite(id)) redirect('/dashboard/billing');
  const res = await api.adminGetInvoice(id, token).catch(() => null);
  const inv = res?.data;
  if (!inv) redirect('/dashboard/billing');
  const meta: any = inv.meta || {};
  const finalized: Array<{ description: string; quantity: number; unit_amount_cents: number }>|undefined = Array.isArray(meta.items_final) ? meta.items_final : undefined;
  const drafted: Array<{ description: string; quantity: number; unit_amount_cents: number }>|undefined = Array.isArray(meta.items_draft) ? meta.items_draft : undefined;
  const items = finalized?.length ? finalized : (drafted?.length ? drafted : (inv.items || []).map((it) => ({ description: it.description, quantity: it.quantity, unit_amount_cents: it.unit_amount_cents })));
  const lineTotal = (q: number, u: number) => Math.max(0, Math.round((q || 0) * (u || 0)));
  const totalCents = Number(meta.items_final_total_cents ?? meta.items_draft_total_cents ?? inv.amount_cents ?? 0) || items.reduce((acc, it) => acc + lineTotal(it.quantity, it.unit_amount_cents), 0);
  const total = totalCents / 100;

  return (
    <div className="p-6 print:p-0 max-w-3xl mx-auto text-sm">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="text-xl font-semibold">Invoice {inv.number}</div>
          <div className="text-gray-600">{inv.created_at?.slice(0,10) ?? ''}</div>
          {inv.due_date && <div className="text-gray-600">Due {inv.due_date.slice(0,10)}</div>}
          {meta.finalized_at && (
            <div className="mt-2 inline-flex items-center gap-2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 text-xs">
              Finalized <span className="opacity-75">{new Date(meta.finalized_at).toISOString().slice(0,10)}</span>
            </div>
          )}
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
          {items.map((it, idx) => (
            <tr key={`${idx}-${it.description}`} className="align-top">
              <td className="py-2 border-b">{it.description}</td>
              <td className="py-2 border-b">{it.quantity}</td>
              <td className="py-2 border-b text-right">${(it.unit_amount_cents/100).toFixed(2)}</td>
              <td className="py-2 border-b text-right">${(lineTotal(it.quantity, it.unit_amount_cents)/100).toFixed(2)}</td>
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
