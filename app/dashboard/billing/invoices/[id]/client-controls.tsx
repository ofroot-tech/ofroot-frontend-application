"use client";

import { useState } from 'react';
import { updateInvoiceStatusAction, recordPaymentAction } from '../../actions';
import { toast } from '@/components/Toaster';

export default function ClientControls({ id, status, amountDue }: { id: number; status: 'draft'|'sent'|'paid'|'void'; amountDue: number }) {
  const [updating, setUpdating] = useState(false);
  const [paying, setPaying] = useState(false);
  const [payAmount, setPayAmount] = useState<string>(amountDue.toFixed(2));

  async function setStatus(s: 'draft'|'sent'|'paid'|'void') {
    if (updating) return;
    try {
      setUpdating(true);
      const res = await updateInvoiceStatusAction(id, s);
      if (res.ok) toast({ type: 'success', title: 'Status updated', message: `Status set to ${s}.` });
      else toast({ type: 'error', title: 'Failed', message: res.error || 'Could not update status.' });
    } finally {
      setUpdating(false);
    }
  }

  async function recordPayment() {
    if (paying) return;
    const amt = Number(payAmount);
    if (!(amt > 0)) return toast({ type: 'error', title: 'Enter amount', message: 'Payment amount must be positive.' });
    try {
      setPaying(true);
      const res = await recordPaymentAction(id, amt);
      if (res.ok) toast({ type: 'success', title: 'Payment recorded', message: `Recorded $${amt.toFixed(2)}.` });
      else toast({ type: 'error', title: 'Failed', message: res.error || 'Could not record payment.' });
    } finally {
      setPaying(false);
    }
  }

  return (
    <div className="flex flex-wrap items-end gap-3 mb-4">
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-600">Status</span>
        {(['draft','sent','paid','void'] as const).map((s) => (
          <button key={s} onClick={() => setStatus(s)} disabled={updating || status === s}
            className={`text-xs px-2 py-1 rounded border ${status === s ? 'bg-black text-white border-black' : 'border-gray-300 hover:border-black'}`}>
            {s}
          </button>
        ))}
      </div>
      <div className="ml-auto flex items-end gap-2">
        <div>
          <label className="block text-xs text-gray-600 mb-1">Record payment</label>
          <input className="border rounded px-2 py-1 text-sm w-28" type="number" min={0} step="0.01" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} />
        </div>
        <button onClick={recordPayment} disabled={paying} className="text-xs px-3 py-1.5 rounded bg-black text-white hover:bg-gray-800 disabled:opacity-50">Record</button>
      </div>
    </div>
  );
}
