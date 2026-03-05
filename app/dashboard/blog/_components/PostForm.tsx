"use client";

import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { MarkdownEditor } from './MarkdownEditor';
import { TagInput } from './TagInput';
import type { BlogPostGenerationResult } from '@/app/lib/api';
import { BLOG_AI_DRAFT_STORAGE_KEY } from './BlogAiComposer';

/**
 * Blog Post form schema
 * - Adds SEO/meta fields and tag collection for AI + manual workflows.
 */
const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().optional(),
  excerpt: z.string().optional(),
  body: z.string().min(1, 'Body is required'),
  status: z.enum(['draft', 'published']).default('draft'),
  meta_title: z.union([z.string().max(255, 'Meta title must be 255 characters or fewer'), z.literal('')]).optional(),
  meta_description: z.union([z.string().max(500, 'Meta description must be 500 characters or fewer'), z.literal('')]).optional(),
  featured_image_url: z.union([z.string().url('Enter a valid URL').max(2048, 'URL is too long'), z.literal('')]).optional(),
  tags: z.array(z.string().min(1).max(40)).max(12, 'You can add up to 12 tags').optional().default([]),
});

export type PostFormValues = z.infer<typeof schema>;

export function PostForm({
  defaultValues,
  onSubmit,
  mode,
}: {
  defaultValues?: Partial<PostFormValues> & { tags?: string[] };
  onSubmit: (formData: FormData) => Promise<void | { error?: string }>;
  mode: 'create' | 'edit';
}) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    getValues,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PostFormValues>({
    defaultValues: {
      title: defaultValues?.title || '',
      slug: defaultValues?.slug || '',
      excerpt: defaultValues?.excerpt || '',
      body: defaultValues?.body || '',
      status: (defaultValues?.status as 'draft' | 'published') || 'draft',
      meta_title: defaultValues?.meta_title || '',
      meta_description: defaultValues?.meta_description || '',
      featured_image_url: defaultValues?.featured_image_url || '',
      tags: defaultValues?.tags || [],
    },
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const body = watch('body');
   
  const title = watch('title');
   
  const tags = watch('tags') || [];

  /** Deterministic, URL-friendly slug generator */
  function slugify(input: string) {
    return input
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  /** Suggest a human-friendly title from the first sentence/words of the body */
  function suggestTitle(fromBody: string): string {
    const text = (fromBody || '').replace(/[#*_`>\-]+/g, ' ').replace(/\s+/g, ' ').trim();
    if (!text) return '';
    const sentenceEnd = text.search(/[\.\?!]/);
    const base = sentenceEnd > 0 ? text.slice(0, sentenceEnd) : text;
    const words = base.split(' ').slice(0, 12).join(' ');
    return words.charAt(0).toUpperCase() + words.slice(1);
  }

  /** Basic excerpt from ~180 chars of the body with word boundary trimming */
  function summarize(fromBody: string, max = 180) {
    const clean = (fromBody || '').replace(/\s+/g, ' ').trim();
    if (clean.length <= max) return clean;
    const slice = clean.slice(0, max);
    const lastSpace = slice.lastIndexOf(' ');
    return (lastSpace > 80 ? slice.slice(0, lastSpace) : slice) + '…';
  }

  function ensureMetaTitle() {
    const existing = getValues('meta_title')?.trim();
    if (existing) return;
    const candidate = getValues('title').trim();
    if (candidate) {
      setValue('meta_title', candidate.slice(0, 255));
    }
  }

  function ensureMetaDescription() {
    const existing = getValues('meta_description')?.trim();
    if (existing) return;
    const candidate = summarize(getValues('excerpt') || getValues('body'), 150);
    if (candidate) {
      setValue('meta_description', candidate.slice(0, 500));
    }
  }

  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [aiPrefillNotice, setAiPrefillNotice] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const cached = window.sessionStorage.getItem(BLOG_AI_DRAFT_STORAGE_KEY);
    if (!cached) return;
    window.sessionStorage.removeItem(BLOG_AI_DRAFT_STORAGE_KEY);
    try {
      const payload = JSON.parse(cached) as BlogPostGenerationResult;
      const current = getValues();
      reset({
        ...current,
        title: payload.title || current.title || '',
        slug: payload.slug || current.slug || '',
        excerpt: payload.excerpt || current.excerpt || '',
        body: payload.body || current.body || '',
        meta_title: payload.meta_title || payload.title || current.meta_title || '',
        meta_description: payload.meta_description || payload.excerpt || current.meta_description || '',
        featured_image_url: payload.featured_image_url || current.featured_image_url || '',
        tags: payload.tags?.length ? payload.tags : current.tags || [],
      });
      setAiPrefillNotice(true);
      const timeout = setTimeout(() => setAiPrefillNotice(false), 6000);
      return () => clearTimeout(timeout);
    } catch (err) {
      console.warn('Unable to read AI draft payload', err);
    }
  }, [getValues, reset]);

  const submit = async (values: PostFormValues) => {
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      parsed.error.issues.forEach((iss) => {
        const field = iss.path[0] as keyof PostFormValues;
        setError(field, { message: iss.message } as any);
      });
      return;
    }

    const normalized = {
      ...parsed.data,
      meta_title: (parsed.data.meta_title ?? '').trim(),
      meta_description: (parsed.data.meta_description ?? '').trim(),
      featured_image_url: (parsed.data.featured_image_url ?? '').trim(),
      tags: (parsed.data.tags || []).map((tag) => tag.trim()).filter(Boolean),
    } satisfies PostFormValues;

    const fd = new FormData();
    fd.append('__post_form_mode', mode);
    fd.append('title', normalized.title);
    fd.append('slug', normalized.slug ?? '');
    fd.append('excerpt', normalized.excerpt ?? '');
    fd.append('body', normalized.body);
    fd.append('status', normalized.status);
    fd.append('meta_title', normalized.meta_title);
    fd.append('meta_description', normalized.meta_description);
    fd.append('featured_image_url', normalized.featured_image_url);
    fd.append('__tags_present', '1');
    normalized.tags?.forEach((tag) => fd.append('tags[]', tag));

    try {
      const result = await onSubmit(fd);
      if (result && typeof result === 'object' && 'error' in result && (result as any).error) {
        setSubmitError((result as any).error as string);
        return;
      }
      setSubmitError(null);
    } catch (err: any) {
      setSubmitError(err?.message || 'Something went wrong while saving.');
    }
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-6">
      {submitError ? (
        <div role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {submitError}
        </div>
      ) : null}
      {aiPrefillNotice ? (
        <div className="rounded-md border border-violet-200 bg-violet-50 px-3 py-2 text-sm text-violet-900">
          AI draft applied. Feel free to edit before saving.
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <div className="space-y-4">
          {/* Title */}
          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <button
                type="button"
                className="text-xs underline text-gray-700 hover:text-gray-900 disabled:opacity-40"
                disabled={!body || (!!title && title.length > 3)}
                onClick={() => {
                  const t = suggestTitle(getValues('body'));
                  if (t) setValue('title', t, { shouldValidate: true });
                }}
              >
                Suggest
              </button>
            </div>
            <input
              {...register('title')}
              placeholder="Post title"
              className={`mt-1 w-full rounded-md border px-3 py-2 ${errors.title ? 'border-red-300' : ''}`}
            />
            {errors.title ? <div className="mt-1 text-xs text-red-600">{errors.title.message}</div> : null}
          </div>

          {/* Slug + Excerpt grid */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">Slug</label>
                <button
                  type="button"
                  className="text-xs underline text-gray-700 hover:text-gray-900"
                  onClick={() => {
                    const t = getValues('title')?.trim() || suggestTitle(getValues('body'));
                    if (t) setValue('slug', slugify(t), { shouldValidate: false });
                  }}
                >
                  Auto
                </button>
              </div>
              <input
                {...register('slug')}
                placeholder="auto-generated from title if left blank"
                className="mt-1 w-full rounded-md border px-3 py-2"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">Excerpt</label>
                <button
                  type="button"
                  className="text-xs underline text-gray-700 hover:text-gray-900"
                  onClick={() => {
                    const s = summarize(getValues('body'));
                    if (s) setValue('excerpt', s);
                  }}
                >
                  Summarize
                </button>
              </div>
              <textarea
                {...register('excerpt')}
                rows={2}
                placeholder="Optional short summary"
                className="mt-1 w-full rounded-md border px-3 py-2"
              />
            </div>
          </div>

          {/* Markdown body */}
          <MarkdownEditor
            name="body"
            value={body}
            onChange={(v) => setValue('body', v, { shouldValidate: true })}
            error={errors.body?.message}
          />

          {/* Status */}
          <div className="flex flex-wrap items-center gap-3 rounded-md border px-3 py-3 bg-gray-50">
            <div>
              <div className="text-sm font-medium text-gray-700">Status</div>
              <div className="text-xs text-gray-500">Drafts stay private; publish to go live immediately.</div>
            </div>
            <select {...register('status')} className="rounded-md border px-3 py-2 bg-white text-gray-900">
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          {/* SEO Panel */}
          <div className="rounded-lg border p-4 bg-white shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-800">SEO metadata</span>
              <button type="button" className="text-xs text-violet-700 hover:text-violet-900" onClick={() => {
                ensureMetaTitle();
                ensureMetaDescription();
              }}>
                Auto-fill
              </button>
            </div>
            <div className="mt-3 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600">Meta title</label>
                <input
                  {...register('meta_title')}
                  maxLength={255}
                  placeholder="Used for SERP headline"
                  className={`mt-1 w-full rounded-md border px-3 py-2 ${errors.meta_title ? 'border-red-300' : ''}`}
                />
                <div className="mt-1 flex justify-between text-[11px] text-gray-500">
                  <span>{(watch('meta_title') || '').length}/255</span>
                  {errors.meta_title ? <span className="text-red-600">{errors.meta_title.message}</span> : null}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600">Meta description</label>
                <textarea
                  {...register('meta_description')}
                  rows={3}
                  maxLength={500}
                  placeholder="Short description for SEO and social cards"
                  className={`mt-1 w-full rounded-md border px-3 py-2 ${errors.meta_description ? 'border-red-300' : ''}`}
                />
                <div className="mt-1 flex justify-between text-[11px] text-gray-500">
                  <span>{(watch('meta_description') || '').length}/500</span>
                  {errors.meta_description ? <span className="text-red-600">{errors.meta_description.message}</span> : null}
                </div>
              </div>
              <Controller
                name="tags"
                control={control}
                render={({ field }) => (
                  <TagInput value={field.value || []} onChange={(next) => field.onChange(next)} label="Tags" />
                )}
              />
              {errors.tags ? <div className="text-xs text-red-600">{errors.tags.message as string}</div> : null}
            </div>
          </div>

          {/* Media panel */}
          <div className="rounded-lg border p-4 bg-white shadow-sm space-y-3">
            <div className="text-sm font-semibold text-gray-800">Featured image</div>
            <input
              {...register('featured_image_url')}
              placeholder="https://..."
              className={`w-full rounded-md border px-3 py-2 ${errors.featured_image_url ? 'border-red-300' : ''}`}
            />
            {errors.featured_image_url ? (
              <div className="text-xs text-red-600">{errors.featured_image_url.message}</div>
            ) : (
              <div className="text-xs text-gray-500">Optional hero image URL for landing + OG tags.</div>
            )}
            {watch('featured_image_url') ? (
              <div className="rounded-md border bg-gray-50 p-2 text-center text-xs text-gray-500">
                Preview: <a href={watch('featured_image_url') || '#'} className="text-violet-700 underline" target="_blank" rel="noreferrer">open image</a>
              </div>
            ) : null}
          </div>

          {/* Tag helper note */}
          <div className="rounded-lg border border-dashed p-3 text-xs text-gray-600">
            Pro tip: tags power the upcoming AI composer. Keep them short (e.g. “ai”, “ops”, “launch”).
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2">
        <button type="submit" disabled={isSubmitting} className="rounded-md border px-4 py-2 bg-white text-gray-900 hover:bg-gray-50 disabled:opacity-50">
          {mode === 'create' ? 'Save' : 'Save changes'}
        </button>
        <a href="/dashboard/blog" className="rounded-md border px-4 py-2 bg-white text-gray-900 hover:bg-gray-50">Back</a>
        <span className="text-xs text-gray-500">Autosave & AI-assisted editing coming soon.</span>
      </div>
    </form>
  );
}
