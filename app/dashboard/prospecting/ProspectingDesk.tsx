'use client';

import {type ChangeEvent, type ReactNode, useEffect, useMemo, useState} from 'react';
import {CalendarClock, Check, ClipboardCopy, Download, ExternalLink, FileUp, Filter, Loader2, Mail, PhoneCall, Search, Upload, X} from 'lucide-react';
import {buildProspects, callScript, emailDraft, normalizeProspect, parseCsv, scoreProspect, scoreReasons, uniqueProspects, type OutreachOutcome, type OutreachStatus, type Prospect} from './prospecting-utils';

const STORAGE_KEY = 'ofroot.prospecting-desk.v1';

type QueueBucket = 'today' | 'overdue' | 'upcoming' | 'needs_planning';
type QueueView = QueueBucket | 'next_five' | 'all';
const statusLabel: Record<OutreachStatus, string> = {uncontacted: 'Not contacted', researched: 'Researched', email_drafted: 'Email drafted', call_queued: 'Call queued', contacted: 'Contacted'};
const outcomeLabel: Record<OutreachOutcome, string> = {not_set: 'No outcome yet', positive: 'Positive', no_response: 'No response', not_a_fit: 'Not a fit', do_not_contact: 'Do not contact'};
const tone: Record<OutreachStatus, string> = {uncontacted: 'bg-slate-100 text-slate-700', researched: 'bg-violet-100 text-violet-800', email_drafted: 'bg-sky-100 text-sky-800', call_queued: 'bg-orange-100 text-orange-800', contacted: 'bg-emerald-100 text-emerald-800'};

function localDate() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function actionState(prospect: Prospect, today: string): QueueBucket {
  if (!prospect.nextActionAt) return 'needs_planning';
  if (prospect.nextActionAt < today) return 'overdue';
  if (prospect.nextActionAt > today) return 'upcoming';
  return 'today';
}

function compareQueue(a: Prospect, b: Prospect, today: string) {
  const order: Record<QueueBucket, number> = {overdue: 0, today: 1, upcoming: 2, needs_planning: 3};
  const actionDifference = order[actionState(a, today)] - order[actionState(b, today)];
  if (actionDifference) return actionDifference;
  if (a.nextActionAt && b.nextActionAt && a.nextActionAt !== b.nextActionAt) return a.nextActionAt.localeCompare(b.nextActionAt);
  return b.score - a.score;
}

function addBusinessDays(date: string, amount: number) {
  const result = new Date(`${date}T12:00:00`);
  let remaining = amount;
  while (remaining > 0) {
    result.setDate(result.getDate() + 1);
    if (result.getDay() !== 0 && result.getDay() !== 6) remaining -= 1;
  }
  return `${result.getFullYear()}-${String(result.getMonth() + 1).padStart(2, '0')}-${String(result.getDate()).padStart(2, '0')}`;
}

function emailLink(prospect: Prospect) {
  const draft = emailDraft(prospect);
  const [subjectLine = '', ...bodyLines] = draft.split('\n');
  const subject = subjectLine.replace(/^Subject:\s*/i, '');
  return `mailto:${prospect.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyLines.join('\n').trim())}`;
}

