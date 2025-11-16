"use client";

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { MarkdownEditor } from './MarkdownEditor';

/**
 * Blog Post form schema
 * - Practical validation for required fields; optional fields are free-form.
 */
const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().optional(),
  excerpt: z.string().optional(),
  body: z.string().min(1, 'Body is required'),
  status: z.enum(['draft', 'published']).default('draft'),
});

export type PostFormValues = z.infer<typeof schema>;

export function PostForm({
  defaultValues,
  onSubmit,
  mode,
}: {
  defaultValues?: Partial<PostFormValues>;
  onSubmit: (formData: FormData) => Promise<void | { error?: string }>;
  mode: 'create' | 'edit';
}) {
  const { register, handleSubmit, setValue, watch, setError, getValues, formState: { errors, isSubmitting } } = useForm<PostFormValues>({
    defaultValues: {
      title: defaultValues?.title || '',
      slug: defaultValues?.slug || '',
      excerpt: defaultValues?.excerpt || '',
      body: defaultValues?.body || '',
      status: (defaultValues?.status as 'draft' | 'published') || 'draft',
    }
  });

  const body = watch('body');
  const title = watch('title');

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

  /** Basic excerpt from ~160 chars of the body with word boundary trimming */
  function summarize(fromBody: string, max = 160) {
    // Strip markdown syntax for cleaner excerpts
    const clean = (fromBody || '')
      .replace(/[#*_`>\-]+/g, ' ')  // Remove markdown formatting characters
      .replace(/\s+/g, ' ')          // Normalize whitespace
      .trim();
    if (clean.length <= max) return clean;
    const slice = clean.slice(0, max);
    const lastSpace = slice.lastIndexOf(' ');
    return (lastSpace > 80 ? slice.slice(0, lastSpace) : slice) + '…';
  }

  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const submit = async (values: PostFormValues) => {
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      parsed.error.issues.forEach((iss) => {
        const field = iss.path[0] as keyof PostFormValues;
        setError(field, { message: iss.message } as any);
      });
      return;
    }
    const fd = new FormData();
    Object.entries(values).forEach(([k, v]) => fd.append(k, String(v ?? '')));
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
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      {submitError ? (
        <div role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {submitError}
        </div>
      ) : null}

      {/* Title with helper */}
      <div>
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <div className="flex gap-2 text-xs">
            <button
              type="button"
              className="underline text-gray-700 hover:text-gray-900 disabled:opacity-40"
              disabled={!body || (!!title && title.length > 3)}
              title="Suggest a title from the body"
              onClick={() => {
                const t = suggestTitle(getValues('body'));
                if (t) setValue('title', t, { shouldValidate: true });
              }}
            >
              Suggest
            </button>
          </div>
        </div>
        <input {...register('title')} placeholder="Post title" className={`mt-1 w-full rounded-md border px-3 py-2 ${errors.title ? 'border-red-300' : ''}`} />
        {errors.title ? <div className="mt-1 text-xs text-red-600">{errors.title.message}</div> : null}
      </div>

      {/* Slug with helper */}
      <div>
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">Slug</label>
          <div className="flex gap-2 text-xs">
            <button
              type="button"
              className="underline text-gray-700 hover:text-gray-900"
              title="Generate a URL slug from title or body"
              onClick={() => {
                const t = getValues('title')?.trim() || suggestTitle(getValues('body'));
                if (t) setValue('slug', slugify(t), { shouldValidate: false });
              }}
            >
              Auto
            </button>
          </div>
        </div>
        <input {...register('slug')} placeholder="auto-generated from title if left blank" className="mt-1 w-full rounded-md border px-3 py-2" />
      </div>

      {/* Excerpt with helper */}
      <div>
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">Excerpt</label>
          <div className="flex gap-2 text-xs">
            <button
              type="button"
              className="underline text-gray-700 hover:text-gray-900"
              title="Create a short summary from the body"
              onClick={() => {
                const s = summarize(getValues('body'));
                if (s) setValue('excerpt', s);
              }}
            >
              Summarize
            </button>
          </div>
        </div>
        <textarea {...register('excerpt')} rows={3} placeholder="Optional short summary" className="mt-1 w-full rounded-md border px-3 py-2" />
      </div>

      {/* Markdown body */}
      <MarkdownEditor
        name="body"
        value={body}
        onChange={(v) => setValue('body', v, { shouldValidate: true })}
        error={errors.body?.message}
      />

      {/* Status */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-gray-700">Status</label>
        <select {...register('status')} className="rounded-md border px-3 py-2 bg-white text-gray-900">
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button type="submit" disabled={isSubmitting} className="rounded-md border px-4 py-2 bg-white text-gray-900 hover:bg-gray-50 disabled:opacity-50">
          {mode === 'create' ? 'Save' : 'Save changes'}
        </button>
        <a href="/dashboard/blog" className="rounded-md border px-4 py-2 bg-white text-gray-900 hover:bg-gray-50">Back</a>
      </div>
    </form>
  );
}
