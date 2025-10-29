"use client";

import { useEffect, useMemo, useState, useTransition } from 'react';
import Amount from '@/app/dashboard/billing/_components/AmountDisplay';
import { saveInvoiceItemsAction } from '@/app/dashboard/billing/actions';

export type EditableItem = {
  id?: number;
  description: string;
  quantity: number;
  unit_amount_cents: number;
};

type RowItem = EditableItem & { _key: string; _exiting?: boolean };

export default function ItemsEditor(props: {
  invoiceId: number;
  currency: string;
  items: EditableItem[];
  isReadOnly?: boolean;
}) {
  const [rows, setRows] = useState<RowItem[]>(() =>
    props.items.map((r, i) => ({ ...r, _key: `${r.id ?? 'new'}-${i}-${Math.random().toString(36).slice(2, 8)}` }))
  );
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [taxPercent, setTaxPercent] = useState<string>('');
  const [discount, setDiscount] = useState<string>(''); // in display currency

  const subtotalCents = useMemo(() => rows.reduce((sum, r) => sum + (r.quantity || 0) * (r.unit_amount_cents || 0), 0), [rows]);
  const preview = useMemo(() => {
    const taxPct = Number(taxPercent) || 0;
    const discountCents = Math.round((Number(discount) || 0) * 100);
    const taxCents = Math.round((subtotalCents * taxPct) / 100);
    const total = Math.max(0, subtotalCents + taxCents - discountCents);
    return { taxCents, discountCents, totalCents: total };
  }, [subtotalCents, taxPercent, discount]);

  function updateRow(idx: number, patch: Partial<EditableItem>) {
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  }
  function addRow() {
    if (props.isReadOnly) return;
    setRows((prev) => [
      ...prev,
      { _key: `row-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`, description: '', quantity: 1, unit_amount_cents: 0 },
    ]);
  }
  function removeRow(idx: number) {
    if (props.isReadOnly) return;
    setRows((prev) => {
      const target = prev[idx];
      if (!target) return prev;
      const withExit = prev.map((r, i) => (i === idx ? { ...r, _exiting: true } : r));
      // After a short exit animation, actually remove the row
      setTimeout(() => {
        setRows((inner) => inner.filter((r) => r._key !== target._key));
      }, 180);
      return withExit;
    });
  }

  async function onSave() {
    setMessage(null);
    if (props.isReadOnly) return;
    const payload = rows.map((r) => ({
      description: r.description,
      quantity: Number.isFinite(Number(r.quantity)) ? Number(r.quantity) : 1,
      unit_amount_cents: Math.round(Number(r.unit_amount_cents) || 0),
    }));
    const fd = new FormData();
    fd.set('items', JSON.stringify(payload));
    if (taxPercent.trim() !== '') fd.set('tax_percent', taxPercent);
    if (discount.trim() !== '') fd.set('discount_cents', String(Math.round((Number(discount) || 0) * 100)));
    startTransition(async () => {
      const res = await saveInvoiceItemsAction(props.invoiceId, fd);
      if (!res?.ok) setMessage(res?.error || 'Failed to save'); else setMessage('Saved');
    });
  }

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500">
              <th className="px-3 py-2">Description</th>
              <th className="px-3 py-2">Qty</th>
              <th className="px-3 py-2">Unit (cents)</th>
              <th className="px-3 py-2">Line total</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => (
              <AnimatedRow
                key={r._key}
                row={r}
                currency={props.currency}
                onChange={(patch) => updateRow(idx, patch)}
                onRemove={() => removeRow(idx)}
                readOnly={Boolean(props.isReadOnly)}
                delayMs={idx * 30}
              />
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <button type="button" onClick={addRow} disabled={props.isReadOnly} className="text-xs px-3 py-1.5 rounded border border-gray-300 hover:border-black disabled:opacity-50">Add item</button>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <label className="flex items-center gap-2">
            <span className="text-gray-600">Tax %</span>
            <input value={taxPercent} onChange={(e) => setTaxPercent(e.target.value)} disabled={props.isReadOnly} className="w-20 rounded-lg border border-gray-300 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-black focus:border-black disabled:opacity-50" />
          </label>
          <label className="flex items-center gap-2">
            <span className="text-gray-600">Discount</span>
            <input value={discount} onChange={(e) => setDiscount(e.target.value)} disabled={props.isReadOnly} placeholder="0.00" className="w-24 rounded-lg border border-gray-300 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-black focus:border-black disabled:opacity-50" />
          </label>
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Preview</span>
            <div className="font-medium"><Amount value={preview.totalCents / 100} currency={props.currency} /></div>
          </div>
          <button type="button" disabled={isPending || props.isReadOnly} onClick={onSave} className="text-xs px-3 py-1.5 rounded border border-gray-300 hover:border-black disabled:opacity-50">{isPending ? 'Saving…' : 'Save items'}</button>
        </div>
      </div>
      {props.isReadOnly && (
        <div className="text-xs text-gray-600">Items are finalized or invoice is not editable. Reopen items to make changes.</div>
      )}
      {message && <div className="text-xs text-gray-600">{message}</div>}
    </div>
  );
}

function AnimatedRow({
  row,
  currency,
  onChange,
  onRemove,
  delayMs = 0,
  readOnly = false,
}: {
  row: RowItem;
  currency: string;
  onChange: (patch: Partial<EditableItem>) => void;
  onRemove: () => void;
  delayMs?: number;
  readOnly?: boolean;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), delayMs);
    return () => clearTimeout(t);
  }, []);
  const line = (row.quantity || 0) * (row.unit_amount_cents || 0);
  const style: React.CSSProperties = {
    transition: 'opacity 180ms ease, transform 180ms ease',
    opacity: row._exiting ? 0 : 1,
    transform: row._exiting ? 'scale(0.98)' : mounted ? 'scale(1)' : 'scale(0.98)',
  };
  return (
    <tr className="border-t align-top" style={style}>
      <td className="px-3 py-2 w-full">
        <input
          value={row.description}
          onChange={(e) => onChange({ description: e.target.value })}
          disabled={readOnly}
          placeholder="Description"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-black disabled:opacity-50"
        />
      </td>
      <td className="px-3 py-2">
        <input
          type="number"
          min={1}
          value={row.quantity}
          onChange={(e) => onChange({ quantity: Number(e.target.value) })}
          disabled={readOnly}
          className="w-20 rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-black disabled:opacity-50"
        />
      </td>
      <td className="px-3 py-2">
        <input
          type="number"
          min={0}
          value={row.unit_amount_cents}
          onChange={(e) => onChange({ unit_amount_cents: Math.max(0, Math.round(Number(e.target.value))) })}
          disabled={readOnly}
          className="w-28 rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-black disabled:opacity-50"
        />
      </td>
      <td className="px-3 py-2 whitespace-nowrap">
        <Amount value={line / 100} currency={currency} />
      </td>
      <td className="px-3 py-2">
        <button type="button" onClick={onRemove} disabled={readOnly} className="text-xs px-2 py-1 rounded border border-gray-300 hover:border-black disabled:opacity-50">Remove</button>
      </td>
    </tr>
  );
}
