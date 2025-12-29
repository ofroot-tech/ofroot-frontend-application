// app/dashboard/docs/[slug]/page.tsx
//
// Super-admin Doc Editor — Edit an existing Markdown doc (title/body) by slug.

'use client';

import { use, useCallback, useEffect, useState } from 'react';
import { toast } from '@/components/Toaster';
import { useRouter } from 'next/navigation';

export default function EditDocPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/docs/${encodeURIComponent(slug)}`);
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.ok) throw new Error(json?.error?.message || 'Failed to load');
      setTitle(json.data.title || '');
      setBody(json.data.body || '');
    } catch (e: any) {
      toast({ type: 'error', title: 'Load failed', message: e?.message || 'Error' });
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => { load(); }, [load]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/docs/${encodeURIComponent(slug)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.ok) throw new Error(json?.error?.message || 'Failed to save');
      toast({ type: 'success', title: 'Saved', message: 'Document updated' });
      router.push('/dashboard/docs');
    } catch (err: any) {
      toast({ type: 'error', title: 'Save failed', message: err?.message || 'Error' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Edit Doc</h1>
      </div>
      {loading ? (
        <p className="text-gray-500">Loading…</p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label htmlFor="title" className="block text-sm text-gray-700">Title</label>
            <input id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-md border px-3 py-2 text-sm" required />
          </div>
          <div>
            <label htmlFor="body" className="block text-sm text-gray-700">Markdown</label>
            <textarea id="body" value={body} onChange={(e) => setBody(e.target.value)} className="min-h-[280px] w-full rounded-md border px-3 py-2 font-mono text-sm" required />
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className={`${saving ? 'bg-gray-300' : 'bg-brand-600 hover:bg-brand-700'} rounded-md px-3 py-2 text-sm text-white`}>{saving ? 'Saving…' : 'Save'}</button>
            <button type="button" onClick={() => router.push('/dashboard/docs')} className="rounded-md border px-3 py-2 text-sm">Cancel</button>
          </div>
        </form>
      )}
    </div>
  );
}
