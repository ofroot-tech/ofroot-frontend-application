// app/invoice/[externalId]/pay/page.tsx
"use client";
import { notFound, useSearchParams } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';

export default function PublicInvoicePayPage({ params }: { params: { externalId: string } }) {
  const externalId = decodeURIComponent(params.externalId || '');
  if (!externalId) notFound();
  const sp = useSearchParams();
  const status = sp?.get('status');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const returnUrl = useMemo(() => {
    if (typeof window === 'undefined') return undefined;
    return window.location.origin + `/invoice/${encodeURIComponent(externalId)}`;
  }, [externalId]);

  const beginCheckout = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/proxy/public/invoices/${encodeURIComponent(externalId)}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ return_url: returnUrl }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error?.message || `Checkout failed (${res.status})`);
      }
      const body = await res.json();
      const url = body?.url as string | undefined;
      if (!url) throw new Error('No checkout URL returned');
      window.location.href = url;
    } catch (e: any) {
      setError(e?.message || 'Failed to start checkout');
    } finally {
      setLoading(false);
    }
  }, [externalId, returnUrl]);

  return (
    <div className="mx-auto max-w-lg p-6">
      <h1 className="text-2xl font-semibold mb-2">Pay Invoice</h1>
      <p className="text-gray-600 mb-6">External ID: <span className="font-mono">{externalId}</span></p>
      <div className="rounded-lg border p-4 bg-white/60">
        {status === 'success' ? (
          <p className="text-sm text-emerald-700">Payment succeeded. You can return to your invoice for a receipt.</p>
        ) : status === 'cancel' ? (
          <p className="text-sm text-gray-700">Payment was canceled. You can try again below.</p>
        ) : (
          <p className="text-sm text-gray-700">Click below to pay securely via Stripe Checkout.</p>
        )}
        {error && <div className="mt-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</div>}
        <button onClick={beginCheckout} disabled={loading} className="mt-4 inline-flex items-center justify-center text-center bg-black text-white hover:bg-gray-900 font-semibold py-2.5 px-4 rounded-md transition disabled:opacity-50">
          {loading ? 'Starting…' : 'Pay now'}
        </button>
      </div>
      <div className="mt-6">
        <a href={`/invoice/${encodeURIComponent(externalId)}`} className="inline-flex items-center justify-center text-center bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-md">Back to invoice</a>
      </div>
    </div>
  );
}
