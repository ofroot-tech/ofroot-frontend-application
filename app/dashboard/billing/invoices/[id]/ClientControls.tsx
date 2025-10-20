"use client";

import { useState } from 'react';
import { updateInvoiceStatusAction, recordPaymentAction, sendInvoiceAction, reassignInvoiceAction } from '../../actions';
import { toast } from '@/components/Toaster';

export default function ClientControls({ id, status, amountDue }: { id: number; status: 'draft'|'sent'|'paid'|'void'; amountDue: number }) {
  const [updating, setUpdating] = useState(false);
  const [paying, setPaying] = useState(false);
  const [payAmount, setPayAmount] = useState<string>(amountDue.toFixed(2));
  const [provider, setProvider] = useState<string>('');
  const [reference, setReference] = useState<string>('');
  const [payStatus, setPayStatus] = useState<'succeeded'|'pending'|'failed'|'refunded'>('succeeded');

  async function setStatus(s: 'draft'|'sent'|'paid'|'void') {
    if (updating) return;
    if ((s === 'paid' || s === 'void') && !confirm(`Are you sure you want to mark this invoice as ${s}?`)) return;
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
      const res = await recordPaymentAction(id, amt, { provider: provider || undefined, reference: reference || undefined, status: payStatus });
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
      <div className="ml-auto flex items-end gap-2 flex-wrap">
        <div>
          <label className="block text-xs text-gray-600 mb-1">Amount</label>
          <input className="border rounded px-2 py-1 text-sm w-28" type="number" min={0} step="0.01" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">Status</label>
          <select className="border rounded px-2 py-1 text-sm" value={payStatus} onChange={(e) => setPayStatus(e.target.value as any)}>
            <option value="succeeded">Succeeded</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">Provider (opt)</label>
          <input className="border rounded px-2 py-1 text-sm w-32" placeholder="stripe" value={provider} onChange={(e) => setProvider(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">Reference (opt)</label>
          <input className="border rounded px-2 py-1 text-sm w-48" placeholder="ch_123 / txn id" value={reference} onChange={(e) => setReference(e.target.value)} />
        </div>
        <button onClick={recordPayment} disabled={paying} className="text-xs px-3 py-1.5 rounded bg-black text-white hover:bg-gray-800 disabled:opacity-50">Record</button>
        <button onClick={async () => { const r = await sendInvoiceAction(id); r.ok ? toast({ type:'success', title:'Sent', message:'Invoice marked as sent.' }) : toast({ type:'error', title:'Failed', message:r.error || 'Could not send.'}); }} className="text-xs px-3 py-1.5 rounded border border-gray-300 hover:border-black">Send</button>
      </div>
    </div>
  );
}
