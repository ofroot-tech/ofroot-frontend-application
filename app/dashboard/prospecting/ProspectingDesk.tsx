'use client';

import {type ChangeEvent, type ReactNode, useEffect, useMemo, useState} from 'react';
import {ClipboardCopy, FileUp, Filter, PhoneCall, Sparkles, Upload} from 'lucide-react';
import {buildProspects, callScript, emailDraft, parseCsv, prospectKey, scoreProspect, type OutreachStatus, type Prospect} from './prospecting-utils';

const STORAGE_KEY = 'ofroot.prospecting-desk.v1';
const statusLabel: Record<OutreachStatus, string> = {uncontacted: 'Not contacted', researched: 'Researched', email_drafted: 'Email drafted', call_queued: 'Call queued', contacted: 'Contacted'};
const tone: Record<OutreachStatus, string> = {uncontacted: 'bg-slate-100 text-slate-700', researched: 'bg-violet-100 text-violet-800', email_drafted: 'bg-sky-100 text-sky-800', call_queued: 'bg-orange-100 text-orange-800', contacted: 'bg-emerald-100 text-emerald-800'};

export function ProspectingDesk() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [vertical, setVertical] = useState('All verticals');
  const [market, setMarket] = useState('All markets');
  const [query, setQuery] = useState('');
  const [report, setReport] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [storageLoaded, setStorageLoaded] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        if (saved) setProspects(JSON.parse(saved) as Prospect[]);
      } catch { window.localStorage.removeItem(STORAGE_KEY); }
      setStorageLoaded(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => { if (storageLoaded) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prospects)); }, [prospects, storageLoaded]);

  const verticals = useMemo(() => ['All verticals', ...Array.from(new Set(prospects.map((item) => item.vertical))).sort()], [prospects]);
  const markets = useMemo(() => ['All markets', ...Array.from(new Set(prospects.map((item) => item.market))).sort()], [prospects]);
  const filtered = useMemo(() => prospects.filter((item) => vertical === 'All verticals' || item.vertical === vertical).filter((item) => market === 'All markets' || item.market === market).filter((item) => `${item.businessName} ${item.website} ${item.email}`.toLowerCase().includes(query.toLowerCase())).sort((a, b) => b.score - a.score), [prospects, vertical, market, query]);
  const selected = filtered.find((item) => item.id === selectedId) || filtered[0] || null;

  function importRows(text: string, source: string) {
    const incoming = buildProspects(parseCsv(text), source);
    if (!incoming.length) { setReport('No usable rows found. Include a business, company, or name column.'); return; }
    setProspects((existing) => {
      const keys = new Set(existing.map(prospectKey));
      const unique = incoming.filter((item) => !keys.has(prospectKey(item)));
      setReport(`${unique.length} prospect${unique.length === 1 ? '' : 's'} added; ${incoming.length - unique.length} duplicate${incoming.length - unique.length === 1 ? '' : 's'} skipped.`);
      return [...existing, ...unique];
    });
  }
  function onFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; if (!file) return;
    const reader = new FileReader(); reader.onload = () => importRows(String(reader.result || ''), `CSV import · ${file.name}`); reader.readAsText(file); event.target.value = '';
  }
  function patchSelected(next: Partial<Prospect>) { if (selected) setProspects((items) => items.map((item) => item.id === selected.id ? {...item, ...next} : item)); }
  async function copy(text: string, kind: string) { await navigator.clipboard.writeText(text); setCopied(kind); window.setTimeout(() => setCopied(null), 1600); }
  const reachable = prospects.filter((item) => item.email || item.phone).length;

  return <div className="space-y-5 text-slate-900">
    <section className="overflow-hidden rounded-[24px] border border-slate-200 bg-[#10212b] text-white shadow-[0_18px_45px_rgba(15,35,47,0.16)]">
      <div className="grid gap-5 px-5 py-6 sm:px-7 lg:grid-cols-[1fr_auto] lg:items-end"><div className="max-w-2xl"><div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.17em] text-orange-200"><Sparkles size={14} /> Prospecting desk</div><h1 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl">Turn evidence into the next useful conversation.</h1><p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">Import businesses, rank their fit, then shape a truthful email or call outline. Nothing sends from this workspace.</p></div><ImportButton onFile={onFile} /></div>
      <div className="grid border-t border-white/10 bg-white/[0.035] sm:grid-cols-3"><Stat label="Imported prospects" value={String(prospects.length)} /><Stat label="Reachable now" value={String(reachable)} /><Stat label="Tracked sources" value={String(new Set(prospects.map((item) => item.source)).size)} /></div>
    </section>
    <section className="grid gap-3 rounded-2xl border border-[#dbe3e7] bg-[#f7f4ed] p-3 shadow-[0_1px_2px_rgba(15,35,47,0.05)] lg:grid-cols-[1fr_auto] lg:items-center"><div className="flex flex-col gap-2 sm:flex-row"><label className="flex min-h-10 flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-500 focus-within:border-[#c56a20] focus-within:ring-2 focus-within:ring-orange-100"><Filter size={15} /><span className="sr-only">Search prospects</span><input className="w-full bg-transparent text-slate-900 outline-none placeholder:text-slate-400" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search business, site, or email" /></label><select className="min-h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm" value={vertical} onChange={(event) => setVertical(event.target.value)}>{verticals.map((item) => <option key={item}>{item}</option>)}</select><select className="min-h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm" value={market} onChange={(event) => setMarket(event.target.value)}>{markets.map((item) => <option key={item}>{item}</option>)}</select></div><p className="px-1 text-xs text-slate-600">Browser-only data · Deduplicated by website, email, phone, or business + market.</p></section>
    {report ? <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-950">{report}</div> : null}
    {selected ? <div className="grid gap-5 xl:grid-cols-[minmax(300px,.75fr)_minmax(0,1.25fr)]"><Queue items={filtered} selected={selected} select={setSelectedId} /><Detail prospect={selected} copied={copied} onChange={patchSelected} onCopy={copy} /></div> : <EmptyState onFile={onFile} />}
  </div>;
}

