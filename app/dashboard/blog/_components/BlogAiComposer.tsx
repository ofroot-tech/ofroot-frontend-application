"use client";

import * as React from 'react';
import { useRouter } from 'next/navigation';
import type { BlogPostGenerationInput, BlogPostGenerationResult } from '@/app/lib/api';
import { ToolbarButton } from '@/app/dashboard/_components/UI';

export const BLOG_AI_DRAFT_STORAGE_KEY = 'ofroot_blog_ai_draft';

export type BlogAiComposerProps = {
  generateDraft: (input: BlogPostGenerationInput) => Promise<
    { ok: true; data: BlogPostGenerationResult } | { ok: false; error: string }
  >;
};

export function BlogAiComposer({ generateDraft }: BlogAiComposerProps) {
  const [open, setOpen] = React.useState(false);
  const [topic, setTopic] = React.useState('');
  const [tone, setTone] = React.useState('Friendly yet expert');
  const [keywords, setKeywords] = React.useState('');
  const [status, setStatus] = React.useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<BlogPostGenerationResult | null>(null);
  const [copyToast, setCopyToast] = React.useState<string | null>(null);
  const copyTimeoutRef = React.useRef<number | null>(null);
  const router = useRouter();

  const resetDialog = React.useCallback(() => {
    setStatus('idle');
    setError(null);
    setResult(null);
  }, []);

  const closeDialog = React.useCallback(() => {
    setOpen(false);
    resetDialog();
  }, [resetDialog]);

  const handleGenerate = React.useCallback(async () => {
    if (!topic.trim()) {
      setError('Please enter a topic.');
      return;
    }
    setStatus('loading');
    setError(null);
    setResult(null);
    const keywordsList = keywords
      .split(',')
      .map((word) => word.trim())
      .filter(Boolean)
      .slice(0, 10);
    try {
      const response = await generateDraft({
        topic,
        tone: tone.trim() || undefined,
        keywords: keywordsList,
      });

      if (response.ok) {
        setStatus('success');
        setResult(response.data);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('blog-ai-draft-ready', { detail: response.data }));
        }
      } else {
        setStatus('error');
        setError(response.error);
      }
    } catch (err: any) {
      setStatus('error');
      setError(err?.message || 'Something went wrong.');
    }
  }, [topic, tone, keywords, generateDraft]);

  const saveDraftToStorage = React.useCallback((data: BlogPostGenerationResult) => {
    if (typeof window === 'undefined') return;
    try {
      window.sessionStorage.setItem(BLOG_AI_DRAFT_STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      console.warn('Unable to cache AI draft', err);
    }
  }, []);

  const handleApply = React.useCallback(() => {
    if (!result) return;
    saveDraftToStorage(result);
    closeDialog();
    router.push('/dashboard/blog/new?from=ai');
  }, [result, saveDraftToStorage, closeDialog, router]);

  const copyToClipboard = React.useCallback(
    async (text: string, successMessage: string) => {
      if (!text) return;
      if (typeof navigator === 'undefined' || !navigator.clipboard) {
        setCopyToast('Clipboard unavailable');
        return;
      }
      try {
        await navigator.clipboard.writeText(text);
        setCopyToast(successMessage);
      } catch (err) {
        setCopyToast('Unable to copy');
      }
      if (copyTimeoutRef.current) window.clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = window.setTimeout(() => setCopyToast(null), 2500);
    },
    []
  );

  React.useEffect(() => () => {
    if (copyTimeoutRef.current) window.clearTimeout(copyTimeoutRef.current);
  }, []);

  const renderDialog = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <button type="button" className="absolute inset-0 bg-slate-900/50" aria-label="Close" onClick={closeDialog} />
      <div className="relative w-full max-w-4xl rounded-2xl border bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <div className="text-xs uppercase tracking-wide text-violet-600">AI Composer</div>
            <h2 className="text-lg font-semibold text-gray-900">Generate a draft post</h2>
            <p className="text-sm text-gray-500">Describe the topic and let the AI handle the rest. You can refine tone and keywords before running.</p>
          </div>
          <button type="button" className="text-2xl text-gray-400 hover:text-gray-800" onClick={closeDialog} aria-label="Close composer">
            ×
          </button>
        </div>

        <div className="grid gap-6 px-6 py-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-900">Topic*</label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.currentTarget.value)}
                rows={3}
                placeholder="e.g. 5 ways AI copilots speed up field service"
                className="mt-2 w-full rounded-xl border px-3 py-2 text-sm"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-gray-900">Tone</label>
                <input
                  value={tone}
                  onChange={(e) => setTone(e.currentTarget.value)}
                  placeholder="Confident, playful, etc."
                  className="mt-2 w-full rounded-xl border px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-900">Keywords</label>
                <input
                  value={keywords}
                  onChange={(e) => setKeywords(e.currentTarget.value)}
                  placeholder="comma separated"
                  className="mt-2 w-full rounded-xl border px-3 py-2 text-sm"
                />
                <p className="mt-1 text-xs text-gray-500">Include up to 10 keywords.</p>
              </div>
            </div>
            <div className="rounded-xl border border-dashed px-3 py-3 text-xs text-gray-600">
              Tip: include the target persona, offer, or CTA in the topic for a sharper result.
            </div>
          </div>

          <div className="flex flex-col rounded-2xl border bg-slate-50/60 shadow-inner">
            <div className="border-b px-4 py-3 text-sm font-semibold text-gray-800">Preview</div>
            <div className="flex-1 overflow-y-auto px-4 py-4 text-sm text-gray-700">
              {status === 'loading' ? (
                <div className="animate-pulse space-y-3">
                  <div className="h-3 rounded bg-slate-200" />
                  <div className="h-3 rounded bg-slate-200" />
                  <div className="h-3 rounded bg-slate-200" />
                  <div className="h-3 rounded bg-slate-200" />
                </div>
              ) : result ? (
                <div className="space-y-3">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-violet-600">Title</div>
                    <div className="text-base font-semibold text-gray-900">{result.title}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-violet-600">Excerpt</div>
                    <p>{result.excerpt}</p>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-violet-600">Meta description</div>
                    <p>{result.meta_description}</p>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-violet-600">Outline</div>
                    <p className="whitespace-pre-line text-[13px] text-gray-700">{result.body.slice(0, 1200)}{result.body.length > 1200 ? '…' : ''}</p>
                  </div>
                  {result.tags?.length ? (
                    <div className="flex flex-wrap gap-2 text-xs">
                      {result.tags.map((tag) => (
                        <span key={tag} className="rounded-full bg-violet-100 px-2 py-0.5 text-violet-700">#{tag}</span>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : status === 'error' ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
              ) : (
                <div className="text-sm text-gray-500">Your AI preview will appear here.</div>
              )}
            </div>
          </div>
        </div>

            {result ? (
              <div className="flex flex-wrap items-center gap-2 border-t px-4 py-3 text-xs text-gray-500">
                <button
                  type="button"
                  onClick={() => copyToClipboard(result.body, 'Markdown copied')}
                  className="rounded-full border px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-white"
                >
                  Copy markdown
                </button>
                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(
                      `Title: ${result.title}\nMeta: ${result.meta_description}\nTags: ${(result.tags || []).join(', ')}`,
                      'Meta copied'
                    )
                  }
                  className="rounded-full border px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-white"
                >
                  Copy meta snippet
                </button>
                {copyToast ? <span className="text-violet-700">{copyToast}</span> : null}
              </div>
            ) : null}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t px-6 py-4">
            <div className="text-sm text-gray-500">
              {status === 'loading'
                ? 'Composing with your configured AI provider…'
                : status === 'success'
                  ? 'Draft ready – double-check before publishing.'
                  : '1 credit per draft (mock mode is free).'}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleGenerate}
                disabled={status === 'loading'}
                className="rounded-md border px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50 disabled:opacity-50"
              >
                {result ? 'Regenerate' : 'Generate draft'}
              </button>
              <button
                onClick={handleApply}
                disabled={!result}
                className="rounded-md bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 disabled:opacity-40"
              >
                Apply to editor
              </button>
            </div>
          </div>
      </div>
    </div>
  );

  return (
    <>
      <ToolbarButton
        onClick={() => {
          resetDialog();
          setOpen(true);
        }}
      >
        Compose with AI
      </ToolbarButton>
      {open ? renderDialog() : null}
    </>
  );
}
