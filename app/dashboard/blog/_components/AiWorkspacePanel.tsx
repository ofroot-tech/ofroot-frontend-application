"use client";

import * as React from 'react';
import { Card, CardBody } from '@/app/dashboard/_components/UI';
import {
  DEFAULT_AI_MODEL,
  type AiWorkspaceConfig,
  loadAiWorkspaceConfig,
  saveAiWorkspaceConfig,
} from '@/app/dashboard/blog/_components/aiWorkspace';

type AiWorkspacePanelProps = {
  title?: string;
  description?: string;
};

export function AiWorkspacePanel({
  title = 'AI Workspace',
  description = 'Bring your own API key. This key is used for blog generation and competitor SEO analysis on this page.',
}: AiWorkspacePanelProps = {}) {
  const [config, setConfig] = React.useState<AiWorkspaceConfig>({
    provider: 'openai',
    apiKey: '',
    model: DEFAULT_AI_MODEL,
    companyName: '',
    market: '',
    website: '',
  });
  const [saved, setSaved] = React.useState<string | null>(null);

  React.useEffect(() => {
    const existing = loadAiWorkspaceConfig();
    if (existing) setConfig(existing);
  }, []);

  React.useEffect(() => {
    if (!saved) return;
    const id = window.setTimeout(() => setSaved(null), 2200);
    return () => window.clearTimeout(id);
  }, [saved]);

  function onSave() {
    saveAiWorkspaceConfig(config);
    setSaved('Saved');
  }

  return (
    <Card>
      <CardBody className="space-y-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-600">{description}</p>
          <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            <div className="font-semibold">How to get your OpenAI API key</div>
            <ol className="mt-2 list-decimal space-y-1 pl-5">
              <li>
                Sign in at{' '}
                <a className="underline" href="https://platform.openai.com" target="_blank" rel="noreferrer">
                  platform.openai.com
                </a>
                .
              </li>
              <li>
                Open{' '}
                <a className="underline" href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer">
                  API keys
                </a>{' '}
                and create a new secret key.
              </li>
              <li>Copy the key and paste it into the API key field below, then click Save AI settings.</li>
            </ol>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <label className="space-y-1 text-sm">
            <span className="font-medium text-gray-900">Provider</span>
            <select
              value={config.provider}
              onChange={(e) => setConfig((prev) => ({ ...prev, provider: e.currentTarget.value as 'openai' }))}
              className="w-full rounded-lg border px-3 py-2"
            >
              <option value="openai">OpenAI</option>
            </select>
          </label>

          <label className="space-y-1 text-sm md:col-span-2">
            <span className="font-medium text-gray-900">API key</span>
            <input
              type="password"
              value={config.apiKey}
              onChange={(e) => setConfig((prev) => ({ ...prev, apiKey: e.currentTarget.value }))}
              placeholder="sk-..."
              className="w-full rounded-lg border px-3 py-2"
            />
          </label>

          <label className="space-y-1 text-sm">
            <span className="font-medium text-gray-900">Model</span>
            <input
              value={config.model || ''}
              onChange={(e) => setConfig((prev) => ({ ...prev, model: e.currentTarget.value }))}
              placeholder={DEFAULT_AI_MODEL}
              className="w-full rounded-lg border px-3 py-2"
            />
          </label>

          <label className="space-y-1 text-sm">
            <span className="font-medium text-gray-900">Company</span>
            <input
              value={config.companyName || ''}
              onChange={(e) => setConfig((prev) => ({ ...prev, companyName: e.currentTarget.value }))}
              placeholder="OfRoot"
              className="w-full rounded-lg border px-3 py-2"
            />
          </label>

          <label className="space-y-1 text-sm">
            <span className="font-medium text-gray-900">Market (optional)</span>
            <input
              value={config.market || ''}
              onChange={(e) => setConfig((prev) => ({ ...prev, market: e.currentTarget.value }))}
              placeholder="AI automation for home services"
              className="w-full rounded-lg border px-3 py-2"
            />
          </label>

          <label className="space-y-1 text-sm md:col-span-2 xl:col-span-3">
            <span className="font-medium text-gray-900">Website (optional)</span>
            <input
              value={config.website || ''}
              onChange={(e) => setConfig((prev) => ({ ...prev, website: e.currentTarget.value }))}
              placeholder="https://www.ofroot.technology"
              className="w-full rounded-lg border px-3 py-2"
            />
          </label>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onSave}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-black"
          >
            Save AI settings
          </button>
          {saved ? <span className="text-sm text-emerald-700">{saved}</span> : null}
        </div>
      </CardBody>
    </Card>
  );
}