function ImportButton({onFile}: {onFile: (event: ChangeEvent<HTMLInputElement>) => void}) { return <label className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#e78b3c] px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-[#f3a45e] focus-within:ring-4 focus-within:ring-orange-200/40"><FileUp size={17} /> Import a CSV<input className="sr-only" type="file" accept=".csv,text/csv" onChange={onFile} /></label>; }
function Stat({label, value}: {label: string; value: string}) { return <div className="px-5 py-3"><div className="text-xs font-medium uppercase tracking-[.13em] text-slate-400">{label}</div><div className="mt-1 text-2xl font-semibold tabular-nums text-white">{value}</div></div>; }
function EmptyState({onFile}: {onFile: (event: ChangeEvent<HTMLInputElement>) => void}) { return <section className="grid gap-6 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-[0_4px_14px_rgba(15,35,47,0.04)] sm:p-12"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f7e8d8] text-[#a85118]"><Upload size={21} /></div><div><h2 className="text-xl font-semibold tracking-tight text-slate-950">No business stream is connected yet.</h2><p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-600">Start with a CSV export from a directory, CRM, or research list. Required: a business or company column. Helpful: vertical, market, website, email, phone, evidence, and likely need.</p></div><div><ImportButton onFile={onFile} /></div><p className="text-xs text-slate-500">Existing CRM import accepts CSV, HubSpot, Facebook, and other exports. No business directory is connected in this release.</p></section>; }
function Queue({items, selected, select}: {items: Prospect[]; selected: Prospect; select: (id: string) => void}) { return <section aria-label="Prioritized prospect queue" className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_4px_14px_rgba(15,35,47,0.05)]"><div className="flex items-center justify-between border-b border-slate-100 px-4 py-3"><div><h2 className="text-sm font-semibold">Priority queue</h2><p className="mt-0.5 text-xs text-slate-500">Fit and available contact detail drive the score.</p></div><span className="text-sm font-semibold tabular-nums text-slate-600">{items.length}</span></div><div className="max-h-[720px] divide-y divide-slate-100 overflow-y-auto">{items.map((item) => <button key={item.id} type="button" onClick={() => select(item.id)} className={`w-full px-4 py-4 text-left transition hover:bg-[#fbf8f2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#c56a20] ${selected.id === item.id ? 'bg-[#f7f4ed]' : 'bg-white'}`}><div className="flex items-start gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#10212b] text-sm font-semibold tabular-nums text-white">{item.score}</div><div className="min-w-0 flex-1"><div className="truncate text-sm font-semibold text-slate-950">{item.businessName}</div><div className="mt-0.5 text-xs text-slate-500">{item.vertical} · {item.market}</div><div className="mt-2 flex flex-wrap gap-1"><span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${tone[item.outreachStatus]}`}>{statusLabel[item.outreachStatus]}</span>{item.inferredNeed ? <span className="rounded-full bg-[#f8e8d8] px-2 py-0.5 text-[11px] font-medium text-[#8d4310]">Need modeled</span> : null}</div></div></div></button>)}</div></section>; }

function Detail({prospect, onChange, onCopy, copied}: {prospect: Prospect; onChange: (next: Partial<Prospect>) => void; onCopy: (text: string, kind: string) => void; copied: string | null}) {
  const email = emailDraft(prospect); const script = callScript(prospect);
  return <section className="space-y-5"><div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_4px_14px_rgba(15,35,47,0.05)]"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><div className="text-xs font-semibold uppercase tracking-[.14em] text-[#a85118]">{prospect.vertical} · {prospect.market}</div><h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">{prospect.businessName}</h2><p className="mt-2 text-sm text-slate-600">{[prospect.website, prospect.email, prospect.phone].filter(Boolean).join(' · ') || 'No direct contact detail imported'}</p></div><label className="text-xs font-medium text-slate-600">Outreach state<select className="mt-1 block min-h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900" value={prospect.outreachStatus} onChange={(event) => onChange({outreachStatus: event.target.value as OutreachStatus})}>{Object.entries(statusLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label></div><div className="mt-5 grid gap-3 md:grid-cols-2"><Evidence label="Verified facts" value={prospect.verifiedFacts} placeholder="Facts imported from your source. Add only things you can support." className="border-emerald-200 bg-emerald-50/60" onChange={(verifiedFacts) => onChange({verifiedFacts, score: scoreProspect({...prospect, verifiedFacts})})} /><Evidence label="Internal inference" value={prospect.inferredNeed} placeholder="A hypothesis to test on the call, never a claim in outreach." className="border-orange-200 bg-orange-50/70" onChange={(inferredNeed) => onChange({inferredNeed, score: scoreProspect({...prospect, inferredNeed})})} /></div><label className="mt-4 block text-xs font-medium text-slate-600">Working notes<textarea value={prospect.notes} onChange={(event) => onChange({notes: event.target.value})} rows={3} className="mt-1 w-full rounded-xl border border-slate-200 bg-[#fcfcfb] px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#c56a20] focus:ring-2 focus:ring-orange-100" placeholder="Context from research, call result, or next action." /></label></div><div className="grid gap-5 lg:grid-cols-2"><Draft title="Email draft" icon={<ClipboardCopy size={16} />} value={email} onCopy={() => onCopy(email, 'email')} label={copied === 'email' ? 'Copied' : 'Copy email'} /><Draft title="Call outline" icon={<PhoneCall size={16} />} value={script} onCopy={() => onCopy(script, 'call')} label={copied === 'call' ? 'Copied' : 'Copy call script'} /></div></section>;
}
function Evidence({label, value, placeholder, className, onChange}: {label: string; value: string; placeholder: string; className: string; onChange: (value: string) => void}) { return <label className={`rounded-xl border p-3 ${className}`}><span className="text-xs font-semibold uppercase tracking-[.12em] text-slate-700">{label}</span><textarea value={value} onChange={(event) => onChange(event.target.value)} rows={4} className="mt-2 w-full resize-none bg-transparent text-sm leading-6 text-slate-800 outline-none placeholder:text-slate-400" placeholder={placeholder} /></label>; }
function Draft({title, icon, value, onCopy, label}: {title: string; icon: ReactNode; value: string; onCopy: () => void; label: string}) { return <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_4px_14px_rgba(15,35,47,0.05)]"><div className="flex items-center justify-between border-b border-slate-100 px-4 py-3"><h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">{icon}{title}</h3><button type="button" onClick={onCopy} className="min-h-9 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-[#c56a20]">{label}</button></div><textarea aria-label={title} value={value} readOnly rows={16} className="w-full resize-y bg-[#fcfcfb] px-4 py-3 font-mono text-xs leading-5 text-slate-700 outline-none" /></section>; }
