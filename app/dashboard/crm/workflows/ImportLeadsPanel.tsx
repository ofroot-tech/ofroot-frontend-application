'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardBody, CardHeader } from '@/app/dashboard/_components/UI';

type SourceType = 'csv_upload' | 'hubspot' | 'facebook' | 'other';

type ImportResult = {
  source: SourceType;
  totalRows: number;
  imported: number;
  failed: number;
  errors: Array<{ row: number; reason: string }>;
};

export default function ImportLeadsPanel() {
  const router = useRouter();
  const [source, setSource] = useState<SourceType>('csv_upload');
  const [defaultService, setDefaultService] = useState('crm-import');
  const [defaultZip, setDefaultZip] = useState('00000');
  const [defaultPhone, setDefaultPhone] = useState('0000000000');
  const [csvText, setCsvText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.set('source', source);
      formData.set('defaultService', defaultService);
      formData.set('defaultZip', defaultZip);
      formData.set('defaultPhone', defaultPhone);
      if (csvText.trim()) formData.set('csvText', csvText);
      if (file) formData.set('file', file);

      const res = await fetch('/api/admin/leads/import', {
        method: 'POST',
        body: formData,
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.ok) {
        setError(json?.error?.message || 'Import failed.');
        return;
      }
      setResult(json.data as ImportResult);
      router.refresh();
    } catch (err: any) {
      setError(err?.message || 'Unexpected error while importing.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div>
          <h2 className="text-sm font-semibold">Lead Import Workflow</h2>
          <p className="text-xs text-gray-600 mt-1">
            Import clients from CSV uploads, HubSpot exports, Facebook exports, or other systems.
          </p>
        </div>
      </CardHeader>
      <CardBody>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="text-sm">
              <span className="block text-xs text-gray-600 mb-1">Source type</span>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value as SourceType)}
                className="w-full border rounded px-2 py-2"
              >
                <option value="csv_upload">CSV upload</option>
                <option value="hubspot">HubSpot</option>
                <option value="facebook">Facebook</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label className="text-sm">
              <span className="block text-xs text-gray-600 mb-1">CSV file</span>
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full border rounded px-2 py-2"
              />
            </label>
          </div>

          <label className="text-sm block">
            <span className="block text-xs text-gray-600 mb-1">Paste CSV (optional alternative to file)</span>
            <textarea
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              rows={6}
              placeholder="name,email,phone,service,zip,company"
              className="w-full border rounded px-2 py-2 font-mono text-xs"
            />
          </label>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="text-sm">
              <span className="block text-xs text-gray-600 mb-1">Default service</span>
              <input
                value={defaultService}
                onChange={(e) => setDefaultService(e.target.value)}
                className="w-full border rounded px-2 py-2"
              />
            </label>
            <label className="text-sm">
              <span className="block text-xs text-gray-600 mb-1">Default ZIP</span>
              <input
                value={defaultZip}
                onChange={(e) => setDefaultZip(e.target.value)}
                className="w-full border rounded px-2 py-2"
              />
            </label>
            <label className="text-sm">
              <span className="block text-xs text-gray-600 mb-1">Default phone</span>
              <input
                value={defaultPhone}
                onChange={(e) => setDefaultPhone(e.target.value)}
                className="w-full border rounded px-2 py-2"
              />
            </label>
          </div>

          {error ? (
            <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center rounded-md border px-3 py-2 text-sm bg-white hover:bg-gray-50 disabled:opacity-60"
          >
            {loading ? 'Importing...' : 'Run import'}
          </button>
        </form>

        {result ? (
          <div className="mt-6 space-y-3">
            <div className="rounded border bg-gray-50 p-3 text-sm">
              <div><span className="font-medium">Source:</span> {result.source}</div>
              <div><span className="font-medium">Rows:</span> {result.totalRows}</div>
              <div><span className="font-medium">Imported:</span> {result.imported}</div>
              <div><span className="font-medium">Failed:</span> {result.failed}</div>
            </div>
            {result.errors.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs">
                  <thead className="bg-gray-50 text-left">
                    <tr>
                      <th className="px-2 py-1">Row</th>
                      <th className="px-2 py-1">Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.errors.map((item) => (
                      <tr key={`${item.row}-${item.reason}`} className="border-t">
                        <td className="px-2 py-1">{item.row}</td>
                        <td className="px-2 py-1">{item.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </div>
        ) : null}
      </CardBody>
    </Card>
  );
}
