"use client";

import * as React from 'react';
import DOMPurify from 'dompurify';
import { marked } from 'marked';

export function MarkdownEditor({
  name,
  label = 'Body',
  value,
  onChange,
  error,
  rows = 12,
}: {
  name: string;
  label?: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  rows?: number;
}) {
  const [tab, setTab] = React.useState<'write' | 'preview'>('write');
  const html = React.useMemo(() => {
    try {
      const raw = marked.parse(value || '');
      const clean = DOMPurify.sanitize(String(raw));
      return clean;
    } catch {
      return '';
    }
  }, [value]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <div className="flex items-center gap-1 text-xs">
          <button type="button" className={`rounded-md px-2 py-1 border ${tab==='write'?'bg-white':'bg-gray-100'}`} onClick={() => setTab('write')}>Write</button>
          <button type="button" className={`rounded-md px-2 py-1 border ${tab==='preview'?'bg-white':'bg-gray-100'}`} onClick={() => setTab('preview')}>Preview</button>
        </div>
      </div>
      {tab === 'write' ? (
        <textarea
          name={name}
          rows={rows}
          required
          value={value}
          onChange={(e) => onChange(e.currentTarget.value)}
          placeholder="Write your content in Markdown..."
          className={`mt-1 w-full rounded-md border px-3 py-2 font-mono ${error ? 'border-red-300' : ''}`}
        />
      ) : (
        <div className="mt-1 w-full rounded-md border px-3 py-3 bg-white">
          {value ? (
            <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: html }} />
          ) : (
            <div className="text-sm text-gray-500">Nothing to preview yet.</div>
          )}
        </div>
      )}
      {error ? <div className="mt-1 text-xs text-red-600">{error}</div> : null}
    </div>
  );
}
