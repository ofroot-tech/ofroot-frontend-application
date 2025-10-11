'use client';

import { useState } from 'react';
import api from '@/app/utils/api';
import { toast } from '@/components/Toaster';

export default function LeadForm() {
  const [status, setStatus] = useState<'idle'|'submitting'|'success'|'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('submitting');
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      const data = Object.fromEntries(formData.entries());
      await api.post('/leads', data);
      setStatus('success');
      toast({ type: 'success', title: 'Lead submitted', message: 'We will contact you shortly.' });
      e.currentTarget.reset();
    } catch (err: any) {
      setStatus('error');
      const msg = err?.response?.data?.message || err?.message || 'Failed to submit lead';
      setError(msg);
      toast({ type: 'error', title: 'Submission failed', message: msg });
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input name="name" placeholder="Name (optional)" className="border p-3 rounded-md" />
        <input name="email" placeholder="Email (optional)" className="border p-3 rounded-md" type="email" />
        <input name="phone" placeholder="Phone*" className="border p-3 rounded-md" required />
        <input name="service" placeholder="Service* (e.g., plumbing)" className="border p-3 rounded-md" required />
        <input name="zip" placeholder="ZIP*" className="border p-3 rounded-md" required />
        <input name="source" placeholder="Source (e.g., landing-page)" className="border p-3 rounded-md" />
      </div>
      <button disabled={status==='submitting'} className="bg-[#20b2aa] text-white px-6 py-3 rounded-md font-semibold hover:bg-[#1a8f85] disabled:opacity-50">
        {status==='submitting' ? 'Submitting…' : 'Submit Lead'}
      </button>
      {status==='success' && <p className="text-green-700">Lead submitted successfully.</p>}
      {status==='error' && <p className="text-red-700">{error}</p>}
    </form>
  );
}
