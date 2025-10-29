"use client";

import * as React from 'react';

export function ConfirmActionForm({
  action,
  inputs,
  label,
  message,
}: {
  action: (fd: FormData) => Promise<void>;
  inputs?: Record<string, string | number | null | undefined>;
  label: string;
  message: string;
}) {
  const formRef = React.useRef<HTMLFormElement | null>(null);
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (!confirm(message)) {
      e.preventDefault();
    }
  };

  return (
    <form action={action} onSubmit={onSubmit} ref={formRef}>
      {inputs && Object.entries(inputs).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={String(v ?? '')} />
      ))}
      <button type="submit" className="text-sm rounded-md border px-3 py-1.5 bg-white text-gray-900 hover:bg-gray-50">{label}</button>
    </form>
  );
}
