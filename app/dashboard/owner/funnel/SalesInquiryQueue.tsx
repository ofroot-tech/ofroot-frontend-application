'use client';

import { useState } from 'react';
import type { SalesInquiryPipelineUpdate, SalesInquiryRecord } from '@/app/lib/supabase-store';

const stages: Array<{ value: SalesInquiryPipelineUpdate['stage']; label: string }> = [
  { value: 'new', label: 'New' }, { value: 'contacted', label: 'Contacted' }, { value: 'discovery', label: 'Discovery' },
  { value: 'audit_proposed', label: 'Audit proposed' }, { value: 'audit_won', label: 'Audit won' }, { value: 'build_won', label: 'Build won' },
  { value: 'retainer_won', label: 'Retainer won' }, { value: 'lost', label: 'Lost' },
];

function pipelineFor(item: SalesInquiryRecord) {
  return (item.payload?.pipeline || {}) as { stage?: SalesInquiryPipelineUpdate['stage']; nextAction?: string | null; nextActionAt?: string | null };
}

function sourceFor(item: SalesInquiryRecord, form: Record<string, unknown>) {
  const ctaSource = String(form.ctaSource || '').trim();
  if (ctaSource) return ctaSource;
  const utm = (form.utm || {}) as Record<string, unknown>;
  const campaign = String(utm.campaign || '').trim();
  return campaign || 'direct';
}

export default function SalesInquiryQueue({ initialItems }: { initialItems: SalesInquiryRecord[] }) {
  const [items, setItems] = useState(initialItems);
  const [saving, setSaving] = useState<number | null>(null);

  async function update(id: number, patch: { stage?: SalesInquiryPipelineUpdate['stage']; nextAction?: string | null; nextActionAt?: string | null }) {
    const current = items.find((item) => item.id === id);
    if (!current) return;
    const pipeline = pipelineFor(current);
    const body = { stage: patch.stage || pipeline.stage || 'new', nextAction: patch.nextAction ?? pipeline.nextAction ?? null, nextActionAt: patch.nextActionAt ?? pipeline.nextActionAt ?? null };
    setSaving(id);
    try {
      const response = await fetch(`/api/admin/sales-inquiries/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!response.ok) throw new Error('Could not save pipeline update');
      const json = await response.json();
      setItems((currentItems) => currentItems.map((item) => item.id === id ? json.data : item));
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 text-left"><tr><th className="px-3 py-2">Name</th><th className="px-3 py-2">Email</th><th className="px-3 py-2">Business</th><th className="px-3 py-2">Source</th><th className="px-3 py-2">Bottleneck</th><th className="px-3 py-2">Desired outcome</th><th className="px-3 py-2">Stage</th><th className="px-3 py-2">Next action</th><th className="px-3 py-2">Submitted</th></tr></thead>
        <tbody>{items.length === 0 ? <tr><td className="px-3 py-3 text-gray-500" colSpan={9}>No growth-system audit requests captured yet.</td></tr> : items.map((item) => {
          const form = (item.payload?.form || {}) as Record<string, unknown>;
          const pipeline = pipelineFor(item);
          return <tr key={item.id} className="border-t align-top"><td className="px-3 py-2">{item.name || '-'}</td><td className="px-3 py-2">{item.email || '-'}</td><td className="px-3 py-2">{item.business_name || '-'}</td><td className="max-w-xs px-3 py-2 text-xs text-gray-600">{sourceFor(item, form)}</td><td className="px-3 py-2">{String(form.growthBottleneck || '-')}</td><td className="max-w-sm px-3 py-2">{String(form.desiredOutcome || '-')}</td><td className="px-3 py-2"><select aria-label={`Pipeline stage for ${item.business_name || item.name}`} disabled={saving === item.id} value={pipeline.stage || 'new'} onChange={(event) => void update(item.id, { stage: event.target.value as SalesInquiryPipelineUpdate['stage'] })} className="min-h-9 rounded border border-gray-300 bg-white px-2 text-xs">{stages.map((stage) => <option key={stage.value} value={stage.value}>{stage.label}</option>)}</select></td><td className="px-3 py-2"><input aria-label={`Next action for ${item.business_name || item.name}`} disabled={saving === item.id} defaultValue={pipeline.nextAction || ''} onBlur={(event) => void update(item.id, { nextAction: event.target.value })} placeholder="Reply, call, qualify…" className="min-h-9 w-40 rounded border border-gray-300 px-2 text-xs" /></td><td className="whitespace-nowrap px-3 py-2">{new Date(item.created_at).toLocaleString()}</td></tr>;
        })}</tbody>
      </table>
    </div>
  );
}