export function ProspectingDesk() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [vertical, setVertical] = useState('All verticals');
  const [market, setMarket] = useState('All markets');
  const [query, setQuery] = useState('');
  const [queueView, setQueueView] = useState<QueueView>('next_five');
  const [report, setReport] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [storageLoaded, setStorageLoaded] = useState(false);
  const [discovering, setDiscovering] = useState(false);
  const today = localDate();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) setProspects(parsed.map((item) => normalizeProspect(item as Partial<Prospect>)).filter((item): item is Prospect => Boolean(item)));
        }
      } catch { window.localStorage.removeItem(STORAGE_KEY); }
      setStorageLoaded(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => { if (storageLoaded) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prospects)); }, [prospects, storageLoaded]);

  const verticals = useMemo(() => ['All verticals', ...Array.from(new Set(prospects.map((item) => item.vertical))).sort()], [prospects]);
  const markets = useMemo(() => ['All markets', ...Array.from(new Set(prospects.map((item) => item.market))).sort()], [prospects]);
  const queueCounts = useMemo(() => prospects.filter((item) => !['not_a_fit', 'do_not_contact'].includes(item.outreachOutcome)).reduce<Record<QueueBucket, number>>((counts, item) => {
    counts[actionState(item, today)] += 1;
    return counts;
  }, {today: 0, overdue: 0, upcoming: 0, needs_planning: 0}), [prospects, today]);
  const matching = useMemo(() => prospects
    .filter((item) => vertical === 'All verticals' || item.vertical === vertical)
    .filter((item) => market === 'All markets' || item.market === market)
    .filter((item) => `${item.businessName} ${item.contactName} ${item.contactTitle} ${item.website} ${item.email} ${item.phone} ${item.notes}`.toLowerCase().includes(query.toLowerCase())), [prospects, vertical, market, query]);
  const filtered = useMemo(() => {
    const sorted = matching
      .filter((item) => queueView === 'all' || queueView === 'next_five' || actionState(item, today) === queueView)
      .filter((item) => !['not_a_fit', 'do_not_contact'].includes(item.outreachOutcome))
      .filter((item) => queueView !== 'next_five' || actionState(item, today) !== 'upcoming')
      .sort((a, b) => compareQueue(a, b, today));
    return queueView === 'next_five' ? sorted.slice(0, 5) : sorted;
  }, [matching, queueView, today]);
  const selected = filtered.find((item) => item.id === selectedId) || filtered[0] || null;
  const reachable = prospects.filter((item) => item.email || item.phone).length;
  const sourceHealth = useMemo(() => Array.from(new Map(prospects.map((item) => [item.source, {source: item.source, sourceUrl: item.sourceUrl, count: 0, reachable: 0, latest: item.sourceUpdatedAt || item.importedAt}])).values()).map((source) => { const items = prospects.filter((item) => item.source === source.source); return {...source, count: items.length, reachable: items.filter((item) => item.email || item.phone).length, latest: items.map((item) => item.sourceUpdatedAt || item.importedAt).sort().at(-1) || ''}; }).sort((a, b) => b.latest.localeCompare(a.latest)), [prospects]);

  function importRows(text: string, source: string) {
    const incoming = buildProspects(parseCsv(text), source);
    if (!incoming.length) { setReport('No usable rows found. Include a business, company, or name column.'); return; }
    setProspects((existing) => {
      const unique = uniqueProspects(existing, incoming);
      setReport(`${unique.length} prospect${unique.length === 1 ? '' : 's'} added; ${incoming.length - unique.length} duplicate${incoming.length - unique.length === 1 ? '' : 's'} skipped.`);
      return [...existing, ...unique];
    });
  }
  async function discoverHoustonHvac() {
    setDiscovering(true);
    setReport(null);
    try {
      const response = await fetch('/api/prospecting/discover/houston-hvac');
      const payload = await response.json().catch(() => ({})) as {ok?: boolean; data?: {prospects?: Prospect[]; availableCount?: number}; error?: {message?: string}};
      if (!response.ok || !payload.ok || !Array.isArray(payload.data?.prospects)) throw new Error(payload.error?.message || 'Discovery failed.');
      const incoming = payload.data.prospects.map((item) => normalizeProspect(item)).filter((item): item is Prospect => Boolean(item));
      setProspects((existing) => {
        const unique = uniqueProspects(existing, incoming);
        if (unique[0]) setSelectedId(unique[0].id);
        setVertical('HVAC');
        setMarket('Houston / Harris County');
        setQueueView('needs_planning');
        setReport(`${unique.length} licensed HVAC business${unique.length === 1 ? '' : 'es'} added; ${incoming.length - unique.length} duplicate${incoming.length - unique.length === 1 ? '' : 's'} skipped. ${payload.data?.availableCount || incoming.length} current Harris County records are available; this batch is capped at ${incoming.length}.`);
        return [...existing, ...unique];
      });
    } catch (error) {
      setReport(error instanceof Error ? error.message : 'Texas licensing data could not be reached.');
    } finally {
      setDiscovering(false);
    }
  }
  function onFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => importRows(String(reader.result || ''), `CSV import · ${file.name}`);
    reader.readAsText(file);
    event.target.value = '';
  }
  function patchSelected(next: Partial<Prospect>) {
    if (!selected) return;
    setProspects((items) => items.map((item) => {
      if (item.id !== selected.id) return item;
      const updated = {...item, ...next};
      return {...updated, score: scoreProspect(updated)};
    }));
  }
  function recordOutcome(outcome: OutreachOutcome) {
    if (!selected) return;
    const followUp = outcome === 'no_response' ? {nextAction: 'Follow up', nextActionAt: addBusinessDays(today, 2)} : outcome === 'positive' ? {nextAction: 'Schedule working session', nextActionAt: addBusinessDays(today, 1)} : {nextAction: '', nextActionAt: ''};
    patchSelected({outreachStatus: 'contacted', outreachOutcome: outcome, lastContactedAt: today, ...followUp});
    setReport(outcome === 'no_response' ? 'No answer recorded. Follow-up scheduled in two business days.' : outcome === 'positive' ? 'Interest recorded. Working-session follow-up scheduled.' : outcome === 'do_not_contact' ? 'Do-not-contact recorded and removed from the worklist.' : 'Not-a-fit outcome recorded and removed from the worklist.');
  }
  function exportProspects() { const blob = new Blob([JSON.stringify(prospects, null, 2)], {type: 'application/json'}); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `ofroot-prospects-${today}.json`; link.click(); URL.revokeObjectURL(url); setReport('Browser-local prospects exported.'); }
  async function copy(text: string, kind: string) {
    await navigator.clipboard.writeText(text);
    setCopied(kind);
    window.setTimeout(() => setCopied(null), 1600);
  }

  return <div className="space-y-5 text-slate-900">
    <section className="overflow-hidden rounded-2xl bg-[#10212b] text-white shadow-[0_14px_35px_rgba(15,35,47,0.14)]">
      <div className="grid gap-4 px-5 py-5 sm:px-6 lg:grid-cols-[1fr_auto] lg:items-center"><div className="max-w-2xl"><h1 className="text-2xl font-semibold tracking-[-0.025em] text-white">Your next five conversations</h1><p className="mt-1 max-w-xl text-sm leading-6 text-slate-300">Work the most urgent, highest-signal prospects and record each result in one step.</p></div><div className="flex flex-wrap gap-2"><DiscoveryButton loading={discovering} onClick={discoverHoustonHvac} /><button type="button" onClick={() => setQueueView('next_five')} disabled={!prospects.length} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#e78b3c] px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-[#f3a45e] disabled:cursor-not-allowed disabled:opacity-50"><Check size={17} /> Work next five</button><button type="button" onClick={exportProspects} disabled={!prospects.length} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"><Download size={17} /> Export</button><ImportButton onFile={onFile} /></div></div>
      <div className="grid border-t border-white/10 bg-white/[0.035] grid-cols-2 sm:grid-cols-4"><Stat label="Reachable" value={String(reachable)} /><Stat label="Due today" value={String(queueCounts.today)} /><Stat label="Overdue" value={String(queueCounts.overdue)} /><Stat label="Needs planning" value={String(queueCounts.needs_planning)} /></div>
    </section>
    <section className="grid gap-3 rounded-2xl border border-[#dbe3e7] bg-[#f7f4ed] p-3 shadow-[0_1px_2px_rgba(15,35,47,0.05)] lg:grid-cols-[1fr_auto] lg:items-center"><div className="flex flex-col gap-2 sm:flex-row"><label className="flex min-h-10 flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-500 focus-within:border-[#c56a20] focus-within:ring-2 focus-within:ring-orange-100"><Filter size={15} /><span className="sr-only">Search prospects</span><input className="w-full bg-transparent text-slate-900 outline-none placeholder:text-slate-400" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search business, contact, phone, site, or email" /></label><select aria-label="Action queue view" className="min-h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm" value={queueView} onChange={(event) => setQueueView(event.target.value as QueueView)}><option value="next_five">Next five</option><option value="today">Due today ({queueCounts.today})</option><option value="overdue">Overdue ({queueCounts.overdue})</option><option value="upcoming">Upcoming ({queueCounts.upcoming})</option><option value="needs_planning">Needs planning ({queueCounts.needs_planning})</option><option value="all">All prioritized</option></select><select aria-label="Vertical" className="min-h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm" value={vertical} onChange={(event) => setVertical(event.target.value)}>{verticals.map((item) => <option key={item}>{item}</option>)}</select><select aria-label="Market" className="min-h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm" value={market} onChange={(event) => setMarket(event.target.value)}>{markets.map((item) => <option key={item}>{item}</option>)}</select></div><p className="px-1 text-xs text-slate-600">Browser-only · Priority uses verified signals.</p></section>
    {sourceHealth.length ? <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_4px_14px_rgba(15,35,47,0.05)]"><div className="flex items-baseline justify-between"><div><h2 className="text-sm font-semibold">Source health</h2><p className="mt-0.5 text-xs text-slate-500">Latest imports and available contact routes.</p></div><span className="text-xs text-slate-500">{sourceHealth.length} source{sourceHealth.length === 1 ? '' : 's'}</span></div><div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{sourceHealth.map((source) => <div key={source.source} className="rounded-xl bg-slate-50 p-3"><div className="flex items-center gap-1 truncate text-xs font-semibold text-slate-800" title={source.source}>{source.source}{source.sourceUrl ? <a href={source.sourceUrl} target="_blank" rel="noreferrer" aria-label={`Open ${source.source}`} className="shrink-0 text-slate-500 hover:text-[#a85118]"><ExternalLink size={12} /></a> : null}</div><div className="mt-1 text-xs text-slate-600">{source.count} prospects · {source.reachable} reachable</div><div className="mt-1 text-[11px] text-slate-500">Source checked {source.latest ? new Date(source.latest).toLocaleDateString() : 'unknown'}</div></div>)}</div></section> : null}
    {report ? <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-950">{report}</div> : null}
    {prospects.length === 0 ? <EmptyState onFile={onFile} onDiscover={discoverHoustonHvac} discovering={discovering} /> : selected ? <div className="grid gap-5 xl:grid-cols-[minmax(300px,.75fr)_minmax(0,1.25fr)]"><Queue items={filtered} selected={selected} select={setSelectedId} queueView={queueView} today={today} /><Detail prospect={selected} copied={copied} onChange={patchSelected} onCopy={copy} onOutcome={recordOutcome} today={today} /></div> : <NoQueueResults queueView={queueView} count={matching.length} onViewChange={setQueueView} />}
  </div>;
}

function ImportButton({onFile}: {onFile: (event: ChangeEvent<HTMLInputElement>) => void}) { return <label className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#e78b3c] px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-[#f3a45e] focus-within:ring-4 focus-within:ring-orange-200/40"><FileUp size={17} /> Import a CSV<input className="sr-only" type="file" accept=".csv,text/csv" onChange={onFile} /></label>; }
function DiscoveryButton({loading, onClick}: {loading: boolean; onClick: () => void}) { return <button type="button" onClick={onClick} disabled={loading} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-[#10212b] transition hover:bg-slate-100 disabled:cursor-wait disabled:opacity-70">{loading ? <Loader2 className="animate-spin" size={17} /> : <Search size={17} />}{loading ? 'Finding businesses…' : 'Find Houston HVAC'}</button>; }
function Stat({label, value}: {label: string; value: string}) { return <div className="px-5 py-3"><div className="text-xs font-medium uppercase tracking-[.13em] text-slate-400">{label}</div><div className="mt-1 text-2xl font-semibold tabular-nums text-white">{value}</div></div>; }
function EmptyState({onFile, onDiscover, discovering}: {onFile: (event: ChangeEvent<HTMLInputElement>) => void; onDiscover: () => void; discovering: boolean}) { return <section className="grid gap-6 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-[0_4px_14px_rgba(15,35,47,0.04)] sm:p-12"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f7e8d8] text-[#a85118]"><Upload size={21} /></div><div><h2 className="text-xl font-semibold tracking-tight text-slate-950">Start with licensed Houston HVAC businesses.</h2><p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-600">Pull a first batch from Texas TDLR, then research the website, email, or phone for the best fits. Licensing is verified; contact details remain an explicit next step.</p></div><div className="flex flex-wrap justify-center gap-2"><DiscoveryButton loading={discovering} onClick={onDiscover} /><ImportButton onFile={onFile} /></div><p className="text-xs text-slate-500">The collector uses Texas Open Data and skips expired licenses. Results stay in this browser.</p></section>; }
function NoQueueResults({queueView, count, onViewChange}: {queueView: QueueView; count: number; onViewChange: (view: QueueView) => void}) { const label = queueView === 'next_five' ? 'ready for the worklist' : queueView === 'today' ? 'due today' : queueView === 'overdue' ? 'overdue' : queueView === 'upcoming' ? 'scheduled for a future date' : queueView === 'needs_planning' ? 'missing a next step' : 'matching this view'; return <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-[0_4px_14px_rgba(15,35,47,0.04)]"><CalendarClock className="mx-auto text-[#a85118]" size={22} /><h2 className="mt-3 text-lg font-semibold text-slate-950">No prospects are {label}.</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">{count ? 'Choose another queue view to plan the next action for these prospects.' : 'Try clearing the search or market filters.'}</p>{count && queueView !== 'all' ? <button type="button" onClick={() => onViewChange('all')} className="mt-4 min-h-10 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50">View all prioritized prospects</button> : null}</section>; }
function Queue({items, selected, select, queueView, today}: {items: Prospect[]; selected: Prospect; select: (id: string) => void; queueView: QueueView; today: string}) { const title = queueView === 'next_five' ? 'Next five conversations' : queueView === 'today' ? 'Today’s action queue' : queueView === 'overdue' ? 'Overdue actions' : queueView === 'upcoming' ? 'Upcoming actions' : queueView === 'needs_planning' ? 'Needs a next step' : 'Priority queue'; return <section aria-label="Prioritized prospect queue" className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_4px_14px_rgba(15,35,47,0.05)]"><div className="flex items-center justify-between border-b border-slate-100 px-4 py-3"><div><h2 className="text-sm font-semibold">{title}</h2><p className="mt-0.5 text-xs text-slate-500">Due actions first; priority uses verified signals.</p></div><span className="text-sm font-semibold tabular-nums text-slate-600">{items.length}</span></div><div className="max-h-[720px] divide-y divide-slate-100 overflow-y-auto">{items.map((item) => <button key={item.id} type="button" onClick={() => select(item.id)} className={`w-full px-4 py-4 text-left transition hover:bg-[#fbf8f2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#c56a20] ${selected.id === item.id ? 'bg-[#f7f4ed]' : 'bg-white'}`}><div className="flex items-start gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#10212b] text-sm font-semibold tabular-nums text-white">{item.score}</div><div className="min-w-0 flex-1"><div className="truncate text-sm font-semibold text-slate-950">{item.businessName}</div><div className="mt-0.5 text-xs text-slate-500">{item.vertical} · {item.market}</div><div className="mt-2 flex flex-wrap gap-1"><span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${tone[item.outreachStatus]}`}>{statusLabel[item.outreachStatus]}</span>{item.nextActionAt ? <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${item.nextActionAt < today ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'}`}>{item.nextActionAt < today ? `Overdue ${item.nextActionAt}` : item.nextActionAt === today ? 'Due today' : `Due ${item.nextActionAt}`}</span> : <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">Plan next step</span>}</div></div></div></button>)}</div></section>; }

function Detail({prospect, onChange, onCopy, onOutcome, copied, today}: {prospect: Prospect; onChange: (next: Partial<Prospect>) => void; onCopy: (text: string, kind: string) => void; onOutcome: (outcome: OutreachOutcome) => void; copied: string | null; today: string}) {
  const email = emailDraft(prospect); const script = callScript(prospect);
  const actionClass = 'inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c56a20]';
  return <section className="space-y-5"><div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_4px_14px_rgba(15,35,47,0.05)]"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><div className="text-xs font-semibold uppercase tracking-[.14em] text-[#a85118]">{prospect.vertical} · {prospect.market}</div><h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">{prospect.businessName}</h2><p className="mt-2 text-sm text-slate-600">{prospect.contactName ? `${prospect.contactName}${prospect.contactTitle ? ` · ${prospect.contactTitle}` : ''}` : 'No named contact imported'}</p><p className="mt-2 text-xs text-slate-500">Priority {prospect.score}: {scoreReasons(prospect).join(' · ')}.</p>{prospect.licenseNumber ? <p className="mt-2 text-xs text-slate-500">TDLR license {prospect.licenseNumber}{prospect.licenseExpiresAt ? ` · expires ${prospect.licenseExpiresAt}` : ''}{prospect.sourceUrl ? <> · <a href={prospect.sourceUrl} target="_blank" rel="noreferrer" className="font-medium text-[#a85118] underline underline-offset-2">view source</a></> : null}</p> : null}</div><label className="text-xs font-medium text-slate-600">Outreach state<select className="mt-1 block min-h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900" value={prospect.outreachStatus} onChange={(event) => { const outreachStatus = event.target.value as OutreachStatus; onChange({outreachStatus, lastContactedAt: outreachStatus === 'contacted' && !prospect.lastContactedAt ? today : prospect.lastContactedAt}); }}>{Object.entries(statusLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label></div>
    <div className="mt-4 flex flex-wrap gap-2">{prospect.email ? <a className={actionClass} href={emailLink(prospect)}><Mail size={16} /> Open email</a> : null}{prospect.phone ? <a className={actionClass} href={`tel:${prospect.phone.replace(/[^\d+]/g, '')}`}><PhoneCall size={16} /> Call {prospect.phone}</a> : null}{prospect.website ? <a className={actionClass} href={/^https?:\/\//i.test(prospect.website) ? prospect.website : `https://${prospect.website}`} target="_blank" rel="noreferrer"><ExternalLink size={16} /> Website</a> : null}{!prospect.email && !prospect.phone && !prospect.website ? <span className="text-sm text-slate-500">Add a contact route before outreach.</span> : null}</div>
    <div className="mt-5 rounded-xl bg-[#f7f4ed] p-3"><div className="text-xs font-semibold uppercase tracking-[.12em] text-slate-700">Record this result</div><div className="mt-3 flex flex-wrap gap-2"><button type="button" onClick={() => onOutcome('no_response')} className={actionClass}>No answer</button><button type="button" onClick={() => onOutcome('positive')} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#10212b] px-3 text-sm font-semibold text-white transition hover:bg-[#1d3442] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c56a20]"><Check size={16} /> Interested</button><button type="button" onClick={() => onOutcome('not_a_fit')} className={actionClass}><X size={16} /> Not a fit</button><button type="button" onClick={() => onOutcome('do_not_contact')} className={actionClass}>Do not contact</button></div><p className="mt-2 text-xs text-slate-500">The worklist advances automatically. No answer schedules two business days; interested schedules the next business day.</p></div>
    <div className="mt-5 grid gap-3 rounded-xl border border-violet-200 bg-violet-50/70 p-3 sm:grid-cols-2"><label className="text-xs font-medium text-violet-950">Contact name<input value={prospect.contactName} onChange={(event) => onChange({contactName: event.target.value})} className="mt-1 min-h-10 w-full rounded-lg border border-violet-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-[#c56a20] focus:ring-2 focus:ring-orange-100" placeholder="First and last name" /></label><label className="text-xs font-medium text-violet-950">Title or role<input value={prospect.contactTitle} onChange={(event) => onChange({contactTitle: event.target.value})} className="mt-1 min-h-10 w-full rounded-lg border border-violet-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-[#c56a20] focus:ring-2 focus:ring-orange-100" placeholder="Owner, operations lead…" /></label></div>
    <div className="mt-5 rounded-xl border border-sky-200 bg-sky-50/70 p-3"><div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[.12em] text-sky-900"><CalendarClock size={14} /> Next action</div><div className="mt-3 grid gap-3 sm:grid-cols-2"><label className="text-xs font-medium text-slate-700">Step<input value={prospect.nextAction} onChange={(event) => onChange({nextAction: event.target.value})} className="mt-1 min-h-10 w-full rounded-lg border border-sky-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-[#c56a20] focus:ring-2 focus:ring-orange-100" placeholder="Call, send email, research…" /></label><label className="text-xs font-medium text-slate-700">Due date<input type="date" value={prospect.nextActionAt} onChange={(event) => onChange({nextActionAt: event.target.value})} className="mt-1 min-h-10 w-full rounded-lg border border-sky-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-[#c56a20] focus:ring-2 focus:ring-orange-100" /></label><label className="text-xs font-medium text-slate-700">Last contacted<input type="date" value={prospect.lastContactedAt} onChange={(event) => onChange({lastContactedAt: event.target.value})} className="mt-1 min-h-10 w-full rounded-lg border border-sky-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-[#c56a20] focus:ring-2 focus:ring-orange-100" /></label><label className="text-xs font-medium text-slate-700">Outcome<select value={prospect.outreachOutcome} onChange={(event) => onChange({outreachOutcome: event.target.value as OutreachOutcome})} className="mt-1 min-h-10 w-full rounded-lg border border-sky-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-[#c56a20] focus:ring-2 focus:ring-orange-100">{Object.entries(outcomeLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label></div></div>
    <div className="mt-5 grid gap-3 md:grid-cols-2"><Evidence label="Verified facts" value={prospect.verifiedFacts} placeholder="Facts imported from your source. Add only things you can support." className="border-emerald-200 bg-emerald-50/60" onChange={(verifiedFacts) => onChange({verifiedFacts})} /><Evidence label="Internal inference" value={prospect.inferredNeed} placeholder="A hypothesis to test on the call, never a claim in outreach." className="border-orange-200 bg-orange-50/70" onChange={(inferredNeed) => onChange({inferredNeed})} /></div><label className="mt-4 block text-xs font-medium text-slate-600">Working notes<textarea value={prospect.notes} onChange={(event) => onChange({notes: event.target.value})} rows={3} className="mt-1 w-full rounded-xl border border-slate-200 bg-[#fcfcfb] px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#c56a20] focus:ring-2 focus:ring-orange-100" placeholder="Context from research, call result, or next action." /></label></div><div className="grid gap-5 lg:grid-cols-2"><Draft title="Email draft" icon={<ClipboardCopy size={16} />} value={email} onCopy={() => onCopy(email, 'email')} label={copied === 'email' ? 'Copied' : 'Copy email'} /><Draft title="Call outline" icon={<PhoneCall size={16} />} value={script} onCopy={() => onCopy(script, 'call')} label={copied === 'call' ? 'Copied' : 'Copy call script'} /></div></section>;
}
function Evidence({label, value, placeholder, className, onChange}: {label: string; value: string; placeholder: string; className: string; onChange: (value: string) => void}) { return <label className={`rounded-xl border p-3 ${className}`}><span className="text-xs font-semibold uppercase tracking-[.12em] text-slate-700">{label}</span><textarea value={value} onChange={(event) => onChange(event.target.value)} rows={4} className="mt-2 w-full resize-none bg-transparent text-sm leading-6 text-slate-800 outline-none placeholder:text-slate-400" placeholder={placeholder} /></label>; }
function Draft({title, icon, value, onCopy, label}: {title: string; icon: ReactNode; value: string; onCopy: () => void; label: string}) { return <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_4px_14px_rgba(15,35,47,0.05)]"><div className="flex items-center justify-between border-b border-slate-100 px-4 py-3"><h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">{icon}{title}</h3><button type="button" onClick={onCopy} className="min-h-9 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-[#c56a20]">{label}</button></div><textarea aria-label={title} value={value} readOnly rows={16} className="w-full resize-y bg-[#fcfcfb] px-4 py-3 font-mono text-xs leading-5 text-slate-700 outline-none" /></section>; }
