"use client";

/**
 * CreateInvoiceForm — compose an invoice with clarity and care.
 *
 * Why this exists
 *   Operators need a quick, reliable way to draft an invoice with multiple
 *   line items, optionally associating it to a tenant/user. As totals grow,
 *   the form previews a running subtotal and, if desired, an annotated tax
 *   and discount to reflect commercial nuance.
 *
 * How it works
 *   - Controlled inputs track currency, parties, and items.
 *   - Inline guards surface mistakes early (empty description, non-positive
 *     quantity/amount, missing currency).
 *   - A light combobox is provided via <datalist> for tenant/user lookup
 *     without adding dependencies.
 *   - When tax is present, we append a synthetic "Tax" line item so backend
 *     totals align while also recording meta for future fidelity.
 */
import { useEffect, useMemo, useState } from 'react';
import { useUnsavedChangesPrompt } from '@/app/hooks/useUnsavedChangesPrompt';
import { toast } from '@/components/Toaster';
import { createInvoiceAction, type CreateInvoicePayload } from '../actions';
import { type Tenant, type AdminUser } from '@/app/lib/api';
import AmountDisplay from '@/app/dashboard/billing/_components/AmountDisplay';

type Line = { id: string; description: string; quantity: number; amount: string };

type Props = { tenants: Tenant[]; users: AdminUser[] };

