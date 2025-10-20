// app/onboarding/bluepro/page.tsx
'use client';

import { useRef, useState } from 'react';

export default function BlueProOnboarding() {
  const [rows, setRows] = useState<number | null>(null);
  const [error, setError] = useState<string>('');
  const fileRef = useRef<HTMLInputElement | null>(null);

  async function handleFile(file: File) {
    setError('');
    try {
      const text = await file.text();
      const lines = text.split(/\r?\n/).filter(Boolean);
      setRows(lines.length);
    } catch (e: any) {
      setError(e?.message || 'Failed to parse CSV');
    }
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-bold">Switch from BluePro</h1>
      <p className="mt-2 text-gray-600">Import your customers and services. Start with a CSV export from BluePro.</p>

      <div className="mt-6 rounded-lg border p-4 bg-white">
        <div className="font-medium">Upload CSV</div>
        <input
          ref={fileRef}
          type="file"
          accept=".csv,text/csv"
          className="mt-3"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
        {rows !== null && (
          <p className="mt-3 text-sm text-gray-600">Parsed {rows} rows. Mapping and import coming next.</p>
        )}
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </div>

      <div className="mt-6 text-sm text-gray-600">
        <div className="font-medium">Checklist</div>
        <ol className="list-decimal ml-5 mt-2 space-y-1">
          <li>Branding & domain</li>
          <li>Publish landing page</li>
          <li>Lead form wired</li>
          <li>Tracking installed</li>
        </ol>
      </div>
    </div>
  );
}
