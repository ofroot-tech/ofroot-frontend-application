"use client";

import * as React from 'react';

export function ConfirmDeleteForm({ action, id }: { action: (fd: FormData) => Promise<void>; id: number }) {
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (!confirm('Delete this post? This action cannot be undone.')) {
      e.preventDefault();
    }
  };
  return (
    <form action={action} onSubmit={onSubmit}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="text-sm rounded-md border px-3 py-1.5 bg-white text-red-600 hover:bg-red-50"
        title="Delete post"
      >
        Delete
      </button>
    </form>
  );
}
