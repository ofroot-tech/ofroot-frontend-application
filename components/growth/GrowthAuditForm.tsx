'use client';

import { FormEvent, useRef, useState } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { track } from '@/app/lib/ab';

export default function GrowthAuditForm() {
  const started = useRef(false);
  const [state, setState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const start = () => {
    if (started.current) return;
    started.current = true;
    track({ category: 'form', action: 'booking_form_started', label: 'growth_systems_audit', meta: { path: window.location.pathname } });
  };
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState('submitting'); setMessage('');
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    const params = new URLSearchParams(window.location.search);
    const payload = { ...data, ctaSource: params.get('source') || params.get('focus') || 'direct', referringPage: document.referrer || 'direct' };
    try {
      const response = await fetch('/api/sales-inquiry', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: data.businessName, email: data.email, message: `Growth Systems Audit: ${data.desiredOutcome}`, businessName: data.businessName, payload }) });
      if (!response.ok) throw new Error('The request could not be saved.');
      track({ category: 'form', action: 'booking_form_submitted', label: 'growth_systems_audit', meta: { ctaSource: payload.ctaSource, path: window.location.pathname } });
      setState('success');
    } catch (error) {
      setState('error'); setMessage(error instanceof Error ? error.message : 'Please try again.');
    }
  }
  if (state === 'success') return <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-8" role="status"><CheckCircle2 className="mb-4 h-8 w-8 text-emerald-700" /><h2 className="text-2xl font-black text-slate-950">Your audit request is in.</h2><p className="mx-0 mt-3 text-slate-700">We will review the bottleneck and reply using the contact email you provided.</p></div>;
  const input = 'mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-[#C96800] focus:ring-2 focus:ring-[#FF9312]/20';
  return <form onSubmit={submit} onFocus={start} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,.08)] sm:p-8" aria-describedby={message ? 'form-error' : undefined}>
    <div className="grid gap-5 sm:grid-cols-2">
      <label className="text-sm font-semibold">Business name<input className={input} name="businessName" required autoComplete="organization" /></label>
      <label className="text-sm font-semibold">Contact email<input className={input} name="email" type="email" required autoComplete="email" /></label>
      <label className="text-sm font-semibold">Current website<input className={input} name="website" type="url" placeholder="https://" autoComplete="url" /></label>
      <label className="text-sm font-semibold">Main growth bottleneck<select className={input} name="growthBottleneck" required defaultValue=""><option value="" disabled>Select one</option><option>Discoverability</option><option>Lead conversion</option><option>Automation</option><option>Internal knowledge</option><option>Private AI</option><option>Reporting</option><option>Not sure yet</option></select></label>
      <label className="text-sm font-semibold">Monthly lead volume<select className={input} name="monthlyLeadVolume" defaultValue=""><option value="">Not sure</option><option>Under 100</option><option>100–500</option><option>501–2,000</option><option>More than 2,000</option></select></label>
      <label className="text-sm font-semibold">Team size<select className={input} name="teamSize" defaultValue=""><option value="">Select</option><option>1–10</option><option>11–50</option><option>51–200</option><option>201+</option></select></label>
      <label className="text-sm font-semibold sm:col-span-2">Systems currently used<input className={input} name="systems" placeholder="For example: HubSpot, Slack, Google Drive" /></label>
      <label className="text-sm font-semibold sm:col-span-2">Desired outcome<textarea className={`${input} min-h-28 resize-y`} name="desiredOutcome" required placeholder="What should work better after this engagement?" /></label>
      <label className="text-sm font-semibold">Timeline<select className={input} name="timeline" defaultValue=""><option value="">Flexible</option><option>Within 30 days</option><option>1–3 months</option><option>3–6 months</option><option>Planning ahead</option></select></label>
      <label className="text-sm font-semibold">Optional budget range<select className={input} name="budget" defaultValue=""><option value="">Prefer to discuss</option><option>Under $10,000</option><option>$10,000–$25,000</option><option>$25,000–$75,000</option><option>$75,000+</option></select></label>
    </div>
    {message && <p id="form-error" className="mx-0 mt-5 text-sm font-semibold text-red-700" role="alert">{message}</p>}
    <button type="submit" disabled={state === 'submitting'} className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#FF9312] px-6 py-3 font-bold text-slate-950 transition hover:bg-[#ffad42] disabled:cursor-wait disabled:opacity-70">{state === 'submitting' && <Loader2 className="h-4 w-4 animate-spin" />}Request the Growth Systems Audit</button>
    <p className="mx-auto mt-4 text-center text-xs text-slate-500">We use this information to prepare a focused response. No unsupported guarantees and no automatic AI processing.</p>
  </form>;
}
