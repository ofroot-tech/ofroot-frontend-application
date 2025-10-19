"use client";

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { toast } from '@/components/Toaster';
import { track } from '@/app/lib/ab';

export default function AuditRequestButton() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [ads, setAds] = useState('');
  const [sending, setSending] = useState(false);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const firstFieldRef = useRef<HTMLInputElement | null>(null);
  const [portalEl, setPortalEl] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setPortalEl(document.body);
  }, []);

  // Lock body scroll while dialog is open and focus first field
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      // focus the first field after open
      setTimeout(() => firstFieldRef.current?.focus(), 50);

      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          setOpen(false);
        }
        if (e.key === 'Tab' && dialogRef.current) {
          // Simple focus trap
          const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
            'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
          );
          const f = Array.from(focusable).filter(el => !el.hasAttribute('disabled'));
          const first = f[0];
          const last = f[f.length - 1];
          if (!first || !last) return;
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      };
      document.addEventListener('keydown', onKeyDown);
      return () => {
        document.body.style.overflow = prev;
        document.removeEventListener('keydown', onKeyDown);
      };
    }
  }, [open]);

  return (
    <div className="mt-3">
      <button className="px-3 py-2 rounded-md bg-black text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black" onClick={() => setOpen(true)} aria-haspopup="dialog">
        Request AI audit
      </button>
      {open && portalEl && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="audit-title"
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overscroll-contain"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div ref={dialogRef} className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-2xl ring-1 ring-black/5" onMouseDown={(e) => e.stopPropagation()}>
            <h2 id="audit-title" className="font-extrabold text-2xl md:text-3xl text-gray-900">Request AI audit</h2>
            <p className="mt-1 text-sm text-gray-600">We’ll review your site and ad accounts and send quick wins within 48 hours.</p>
            <div className="mt-3 space-y-2 rounded-md border border-teal-100 bg-teal-50 p-3 text-sm text-gray-700">
              <div className="font-semibold text-gray-800">You’ll receive:</div>
              <ul className="list-disc list-inside space-y-1">
                <li>Heatmap of friction points across your top landing page</li>
                <li>Three ad copy refreshes tuned to your ideal customer</li>
                <li>Automation opportunities ranked by effort vs. impact</li>
                <li>A 14-day execution checklist so you can act fast</li>
              </ul>
              <p className="text-xs text-gray-500">We only need the basics to get started. A strategist walks through everything—no auto-generated fluff.</p>
            </div>

            <form className="mt-4 grid gap-3" onSubmit={(e) => { e.preventDefault(); }}>
              <label htmlFor="audit-name" className="text-sm font-medium text-gray-700">Your name</label>
              <input
                ref={firstFieldRef}
                id="audit-name"
                type="text"
                className="border border-gray-300 p-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-teal-200"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <label htmlFor="audit-email" className="text-sm font-medium text-gray-700">Work email</label>
              <input
                id="audit-email"
                type="email"
                className="border border-gray-300 p-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-teal-200"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <label htmlFor="audit-website" className="text-sm font-medium text-gray-700">Website URL</label>
              <input
                id="audit-website"
                type="url"
                className="border border-gray-300 p-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-teal-200"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                required
              />

              <label htmlFor="audit-ads" className="text-sm font-medium text-gray-700">Ads account (optional)</label>
              <input
                id="audit-ads"
                type="text"
                className="border border-gray-300 p-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-teal-200"
                value={ads}
                onChange={(e) => setAds(e.target.value)}
                placeholder="e.g., Google Ads CID"
              />
            </form>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button type="button" className="px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-800 text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300" onClick={() => setOpen(false)}>Close</button>
              <button
                type="button"
                className={`px-3 py-2 rounded-md text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 ${sending ? 'bg-gray-400 text-white' : 'bg-black text-white hover:bg-gray-900 focus:ring-black'}`}
                disabled={sending}
                onClick={async () => {
                  try {
                    setSending(true);
                    const res = await fetch('/api/audit-inquiry', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ name, email, website, ads_account: ads }),
                    });
                    const data = await res.json();
                    if (!res.ok || !data?.ok) throw new Error(data?.error || 'Failed to send');
                    try { track({ category: 'form', action: 'audit_request_submitted', label: 'subscribe_aside' }); } catch {}
                    toast({ type: 'success', title: 'Audit requested', message: 'We will reach out within 48 hours.' });
                    setOpen(false); setName(''); setEmail(''); setWebsite(''); setAds('');
                  } catch (e: any) {
                    toast({ type: 'error', title: 'Could not send', message: e?.message || 'Try again later.' });
                  } finally {
                    setSending(false);
                  }
                }}
              >
                {sending ? 'Sending…' : 'Send'}
              </button>
            </div>
          </div>
        </div>,
        portalEl
      )}
    </div>
  );
}
