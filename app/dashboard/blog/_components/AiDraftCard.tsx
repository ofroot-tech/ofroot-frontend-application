"use client";

import * as React from 'react';
import type { BlogPostGenerationResult } from '@/app/lib/api';

interface AiDraftPayload extends BlogPostGenerationResult {
  receivedAt: number;
}

export function AiDraftCard() {
  const [draft, setDraft] = React.useState<AiDraftPayload | null>(null);

  React.useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<BlogPostGenerationResult>).detail;
      if (!detail) return;
      setDraft({ ...detail, receivedAt: Date.now() });
    };
    window.addEventListener('blog-ai-draft-ready', handler as EventListener);
    return () => window.removeEventListener('blog-ai-draft-ready', handler as EventListener);
  }, []);

  React.useEffect(() => {
    if (!draft) return;
    const timeout = window.setTimeout(() => setDraft(null), 60000);
    return () => window.clearTimeout(timeout);
  }, [draft]);

  if (!draft) return null;

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-dashed border-violet-300 bg-gradient-to-br from-white via-violet-50 to-amber-50 shadow-sm">
      <div className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-violet-700">
        AI draft ready (not saved yet)
      </div>
      <div className="flex flex-1 flex-col gap-3 px-4 pb-4">
        <div className="space-y-1">
          <div className="text-xs text-gray-500">{draft.meta_title || 'Meta title pending'}</div>
          <h3 className="text-lg font-semibold text-gray-900">{draft.title}</h3>
          <p className="text-sm text-gray-600">{draft.excerpt || 'No excerpt provided.'}</p>
        </div>
        {draft.tags?.length ? (
          <div className="flex flex-wrap gap-2 text-xs text-gray-600">
            {draft.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-white/80 px-2 py-0.5 text-gray-700">
                #{tag}
              </span>
            ))}
          </div>
        ) : null}
        <div className="text-xs text-gray-500">
          Generated just now · Apply to editor to continue editing.
        </div>
        <div className="mt-auto flex items-center gap-2 pt-2">
          <a
            href="/dashboard/blog/new?from=ai"
            className="rounded-md bg-violet-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-violet-700"
          >
            Open in editor
          </a>
          <button
            type="button"
            onClick={() => setDraft(null)}
            className="rounded-md border px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
          >
            Dismiss
          </button>
        </div>
      </div>
    </article>
  );
}
