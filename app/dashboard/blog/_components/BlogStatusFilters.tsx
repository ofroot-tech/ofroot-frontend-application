"use client";

import { useRouter, useSearchParams } from 'next/navigation';

const FILTERS: Array<{ label: string; value: '' | 'draft' | 'published' }> = [
  { label: 'All', value: '' },
  { label: 'Drafts', value: 'draft' },
  { label: 'Published', value: 'published' },
];

export function BlogStatusFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const active = (searchParams?.get('status') as 'draft' | 'published' | null) ?? '';

  const setStatus = (value: '' | 'draft' | 'published') => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    if (!value) params.delete('status');
    else params.set('status', value);
    const qs = params.toString();
    router.replace(qs ? `?${qs}` : '?');
  };

  return (
    <div className="inline-flex items-center rounded-full border bg-white p-1 text-xs shadow-sm">
      {FILTERS.map((filter) => {
        const selected = active === filter.value;
        return (
          <button
            key={filter.value || 'all'}
            type="button"
            onClick={() => setStatus(filter.value)}
            className={`rounded-full px-3 py-1 font-medium transition ${
              selected ? 'bg-violet-600 text-white shadow' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}
