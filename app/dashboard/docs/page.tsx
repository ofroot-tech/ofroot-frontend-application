// app/dashboard/docs/page.tsx
//
// Super-admin Docs Manager: list docs with edit/delete and link to New.
// Uses the admin API routes added under /api/admin/docs and /api/admin/docs/[slug].

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from '@/components/Toaster';

interface DocItem { slug: string; title: string }

export default function DocsManagerPage() {
  const [items, setItems] = useState<DocItem[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/docs', { cache: 'no-store' });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.ok) throw new Error(json?.error?.message || 'Failed to load');
      setItems(json.data.items as DocItem[]);
    } catch (e: any) {
      toast({ type: 'error', title: 'Load failed', message: e?.message || 'Error' });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function onDelete(slug: string) {
    if (!confirm(`Delete doc "${slug}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/docs/${encodeURIComponent(slug)}`, { method: 'DELETE' });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.ok) throw new Error(json?.error?.message || 'Failed to delete');
      toast({ type: 'success', title: 'Deleted', message: slug });
      setItems((prev) => prev.filter((i) => i.slug !== slug));
    } catch (e: any) {
      toast({ type: 'error', title: 'Delete failed', message: e?.message || 'Error' });
    }
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Docs</h1>
        <Link href="/dashboard/docs/new" className="rounded-md bg-brand-600 hover:bg-brand-700 text-white text-sm px-3 py-2">New</Link>
      </div>
      {loading ? (
        <p className="text-gray-500">Loading…</p>
      ) : items.length === 0 ? (
        <p className="text-gray-600">No documents yet.</p>
      ) : (
        <ul className="divide-y border rounded-md">
          {items.map((it) => (
            <li key={it.slug} className="flex items-center justify-between p-3">
              <div>
                <div className="font-medium">{it.title}</div>
                <div className="text-xs text-gray-500">/docs/{it.slug}</div>
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/dashboard/docs/${it.slug}`} className="text-sm underline">Edit</Link>
                <button onClick={() => onDelete(it.slug)} className="text-sm text-red-600 hover:text-red-700">Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
