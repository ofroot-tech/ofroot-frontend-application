'use client';
import { useState } from 'react';
import { toast } from '@/components/Toaster';

export default function LeadCapture({ service }: { service: string }) {
  const [phone, setPhone] = useState('');
  const [zip, setZip] = useState('');
  const [sending, setSending] = useState(false);

  async function submit() {
    try {
      setSending(true);
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, service, zip, source: 'landing' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Failed to submit');
      toast({ type: 'success', title: 'Thanks!', message: 'We will reach out shortly.' });
      setPhone('');
      setZip('');
    } catch (e: any) {
      toast({ type: 'error', title: 'Could not submit', message: e?.message || 'Try again later.' });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="rounded-xl border p-4 bg-white/90 backdrop-blur shadow-sm">
      <div className="font-medium mb-2">Get a quick call back</div>
      <div className="grid gap-2 sm:grid-cols-3">
        <input
          type="tel"
          placeholder="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="border p-2 rounded w-full"
        />
        <input
          type="text"
          placeholder="ZIP"
          value={zip}
          onChange={(e) => setZip(e.target.value)}
          className="border p-2 rounded w-full"
        />
        <button
          type="button"
          onClick={submit}
          disabled={sending || !phone || !zip}
          className={`p-2 rounded ${sending || !phone || !zip ? 'bg-gray-300 text-gray-600' : 'bg-black text-white'}`}
        >
          {sending ? 'Sending…' : 'Request call'}
        </button>
      </div>
      <p className="mt-2 text-xs text-gray-600">We only use your info to contact you about this request.</p>
    </div>
  );
}
