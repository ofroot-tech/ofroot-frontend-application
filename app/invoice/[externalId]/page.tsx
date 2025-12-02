// app/invoice/[externalId]/page.tsx
import { api, type Invoice } from '@/app/lib/api';
import AmountDisplay from '@/app/dashboard/billing/_components/AmountDisplay';
import { notFound } from 'next/navigation';

export default async function PublicInvoicePage({ params, searchParams }: { params: Promise<{ externalId: string }>, searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const { externalId: externalIdParam } = await params;
  const resolvedSearchParams = await searchParams;
  const externalId = decodeURIComponent(externalIdParam || '');
  if (!externalId) notFound();

  let invoice: Invoice | undefined;
  try {
    const res = await api.publicGetInvoiceByExternalId(externalId);
    invoice = res?.data;
  } catch {
    // If the API returns 404 or error, treat as not found
    notFound();
  }
  if (!invoice) notFound();

  const meta: any = invoice.meta || {};
  const status = typeof resolvedSearchParams?.status === 'string' ? resolvedSearchParams?.status : undefined;
  const finalized: Array<{ description: string; quantity: number; unit_amount_cents: number }>|undefined = Array.isArray(meta.items_final) ? meta.items_final : undefined;
  const drafted: Array<{ description: string; quantity: number; unit_amount_cents: number }>|undefined = Array.isArray(meta.items_draft) ? meta.items_draft : undefined;
  const items = finalized?.length ? finalized : (drafted?.length ? drafted : (invoice.items || []).map((it) => ({ description: it.description, quantity: it.quantity, unit_amount_cents: it.unit_amount_cents })));
  const lineTotal = (q: number, u: number) => Math.max(0, Math.round((q || 0) * (u || 0)));
  const totalCents = Number(meta.items_final_total_cents ?? meta.items_draft_total_cents ?? invoice.amount_cents ?? 0) || items.reduce((acc, it) => acc + lineTotal(it.quantity, it.unit_amount_cents), 0);
  const total = totalCents / 100;
  const paid = (invoice.amount_paid_cents ?? 0) / 100;
  const due = (invoice.amount_due_cents ?? (totalCents - (invoice.amount_paid_cents ?? 0))) / 100;

  return (
    <div className="mx-auto max-w-3xl p-6">
      {status === 'success' && (
        <div className="mb-4 rounded border border-emerald-200 bg-emerald-50 text-emerald-800 px-3 py-2 text-sm">Payment succeeded. Thank you!</div>
      )}
      {status === 'cancel' && (
        <div className="mb-4 rounded border border-amber-200 bg-amber-50 text-amber-800 px-3 py-2 text-sm">Payment was canceled. You can try again below.</div>
      )}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Invoice {invoice.number}</h1>
          <div className="text-gray-600">{invoice.created_at?.slice(0,10) ?? ''}</div>
          {invoice.due_date && <div className="text-gray-600">Due {invoice.due_date.slice(0,10)}</div>}
          {meta.finalized_at && (
            <div className="mt-2 inline-flex items-center gap-2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 text-xs">
              Finalized <span className="opacity-75">{new Date(meta.finalized_at).toISOString().slice(0,10)}</span>
            </div>
          )}
        </div>
        <div className="text-right">
          {meta?.bill_to && <div className="font-medium">Bill To</div>}
          {meta?.bill_to && <div>{meta?.bill_to}</div>}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg border p-4 md:col-span-2">
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
        <div className="rounded-lg border p-4">
          <div className="text-sm text-gray-600">Total</div>
          <div className="text-xl font-semibold"><AmountDisplay value={total} currency={invoice.currency} animate={false} /></div>
          <div className="mt-2 text-sm text-gray-600">Paid</div>
          <div className="text-lg font-medium"><AmountDisplay value={paid} currency={invoice.currency} animate={false} /></div>
          <div className="mt-2 text-sm text-gray-600">Due</div>
          <div className="text-lg font-medium"><AmountDisplay value={due} currency={invoice.currency} animate={false} /></div>
          {invoice.payments && invoice.payments.length > 0 && (
            <div className="mt-3 text-xs text-gray-600">
              <div className="font-medium text-gray-700">Latest payment</div>
              <div>
                ${(invoice.payments[invoice.payments.length - 1].amount_cents/100).toFixed(2)} {invoice.payments[invoice.payments.length - 1].currency?.toUpperCase()} — {invoice.payments[invoice.payments.length - 1].status}
                {invoice.payments[invoice.payments.length - 1].created_at ? ` on ${invoice.payments[invoice.payments.length - 1].created_at!.slice(0,10)}` : ''}
              </div>
            </div>
          )}
          {due > 0 ? (
            <a href={`/invoice/${encodeURIComponent(externalId)}/pay`} className="mt-4 inline-flex w-full items-center justify-center text-center bg-black text-white hover:bg-gray-900 font-semibold py-2.5 px-4 rounded-md transition">Pay invoice</a>
          ) : (
            <div className="mt-4 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-3 py-2 text-center">Paid in full</div>
          )}
          {invoice.payments && invoice.payments.length > 0 && (
            <a href={`/invoice/${encodeURIComponent(externalId)}/receipt`} className="mt-2 inline-flex w-full items-center justify-center text-center border border-gray-300 hover:border-black font-medium py-2 px-4 rounded-md transition">View receipt</a>
          )}
        </div>
      </div>
    </div>
  );
}
