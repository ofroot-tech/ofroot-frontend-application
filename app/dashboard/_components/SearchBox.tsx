"use client";

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

/**
 * SearchBox — small search input that syncs with the `q` query param and
 * triggers navigation on submit/change. Debounces input by 300ms.
 */
export function SearchBox({ placeholder = 'Search…', className = '' }: { placeholder?: string; className?: string }) {
  const router = useRouter();
  const sp = useSearchParams();
  const [value, setValue] = React.useState(sp?.get('q') || '');

  // Keep value in sync when the URL changes (e.g., via back/forward)
  React.useEffect(() => {
    const next = sp?.get('q') || '';
    setValue(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sp?.toString()]);

  // Debounced push
  React.useEffect(() => {
    const id = setTimeout(() => {
      const qs = new URLSearchParams(sp?.toString() || '');
      if (value) qs.set('q', value);
      else qs.delete('q');
      // Reset to page 1 on new search
      qs.delete('page');
      const s = qs.toString();
      router.push(s ? `?${s}` : '?');
    }, 300);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <input
      type="search"
      value={value}
      onChange={(e) => setValue(e.currentTarget.value)}
      placeholder={placeholder}
      className={`text-sm rounded-md border px-3 py-1.5 bg-white text-gray-900 w-56 ${className}`}
      aria-label="Search"
    />
  );
}
