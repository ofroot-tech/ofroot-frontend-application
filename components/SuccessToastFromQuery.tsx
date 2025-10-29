"use client";

import * as React from 'react';

export function SuccessToastFromQuery({ param = 'saved', message = 'Saved successfully.' }: { param?: string; message?: string }) {
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    const val = url.searchParams.get(param);
    if (val) {
      window.dispatchEvent(new CustomEvent('toast', { detail: { title: message, type: 'success' } } as any));
      // Clean URL
      url.searchParams.delete(param);
      window.history.replaceState({}, '', url.toString());
    }
  }, [param, message]);
  return null;
}
