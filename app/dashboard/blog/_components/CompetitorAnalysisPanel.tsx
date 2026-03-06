"use client";

import * as React from 'react';
import { Card, CardBody } from '@/app/dashboard/_components/UI';
import { DEFAULT_AI_MODEL, loadAiWorkspaceConfig } from '@/app/dashboard/blog/_components/aiWorkspace';

type CompetitorItem = {
  name?: string;
  positioning?: string;
  seo_strength?: string;
  acquisition_channels?: string;
  content_angle?: string;
  gaps_to_exploit?: string;
};

type CompetitorAnalysisResult = {
  detected_market: string;
  competitors: CompetitorItem[];
  seo_playbook: string[];
  opportunities: string[];
  risks: string[];
  next_30_day_plan: string[];
};

export function CompetitorAnalysisPanel() {
  const [market, setMarket] = React.useState('');
  const [website, setWebsite] = React.useState('');
  const [competitors, setCompetitors] = React.useState('');
  const [status, setStatus] = React.useState<'idle' | 'loading' | 'error' | 'success'>('idle');
  const [error, setError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<CompetitorAnalysisResult | null>(null);

  React.useEffect(() => {
    const workspace = loadAiWorkspaceConfig();
    if (!workspace) return;
    if (workspace.market) setMarket(workspace.market);
    if (workspace.website) setWebsite(workspace.website);
  }, []);

  async function runAnalysis() {
    const workspace = loadAiWorkspaceConfig();
    if (!workspace?.apiKey?.trim()) {
      setStatus('error');
      setError('Save your AI API key in AI Workspace first.');
      return;
    }

    setStatus('loading');
    setError(null);
    setResult(null);

    const competitorsList = competitors
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean)
      .slice(0, 12);

    const res = await fetch('/api/ai/competitor-analysis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: workspace.provider,
        apiKey: workspace.apiKey.trim(),
        model: workspace.model?.trim() || DEFAULT_AI_MODEL,
        companyName: workspace.companyName || undefined,
        market: market.trim() || workspace.market || undefined,
        website: website.trim() || workspace.website || undefined,
        competitors: competitorsList,
      }),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.ok) {
      setStatus('error');
      setError(data?.error?.message || 'Unable to run competitor analysis.');
      return;
    }

    setResult(data.data as CompetitorAnalysisResult);
    setStatus('success');
  }

  return (
    <Card>
      <CardBody className="space-y-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Competitor SEO Analysis</h2>
          <p className="text-sm text-gray-600">
            Uses the same AI key from AI Workspace. Add your market or let the model infer it from your company and website.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-1 text-sm">
            <span className="font-medium text-gray-900">Market</span>
            <input
              value={market}
              onChange={(e) => setMarket(e.currentTarget.value)}
              placeholder="Home services AI automation"
              className="w-full rounded-lg border px-3 py-2"
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="font-medium text-gray-900">Website</span>
            <input
              value={website}
              onChange={(e) => setWebsite(e.currentTarget.value)}
              placeholder="https://www.ofroot.technology"
              className="w-full rounded-lg border px-3 py-2"
            />
          </label>
          <label className="space-y-1 text-sm md:col-span-2">
            <span className="font-medium text-gray-900">Competitors (optional)</span>
            <input
              value={competitors}
              onChange={(e) => setCompetitors(e.currentTarget.value)}
              placeholder="competitor1.com, competitor2.com"
              className="w-full rounded-lg border px-3 py-2"
            />
          </label>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={runAnalysis}
            disabled={status === 'loading'}
            className="rounded-md bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
          >
            {status === 'loading' ? 'Running analysis…' : 'Run competitor analysis'}
          </button>
          {status === 'error' && error ? <span className="text-sm text-red-600">{error}</span> : null}
        </div>

        {result ? (
          <div className="grid gap-4 lg:grid-cols-2">
            <section className="space-y-2 rounded-xl border p-3">
              <h3 className="text-sm font-semibold text-gray-900">Detected market</h3>
              <p className="text-sm text-gray-700">{result.detected_market}</p>
            </section>

            <section className="space-y-2 rounded-xl border p-3 lg:col-span-2">
              <h3 className="text-sm font-semibold text-gray-900">Competitors</h3>
              <div className="grid gap-3 md:grid-cols-2">
                {result.competitors.map((item, idx) => (
                  <article key={`${item.name || 'competitor'}-${idx}`} className="rounded-lg border bg-gray-50 p-3 text-sm text-gray-700">
                    <div className="font-semibold text-gray-900">{item.name || `Competitor ${idx + 1}`}</div>
                    {item.positioning ? <div><span className="font-medium">Positioning:</span> {item.positioning}</div> : null}
                    {item.seo_strength ? <div><span className="font-medium">SEO:</span> {item.seo_strength}</div> : null}
                    {item.acquisition_channels ? <div><span className="font-medium">Channels:</span> {item.acquisition_channels}</div> : null}
                    {item.content_angle ? <div><span className="font-medium">Content:</span> {item.content_angle}</div> : null}
                    {item.gaps_to_exploit ? <div><span className="font-medium">Gap:</span> {item.gaps_to_exploit}</div> : null}
                  </article>
                ))}
              </div>
            </section>

            <ListSection title="SEO playbook" items={result.seo_playbook} />
            <ListSection title="Opportunities" items={result.opportunities} />
            <ListSection title="Risks" items={result.risks} />
            <ListSection title="Next 30-day plan" items={result.next_30_day_plan} />
          </div>
        ) : null}
      </CardBody>
    </Card>
  );
}

function ListSection({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="space-y-2 rounded-xl border p-3">
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      {items?.length ? (
        <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700">
          {items.map((item, idx) => (
            <li key={`${title}-${idx}`}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-500">No items returned.</p>
      )}
    </section>
  );
}
