// app/invoice/[externalId]/receipt/page.tsx
import { api, type Invoice } from '@/app/lib/api';
import AmountDisplay from '@/app/dashboard/billing/_components/AmountDisplay';
import { notFound } from 'next/navigation';

export default async function PublicReceiptPage({ params }: { params: { externalId: string } }) {
  const externalId = decodeURIComponent(params.externalId || '');
  if (!externalId) notFound();

  let invoice: Invoice | undefined;
  try {
    const res = await api.publicGetInvoiceByExternalId(externalId);
    invoice = res?.data;
  } catch {
    notFound();
  }
  if (!invoice) notFound();

  const meta: any = invoice.meta || {};
  const items: Array<{ description: string; quantity: number; unit_amount_cents: number }> = Array.isArray(meta.items_final)
    ? meta.items_final
    : Array.isArray(meta.items_draft)
      ? meta.items_draft
      : (invoice.items || []).map((it) => ({ description: it.description, quantity: it.quantity, unit_amount_cents: it.unit_amount_cents }));
  const lineTotal = (q: number, u: number) => Math.max(0, Math.round((q || 0) * (u || 0)));
  const totalCents = Number(meta.items_final_total_cents ?? meta.items_draft_total_cents ?? invoice.amount_cents ?? 0) || items.reduce((acc, it) => acc + lineTotal(it.quantity, it.unit_amount_cents), 0);
  const total = totalCents / 100;
  const paid = (invoice.amount_paid_cents ?? 0) / 100;

  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold">Receipt for Invoice {invoice.number}</h1>
          <div className="text-gray-600">{invoice.created_at?.slice(0,10) ?? ''}</div>
        </div>
        <div className="text-right text-sm">
          <div className="text-gray-600">Total</div>
          <div className="text-lg font-medium"><AmountDisplay value={total} currency={invoice.currency} animate={false} /></div>
          <div className="text-gray-600 mt-2">Paid</div>
          <div className="text-base font-medium"><AmountDisplay value={paid} currency={invoice.currency} animate={false} /></div>
        </div>
      </div>

      <div className="rounded border p-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500">
              <th className="py-1">Description</th>
              <th className="py-1">Qty</th>
              <th className="py-1 text-right">Unit</th>
              <th className="py-1 text-right">Total</th>
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
      </div>

      {invoice.payments && invoice.payments.length > 0 && (
        <div className="mt-6">
          <div className="text-sm text-gray-600 mb-2">Payments</div>
          <ul className="text-sm list-disc ml-5">
            {invoice.payments.map((p) => (
              <li key={p.id}>
                ${(p.amount_cents/100).toFixed(2)} {p.currency?.toUpperCase()} — {p.status}
                {p.created_at ? ` on ${p.created_at.slice(0,10)}` : ''}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6 text-sm">
        <a href={`/invoice/${encodeURIComponent(externalId)}`} className="text-blue-600 hover:underline">Back to invoice</a>
      </div>
    </div>
  );
}