export default function CreateInvoiceForm({ tenants, users }: Props) {
  const DRAFT_KEY = 'ofroot_invoice_draft_v1';
  const [currency, setCurrency] = useState<string>('usd');
  const [tenantId, setTenantId] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [billTo, setBillTo] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [lines, setLines] = useState<Line[]>([
    { id: Math.random().toString(36).slice(2), description: '', quantity: 1, amount: '' },
  ]);
  const [loading, setLoading] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [taxPercent, setTaxPercent] = useState<string>('');
  const [discountAmount, setDiscountAmount] = useState<string>('');
  const [isRecurring, setIsRecurring] = useState<boolean>(false);
  const [recurringEvery, setRecurringEvery] = useState<'month' | 'quarter' | 'year'>('month');
  const [recurringCount, setRecurringCount] = useState<number>(12);

  // Totals preview
  const subtotal = lines.reduce((sum, l) => sum + (Number(l.amount) || 0) * (Number(l.quantity) || 0), 0);
  const tax = (() => {
    const pct = Number(taxPercent);
    return pct > 0 ? (subtotal * pct) / 100 : 0;
  })();
  const discount = Math.max(0, Number(discountAmount) || 0);
  const grandTotal = Math.max(0, subtotal + tax - discount);

  // Dirty detection: any non-empty line item or non-default fields
  const isDirty = (
    currency !== 'usd' || tenantId || userId || billTo || dueDate || taxPercent || discountAmount ||
    lines.some(l => l.description.trim() || Number(l.amount) > 0) || isRecurring
  );
  useUnsavedChangesPrompt(!!isDirty);

  // Restore draft on first mount if form is pristine
  useEffect(() => {
    try {
      if (isDirty) return; // don't clobber user input
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const d = JSON.parse(raw);
      if (!d || typeof d !== 'object') return;
      if (typeof d.currency === 'string') setCurrency(d.currency);
      if (typeof d.tenantId === 'string') setTenantId(d.tenantId);
      if (typeof d.userId === 'string') setUserId(d.userId);
      if (typeof d.billTo === 'string') setBillTo(d.billTo);
      if (typeof d.dueDate === 'string') setDueDate(d.dueDate);
      if (Array.isArray(d.lines)) setLines(d.lines);
      if (typeof d.taxPercent === 'string') setTaxPercent(d.taxPercent);
      if (typeof d.discountAmount === 'string') setDiscountAmount(d.discountAmount);
      if (typeof d.isRecurring === 'boolean') setIsRecurring(d.isRecurring);
      if (typeof d.recurringEvery === 'string') setRecurringEvery(d.recurringEvery);
      if (typeof d.recurringCount === 'number') setRecurringCount(d.recurringCount);
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Autosave draft on changes
  useEffect(() => {
    try {
      const draft = {
        currency,
        tenantId,
        userId,
        billTo,
        dueDate,
        lines,
        taxPercent,
        discountAmount,
        isRecurring,
        recurringEvery,
        recurringCount,
      };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch {}
  }, [currency, tenantId, userId, billTo, dueDate, lines, taxPercent, discountAmount, isRecurring, recurringEvery, recurringCount]);

  function clearDraft() {
    try { localStorage.removeItem(DRAFT_KEY); } catch {}
    // Reset to initial
    setCurrency('usd');
    setTenantId('');
    setUserId('');
    setBillTo('');
    setDueDate('');
    setLines([{ id: Math.random().toString(36).slice(2), description: '', quantity: 1, amount: '' }]);
    setTaxPercent('');
    setDiscountAmount('');
    setIsRecurring(false);
    setRecurringEvery('month');
    setRecurringCount(12);
  }

  function addLine() {
    setLines((prev) => [...prev, { id: Math.random().toString(36).slice(2), description: '', quantity: 1, amount: '' }]);
  }
  function removeLine(id: string) {
    setLines((prev) => (prev.length > 1 ? prev.filter((l) => l.id !== id) : prev));
  }
  function updateLine(id: string, patch: Partial<Line>) {
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  }

  function validateLines() {
    const invalid = lines.filter((l) => {
      const desc = l.description.trim();
      const qty = Number(l.quantity);
      const amt = Number(l.amount);
      return !desc || !(qty > 0) || !(amt > 0);
    });
    return { hasInvalid: invalid.length > 0 };
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    // Client-side validation
    const v = validateLines();
    const normalized = lines
      .map((l) => ({ ...l, description: l.description.trim(), quantity: Number(l.quantity) || 1, amountNum: Number(l.amount) }))
      .filter((l) => l.description && l.amountNum > 0 && l.quantity > 0);
    if (normalized.length === 0 || v.hasInvalid) {
      setShowErrors(true);
      return toast({ type: 'error', title: 'Fix items', message: 'Please fix line items before creating.' });
    }
    if (!currency) {
      setShowErrors(true);
      return toast({ type: 'error', title: 'Currency required', message: 'Choose a currency.' });
    }

    // Recurring requires a due date so the generator can schedule copies
    if (isRecurring && !dueDate) {
      setShowErrors(true);
      return toast({ type: 'error', title: 'Due date required', message: 'Set a due date for recurring invoices.' });
    }

    const taxLine = tax > 0 ? [{ description: 'Tax', quantity: 1, unit_amount_cents: Math.round(tax * 100) }] : [];

    // Only include numeric IDs; avoid passing NaN which serializes as "$NaN" in Next server actions
    const tenantIdNum = tenantId && /^\d+$/.test(tenantId.trim()) ? Number(tenantId.trim()) : undefined;
    const userIdNum = userId && /^\d+$/.test(userId.trim()) ? Number(userId.trim()) : undefined;

    const payload: CreateInvoicePayload = {
      currency: currency || 'usd',
      due_date: dueDate || undefined,
      tenant_id: tenantIdNum,
      user_id: userIdNum,
      items: [
        ...normalized.map((l) => ({ description: l.description, quantity: l.quantity, unit_amount_cents: Math.round(l.amountNum * 100) })),
        ...taxLine,
      ],
      meta: {
        ...(billTo ? { bill_to: billTo } : {}),
        ...(taxPercent ? { tax_percent: Number(taxPercent) } : {}),
        ...(discount ? { discount_preview_amount: Math.round(discount * 100) } : {}),
        ...(isRecurring ? { recurring: { every: recurringEvery, count: recurringCount } } : {}),
      },
    };

    try {
      setLoading(true);
      const res = await createInvoiceAction(payload);
      if (res.ok) {
        toast({ type: 'success', title: 'Invoice created', message: `Invoice #${res.id} was created.` });
        // reset minimal fields
        setLines([{ id: Math.random().toString(36).slice(2), description: '', quantity: 1, amount: '' }]);
        setBillTo('');
        setDueDate('');
        setShowErrors(false);
        setTaxPercent('');
        setDiscountAmount('');
        setIsRecurring(false);
        setRecurringEvery('month');
        setRecurringCount(12);
        setTenantId('');
        setUserId('');
        try { localStorage.removeItem(DRAFT_KEY); } catch {}
      } else {
        toast({ type: 'error', title: 'Failed', message: res.error || 'Could not create invoice.' });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="flex items-center justify-end">
        <button type="button" onClick={clearDraft} className="text-xs rounded border px-2 py-1 hover:border-black">Clear Draft</button>
      </div>
  <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
        <div>
          <label className="block text-xs text-gray-600 mb-1">Currency</label>
          <select value={currency} onChange={(e) => setCurrency(e.target.value)} className={`w-full border rounded px-2 py-1 text-sm ${showErrors && !currency ? 'border-red-400' : ''}`}>
            <option value="usd">USD</option>
            <option value="eur">EUR</option>
            <option value="gbp">GBP</option>
          </select>
          {showErrors && !currency && <p className="text-xs text-red-600 mt-1">Currency is required.</p>}
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">Tenant (optional)</label>
          <input list="tenants-list" value={tenantId} onChange={(e) => setTenantId(e.target.value)} placeholder="Type to search…" className="w-full border rounded px-2 py-1 text-sm" />
          <datalist id="tenants-list">
            {tenants.map((t) => (
              <option key={t.id} value={String(t.id)}>{t.name || `Tenant #${t.id}`}</option>
            ))}
          </datalist>
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">User (optional)</label>
          <input list="users-list" value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="Type to search…" className="w-full border rounded px-2 py-1 text-sm" />
          <datalist id="users-list">
            {users.map((u) => (
              <option key={u.id} value={String(u.id)}>{`${u.name} (${u.email})`}</option>
            ))}
          </datalist>
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs text-gray-600 mb-1">Bill To</label>
          <input value={billTo} onChange={(e) => setBillTo(e.target.value)} placeholder="Customer name" className="w-full border rounded px-2 py-1 text-sm" />
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">Due Date</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className={`w-full border rounded px-2 py-1 text-sm ${showErrors && isRecurring && !dueDate ? 'border-red-400' : ''}`}
          />
          {showErrors && isRecurring && !dueDate && (
            <p className="text-xs text-red-600 mt-1">A due date is required when recurring is enabled.</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="font-medium">Line Items</div>
          <button type="button" onClick={addLine} className="text-sm text-blue-600 hover:underline">Add item</button>
        </div>
        <div className="space-y-2">
          {lines.map((l) => {
            const descInvalid = showErrors && !l.description.trim();
            const qtyInvalid = showErrors && !(Number(l.quantity) > 0);
            const amtInvalid = showErrors && !(Number(l.amount) > 0);
            return (
              <div key={l.id} className="grid grid-cols-1 md:grid-cols-8 gap-2 items-end">
                <div className="md:col-span-4">
                  <label className="block text-xs text-gray-600 mb-1">Description</label>
                  <input value={l.description} onChange={(e) => updateLine(l.id, { description: e.target.value })} placeholder="Work description" className={`w-full border rounded px-2 py-1 text-sm ${descInvalid ? 'border-red-400' : ''}`} />
                  {descInvalid && <p className="text-xs text-red-600 mt-1">Description is required.</p>}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs text-gray-600 mb-1">Quantity</label>
                  <input type="number" min={1} value={l.quantity} onChange={(e) => updateLine(l.id, { quantity: Number(e.target.value) })} className={`w-full border rounded px-2 py-1 text-sm ${qtyInvalid ? 'border-red-400' : ''}`} />
                  {qtyInvalid && <p className="text-xs text-red-600 mt-1">Quantity must be at least 1.</p>}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs text-gray-600 mb-1">Unit Amount</label>
                  <input type="number" min={0} step="0.01" value={l.amount} onChange={(e) => updateLine(l.id, { amount: e.target.value })} placeholder="100.00" className={`w-full border rounded px-2 py-1 text-sm ${amtInvalid ? 'border-red-400' : ''}`} />
                  {amtInvalid && <p className="text-xs text-red-600 mt-1">Enter an amount greater than 0.</p>}
                </div>
                <div className="md:col-span-8 flex justify-end">
                  <button type="button" onClick={() => removeLine(l.id)} className="text-xs text-gray-600 hover:text-black">Remove</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
        <div>
          <label className="block text-xs text-gray-600 mb-1">Tax %</label>
          <input type="number" min={0} step="0.01" value={taxPercent} onChange={(e) => setTaxPercent(e.target.value)} className="w-full border rounded px-2 py-1 text-sm" placeholder="0" />
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">Discount ({(currency || 'USD').toUpperCase()})</label>
          <input type="number" min={0} step="0.01" value={discountAmount} onChange={(e) => setDiscountAmount(e.target.value)} className="w-full border rounded px-2 py-1 text-sm" placeholder="0.00" />
        </div>
        <div className="md:col-span-3 text-sm text-gray-700">
          <div>Subtotal: <span className="font-medium"><AmountDisplay value={subtotal} currency={(currency || 'USD')} /></span></div>
          {tax > 0 && <div>Tax: <span className="font-medium"><AmountDisplay value={tax} currency={(currency || 'USD')} /></span></div>}
          {discount > 0 && <div>Discount: <span className="font-medium text-red-600">-<AmountDisplay value={discount} currency={(currency || 'USD')} /></span></div>}
          <div className="mt-1">Total: <span className="font-semibold"><AmountDisplay value={grandTotal} currency={(currency || 'USD')} /></span></div>
          {discount > 0 && <div className="text-xs text-gray-500 mt-1">Note: discount is stored as metadata only; totals reflect tax line addition.</div>}
        </div>
        <div className="flex items-center justify-end">
          <button disabled={loading} type="submit" className="inline-flex items-center px-3 py-1.5 rounded bg-black text-white text-sm hover:bg-gray-800 disabled:opacity-50">
            {loading ? 'Creating…' : 'Create'}
          </button>
        </div>
      </div>

      {/* Recurring (Pro) */}
      <div className="border rounded p-3 bg-white/70">
        <div className="flex items-center gap-2">
          <input id="recurring" type="checkbox" checked={isRecurring} onChange={(e) => setIsRecurring(e.currentTarget.checked)} />
          <label htmlFor="recurring" className="font-medium">Make this a recurring invoice <span className="text-xs text-gray-500">(Pro)</span></label>
        </div>
        {isRecurring && (
          <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Every</label>
              <select value={recurringEvery} onChange={(e) => setRecurringEvery(e.target.value as any)} className="w-full border rounded px-2 py-1 text-sm">
                <option value="month">Month</option>
                <option value="quarter">Quarter</option>
                <option value="year">Year</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Occurrences</label>
              <input type="number" min={1} max={120} value={recurringCount} onChange={(e) => setRecurringCount(Math.max(1, Math.min(120, Number(e.target.value)||1)))} className="w-full border rounded px-2 py-1 text-sm" />
            </div>
            <div className="self-end text-xs text-gray-600">Next: generated automatically based on due date. {(!dueDate && showErrors) ? <span className="text-red-600">Set a due date.</span> : null}</div>
          </div>
        )}
      </div>
    </form>
  );
}
