"use client";

import { toast } from '@/components/Toaster';

export default function CopyInvoiceLinkButton({
  id,
  externalId,
  publicUrl,
}: {
  id: number;
  externalId?: string | null;
  publicUrl?: string | null;
}) {
  async function copy() {
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      let href = '';
      if (publicUrl && publicUrl.trim().length > 0) {
        href = publicUrl.match(/^https?:\/\//) ? publicUrl : `${origin}${publicUrl.startsWith('/') ? '' : '/'}${publicUrl}`;
      } else if (externalId && externalId.trim().length > 0) {
        // Prefer a clean, public-looking path; adjust if a dedicated route exists later
        href = `${origin}/invoice/${encodeURIComponent(externalId)}`;
      } else {
        // Fallback to print-friendly admin view
        href = `${origin}/dashboard/billing/invoices/${id}/print`;
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(href);
      } else {
        const el = document.createElement('textarea');
        el.value = href;
        el.style.position = 'fixed';
        el.style.opacity = '0';
        el.style.pointerEvents = 'none';
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
      }
      toast({ type: 'success', title: 'Copied', message: 'Invoice link copied to clipboard.' });
    } catch (err: any) {
      toast({ type: 'error', title: 'Copy failed', message: err?.message || 'Could not copy link. Try again.' });
    }
  }

  return (
    <button onClick={copy} className="text-xs rounded border border-gray-300 px-2 py-1 hover:border-black" title="Copy public invoice link">
      Copy link
    </button>
  );
}
