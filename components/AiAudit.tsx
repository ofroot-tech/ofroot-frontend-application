'use client';

import { useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, Copy, Search, LoaderCircle } from 'lucide-react';
import { auditView, type AuditMode, type AuditReport } from '@/app/lib/ai-audit';
import { track } from '@/app/lib/ab';

const button = 'inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#FF9312] px-6 py-3 font-semibold text-[#071225] transition hover:bg-[#FFB14A] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D97706] disabled:cursor-wait disabled:opacity-60';
const input = 'mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D97706]';
const statusLabels: Record<string, string> = { pass: 'Passed', fail: 'Needs work', warning: 'Review', na: 'Not applicable', pending: 'Pending' };

export default function AiAudit() {
  const [url, setUrl] = useState('');
  const [mode, setMode] = useState<AuditMode>('website');
  const [resultMode, setResultMode] = useState<AuditMode>('website');
  const [report, setReport] = useState<AuditReport | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [copyStatus, setCopyStatus] = useState('');
  const [leadState, setLeadState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [leadError, setLeadError] = useState('');
  const resultRef = useRef<HTMLHeadingElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const view = report ? auditView(report, resultMode) : null;

  async function scan(refresh = false) {
    setBusy(true); setError(''); setCopyStatus('');
    if (!refresh) { setReport(null); setToken(null); setLeadState('idle'); }
    try {
      const response = await fetch('/api/ai-audit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: refresh && report ? report.domain : url, mode: refresh ? resultMode : mode, refresh }), signal: AbortSignal.timeout(55000) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Scan unavailable. Try again shortly.');
      setReport(data.report); setToken(data.token); setResultMode(refresh ? resultMode : mode);
      track({ category: 'form', action: 'ai_readiness_scan_completed', label: refresh ? 'refresh' : mode });
      window.setTimeout(() => resultRef.current?.focus(), 100);
    } catch (e) { setError(e instanceof Error && e.name !== 'TimeoutError' ? e.message : 'The scan is taking longer than expected. Please try again.'); }
    finally { setBusy(false); }
  }
  async function copyFixes() {
    if (!view || !report) return;
    const text = `AI readiness review for ${report.domain}\n${view.label}: ${view.score ?? 'Not scored'}/100\nSource: Ora, ${report.scannedAt || report.generatedAt}\n\nReview these provider recommendations for applicability before implementation. Preserve security and verify changes with a rescan.\n\n${view.fixes.slice(0, 3).map((f, i) => `${i + 1}. ${f.name}\n${f.recommendation}`).join('\n\n')}`;
    try { await navigator.clipboard.writeText(text); setCopyStatus('Fix instructions copied.'); }
    catch { setCopyStatus('Copy unavailable. Select the recommendations below to copy them.'); }
  }
  async function requestPlan(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); if (!token) return;
    const form = new FormData(e.currentTarget); setLeadState('sending'); setLeadError('');
    try {
      const response = await fetch('/api/ai-audit/fix-plan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: form.get('name'), email: form.get('email'), companyFax: form.get('companyFax'), consent: form.get('consent') === 'on', token }), signal: AbortSignal.timeout(20000) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error || 'We could not deliver your request.');
      setLeadState('sent'); track({ category: 'form', action: 'ai_readiness_fix_plan_requested', label: 'audit_results' });
    } catch (e) { setLeadState('error'); setLeadError(e instanceof Error ? e.message : 'We could not deliver your request.'); }
  }

  return (
    <main className="min-h-screen bg-[#F4F7FA] text-[#071225]">
      <section className="relative overflow-hidden bg-[#071225] px-5 pb-16 pt-32 text-white sm:px-8 sm:pb-24 sm:pt-40">
        <div aria-hidden="true" className="pointer-events-none absolute -right-32 top-32 h-96 w-96 rounded-full border-[48px] border-[#37FFE0]/5" />
        <div className="relative mx-auto max-w-6xl">
          <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.18em] text-[#37FFE0]"><span className="h-2 w-2 rounded-full bg-[#37FFE0]" /> OfRoot / AI website readiness scanner</div>
          <div className="mt-8 grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:items-end">
            <div>
              <h1 className="max-w-2xl text-4xl font-semibold leading-[1.07] tracking-tight sm:text-6xl">Your next visitor<br />might be an <span className="text-[#37FFE0]">AI agent.</span></h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-300">Run a technical scan to see whether agents can discover, read, and use your public website. Then turn the evidence into an implementation plan.</p>
              <p className="mt-7 text-sm text-slate-300">Free report. No signup. Recommendations you can act on.</p>
            </div>
            <form onSubmit={e => { e.preventDefault(); void scan(); }} className="rounded-2xl border border-white/15 bg-white p-6 text-[#071225] shadow-xl sm:p-8" aria-busy={busy}>
              <label htmlFor="audit-url" className="text-lg font-semibold">Put your website to the test</label>
              <input id="audit-url" name="url" type="text" inputMode="url" autoComplete="url" required maxLength={2048} placeholder="yourwebsite.com" value={url} onChange={e => setUrl(e.target.value)} className={input} aria-describedby="audit-help audit-error" />
              <label className="mt-5 block text-sm font-medium" htmlFor="audit-mode">What kind of site is it?</label>
              <select id="audit-mode" value={mode} onChange={e => setMode(e.target.value as AuditMode)} className={input} disabled={busy}>
                <option value="website">Business, marketing, or content website</option>
                <option value="full">Product with APIs or agent integrations</option>
              </select>
              <button type="submit" className={`${button} mt-5 w-full`} disabled={busy}>{busy ? <LoaderCircle aria-hidden="true" size={18} className="animate-spin motion-reduce:animate-none" /> : <Search aria-hidden="true" size={18} />}{busy ? 'Checking your website…' : 'Scan My Website'}</button>
              <p id="audit-help" className="mt-4 text-xs leading-relaxed text-slate-600">Your public domain is sent to <a href="https://ora.ai/docs" target="_blank" rel="noreferrer" className="underline">Ora</a> to run the scan. Provider reports may be public. Recent results may be reused.</p>
              <div id="audit-error" role="alert">{error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">{error} <Link className="underline" href="/book">Book an OfRoot review</Link></p>}</div>
              <p role="status" className="mt-2 text-sm text-slate-600">{busy ? 'Usually ready within a minute. Keep this page open.' : ''}</p>
            </form>
          </div>
        </div>
      </section>

      {report && view ? <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16" aria-labelledby="audit-results">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div><p className="font-mono text-xs uppercase tracking-widest text-slate-500">Your readiness report</p><h2 id="audit-results" ref={resultRef} tabIndex={-1} className="mt-2 break-all text-3xl font-semibold focus:outline-none">{report.domain}</h2></div>
          <a href={`https://ora.ai/${encodeURIComponent(report.domain)}`} target="_blank" rel="noreferrer" className="text-sm font-medium underline underline-offset-4">View source report on Ora ↗</a>
        </div>
        <p className="mt-3 text-xs text-slate-600">Scanned {new Date(report.scannedAt || report.generatedAt).toLocaleString()} · {report.servedFromCache ? 'Recent provider result' : 'Provider result'} · {view.partial ? 'Analysis still in progress' : 'Analysis complete'}</p>
        {view.partial && <div className="mt-5 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">Some checks are still running. This score is provisional. <button disabled={busy} onClick={() => void scan(true)} className="ml-2 min-h-11 font-semibold underline">Refresh results</button></div>}
        <div className="mt-8 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-2xl bg-[#071225] p-7 text-white sm:p-9">
            <p className="text-sm text-slate-300">{view.label} · powered by Ora</p>
            <p className="mt-5 font-mono text-7xl tracking-tighter text-[#37FFE0]">{view.score === null ? '—' : Math.round(view.score)}<span className="text-2xl tracking-normal text-slate-400"> / 100</span></p>
            <p className="mt-5 text-lg font-medium">{resultMode === 'website' ? report.essentials?.label || 'Website score unavailable' : `Ora grade: ${report.grade || 'Not available'}`}</p>
            <p className="mt-4 text-sm leading-relaxed text-slate-300">{resultMode === 'website' ? 'Weighted for the surfaces Ora detects on your site. Emerging standards contribute bonus points.' : 'A broader assessment of discovery, access, usability, and agent integrations.'}</p>
            <p className="mt-5 border-t border-white/15 pt-5 text-xs text-slate-400">A technical snapshot, not a guarantee of AI recommendations, search rankings, or sales.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-7 sm:p-9">
            <h3 className="text-xl font-semibold">Turn this report into progress.</h3>
            <p className="mt-4 text-slate-600">{view.fixes.length ? `Your report includes ${view.fixes.length} prioritized opportunities. OfRoot can review what applies, implement the right fixes, and rescan to measure the change.` : 'Keep the good foundation. OfRoot can review your next step and help maintain readiness as your site changes.'}</p>
            <button onClick={() => { document.getElementById('fix-plan')?.scrollIntoView({ behavior: 'instant', block: 'center' }); nameRef.current?.focus({ preventScroll: true }); }} className={`${button} mt-6`}>Get My Fix Plan <ArrowRight size={18} aria-hidden="true" /></button>
            <p className="mt-3 text-xs text-slate-500">A scoped implementation conversation. Your report is already free.</p>
          </div>
        </div>

        {resultMode === 'website' && report.essentials && <div className="mt-6 grid gap-4 sm:grid-cols-2">{report.essentials.activeSurfaces.map(surface => <div key={surface.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5"><div><h3 className="font-semibold">{surface.label}</h3><p className="text-sm text-slate-500">{surface.passing} of {surface.total} checks passing</p></div><span className="font-mono text-2xl">{surface.score ?? '—'}<small className="text-sm text-slate-500">/100</small></span></div>)}</div>}
        <div className="mt-12 flex flex-wrap items-center justify-between gap-4"><h3 className="text-2xl font-semibold">Your first three fixes</h3>{view.fixes.length > 0 && <button onClick={() => void copyFixes()} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium"><Copy size={16} aria-hidden="true" />Copy fix instructions</button>}</div>
        <p role="status" className="mt-2 text-sm text-slate-600">{copyStatus}</p>
        <ol className="mt-4 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">{view.fixes.slice(0, 3).map((fix, i) => <li key={fix.id} className="flex gap-4 p-5 sm:gap-6 sm:p-7"><span className="font-mono text-xl text-[#9A4D00]">0{i + 1}</span><div className="min-w-0"><h4 className="font-semibold">{fix.name}</h4>{fix.details && <p className="mt-2 break-words text-sm text-slate-500">Observed: {fix.details}</p>}<p className="mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-700">{fix.recommendation}</p></div></li>)}</ol>
        {!view.fixes.length && <p className="mt-4 text-slate-600">No prioritized fixes were returned for this score. Review the detailed checks below.</p>}
        <p className="mt-4 text-xs text-slate-500">Recommendations and ordering are supplied by Ora. Check applicability before changing your site.</p>

        <details className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 sm:p-7"><summary className="cursor-pointer py-2 text-lg font-semibold">Explore every check and its evidence</summary><div className="mt-5 space-y-8">{report.layers.map(layer => <section key={layer.id}><h3 className="font-semibold">{layer.name} <span className="text-sm font-normal text-slate-500">· full audit layer {layer.score}/{layer.maxScore}</span></h3><ul className="mt-3 divide-y divide-slate-100">{layer.checks.map(check => <li key={check.id} className="py-4"><div className="flex flex-wrap items-center justify-between gap-2"><h4 className="text-sm font-medium">{check.name}</h4><span className={`rounded-full px-3 py-1 text-xs ${check.status === 'pass' ? 'bg-emerald-50 text-emerald-800' : check.status === 'fail' ? 'bg-orange-50 text-orange-900' : 'bg-slate-100 text-slate-600'}`}>{statusLabels[check.status]}</span></div><p className="mt-2 break-words text-sm text-slate-600">{check.details || 'No additional evidence provided.'}</p></li>)}</ul></section>)}</div></details>

        <div id="fix-plan" className="mt-12 grid gap-8 rounded-2xl bg-[#E7EEF4] p-6 sm:p-10 lg:grid-cols-2">
          <div><p className="font-mono text-xs uppercase tracking-widest text-[#855000]">From findings to fixes</p><h3 className="mt-4 text-3xl font-semibold">You run the business.<br />We’ll handle the next step.</h3><p className="mt-4 text-slate-600">Send OfRoot your report. We’ll review the findings and discuss an implementation plan for your site.</p><ul className="mt-6 space-y-3 text-sm">{['Review which recommendations matter', 'Scope and implement the agreed fixes', 'Rescan to verify the improvement'].map(text => <li key={text} className="flex gap-3"><Check size={18} aria-hidden="true" className="shrink-0 text-[#0C7162]" />{text}</li>)}</ul></div>
          {leadState === 'sent' ? <div role="status" className="self-center rounded-xl bg-white p-7"><Check aria-hidden="true" className="text-emerald-700" /><h4 className="mt-4 text-xl font-semibold">Your request is with OfRoot.</h4><p className="mt-3 text-slate-600">We have your contact details and scan summary. Our team will follow up about your fix plan.</p></div> : <form onSubmit={requestPlan} className="rounded-xl bg-white p-6" aria-busy={leadState === 'sending'}>
            <label htmlFor="plan-name" className="text-sm font-medium">Your name</label><input ref={nameRef} id="plan-name" name="name" required autoComplete="name" maxLength={100} className={input} />
            <label htmlFor="plan-email" className="mt-4 block text-sm font-medium">Work email</label><input id="plan-email" name="email" type="email" required autoComplete="email" maxLength={254} className={input} />
            <div className="hidden" aria-hidden="true"><label>Company fax<input name="companyFax" tabIndex={-1} autoComplete="off" /></label></div>
            <p className="mt-4 break-all text-xs text-slate-500">Attached: {report.domain} · {view.label} · {view.score ?? 'Not scored'}/100 · top findings</p>
            <label className="mt-4 flex items-start gap-3 text-xs leading-relaxed text-slate-600"><input name="consent" type="checkbox" required className="mt-1 h-4 w-4 shrink-0" /><span>OfRoot may contact me about this report and implementation services. <Link href="/legal/privacy" className="underline">Privacy policy</Link></span></label>
            <button disabled={leadState === 'sending' || !token} className={`${button} mt-5 w-full`}>{leadState === 'sending' ? 'Sending your report…' : 'Get My Fix Plan'}</button>
            {!token && <p className="mt-3 text-sm text-slate-600">Online requests are temporarily unavailable. <Link href="/book" className="underline">Book an OfRoot review</Link>.</p>}
            <div role="alert">{leadError && <p className="mt-3 text-sm text-red-800">{leadError} <Link href="/book" className="underline">Book a review</Link></p>}</div>
          </form>}
        </div>
        <button disabled={busy} onClick={() => void scan()} className="mt-7 min-h-11 text-sm font-medium underline underline-offset-4">Run another check (recent results may be reused)</button>
      </section> : <section className="mx-auto max-w-6xl px-5 py-14 sm:px-8"><div className="grid gap-8 border-b border-slate-200 pb-12 sm:grid-cols-3">{[
        ['Can agents find you?', 'Discovery signals help agents locate your business and the resources you publish.'],
        ['Can they understand you?', 'Readable content and clear structure help machines interpret what your business offers.'],
        ['Can they take action?', 'Usable controls and relevant integrations help agents move from a question to a next step.'],
      ].map(([title, text]) => <div key={title}><h2 className="text-xl font-semibold">{title}</h2><p className="mt-3 text-sm leading-relaxed text-slate-600">{text}</p></div>)}</div><div className="mt-7 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center"><p className="max-w-3xl text-sm text-slate-500">Scanning powered by <a href="https://ora.ai" target="_blank" rel="noreferrer" className="underline">Ora</a>. OfRoot turns the findings into practical implementation work. Website mode uses Ora’s essentials methodology; product mode includes its broader integration checks. Scores do not guarantee AI visibility.</p><Link href="/ai-agent-readiness-assessment" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-800">Assess your organization instead <ArrowRight size={16} aria-hidden="true" /></Link></div></section>}
    </main>
  );
}
