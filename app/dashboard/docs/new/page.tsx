// app/dashboard/docs/new/page.tsx
//
// Super-admin Doc Creator — Write Markdown into /docs as <slug>.md
// SSR-guard idea: This page should only be accessible to super admins.
// For now we rely on backend cookie auth and a simple allowlist on emails.

'use client';

import { useState } from 'react';
import { toast } from '@/components/Toaster';

export default function NewDocPage() {
  const [slug, setSlug] = useState('my-doc');
  const [title, setTitle] = useState('New Document');
  const [body, setBody] = useState('# New Document\n\nWrite your content...');
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin/docs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, title, body }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.ok) throw new Error(json?.error?.message || 'Failed to save');
      toast({ type: 'success', title: 'Saved', message: 'Document created' });
    } catch (err: any) {
      toast({ type: 'error', title: 'Save failed', message: err?.message || 'Error' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-xl font-semibold mb-4">Create Doc</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label htmlFor="slug" className="block text-sm text-gray-700">Slug</label>
          <input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} className="w-full rounded-md border px-3 py-2 text-sm" required pattern="[a-z0-9-_]+" />
          <p className="text-xs text-gray-500">URL: /docs/{'{slug}'}</p>
        </div>
        <div>
          <label htmlFor="title" className="block text-sm text-gray-700">Title</label>
          <input id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-md border px-3 py-2 text-sm" required />
        </div>
        <div>
          <label htmlFor="body" className="block text-sm text-gray-700">Markdown</label>
          <textarea id="body" value={body} onChange={(e) => setBody(e.target.value)} className="w-full rounded-md border px-3 py-2 text-sm min-h-[280px] font-mono" required />
        </div>
        <button type="submit" disabled={saving} className={`${saving ? 'bg-gray-300' : 'bg-brand-600 hover:bg-brand-700'} rounded-md px-3 py-2 text-sm text-white`}>{saving ? 'Saving…' : 'Save'}</button>
      </form>
    </div>
  );
}
