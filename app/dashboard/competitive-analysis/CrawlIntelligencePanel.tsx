"use client";

import * as React from 'react';
import { Card, CardBody } from '@/app/dashboard/_components/UI';
import {
  DEFAULT_AI_MODEL,
  loadAiWorkspaceConfig,
} from '@/app/dashboard/blog/_components/aiWorkspace';

type BenchmarkMetric = {
  metric: string;
  your_value: string;
  competitor_range: string;
  verdict: string;
  why_it_matters: string;
  confidence: string;
};

type CompetitorProfile = {
  name: string;
  modeled_crawl_pattern: string;
  content_velocity_signal: string;
  opportunity: string;
  risk: string;
};

type CrawlIntelligenceResult = {
  market_summary: string;
  executive_summary: string;
  benchmark_snapshot: BenchmarkMetric[];
  competitors: CompetitorProfile[];
  gap_alerts: string[];
  priority_actions: string[];
  roi_hooks: string[];
  data_transparency: string[];
};

const EMPTY_FORM = {
  market: '',
  website: '',
  competitors: '',
  priorityRecrawlDays: '',
  newPageDiscoveryHours: '',
  crawlWastePercent: '',
  priorityPageHits30d: '',
  notes: '',
};

export function CrawlIntelligencePanel() {
  const [form, setForm] = React.useState(EMPTY_FORM);
  const [status, setStatus] = React.useState<'idle' | 'loading' | 'error' | 'success'>('idle');
  const [error, setError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<CrawlIntelligenceResult | null>(null);

  React.useEffect(() => {
    const workspace = loadAiWorkspaceConfig();
    if (!workspace) return;
    setForm((prev) => ({
      ...prev,
      market: workspace.market || prev.market,
      website: workspace.website || prev.website,
    }));
  }, []);

  function updateField<Key extends keyof typeof EMPTY_FORM>(key: Key, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function runAnalysis() {
    const workspace = loadAiWorkspaceConfig();
    if (!workspace?.apiKey?.trim()) {
      setStatus('error');
      setError('Save your AI API key in AI Workspace before running the benchmark.');
      return;
    }

    setStatus('loading');
    setError(null);
    setResult(null);

    const competitors = form.competitors
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean)
      .slice(0, 10);

    const res = await fetch('/api/ai/crawl-intelligence', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: workspace.provider,
        apiKey: workspace.apiKey.trim(),
        model: workspace.model?.trim() || DEFAULT_AI_MODEL,
        companyName: workspace.companyName || undefined,
        market: form.market.trim() || workspace.market || undefined,
        website: form.website.trim() || workspace.website || undefined,
        competitors,
        firstParty: {
          priorityRecrawlDays: form.priorityRecrawlDays.trim() || undefined,
          newPageDiscoveryHours: form.newPageDiscoveryHours.trim() || undefined,
          crawlWastePercent: form.crawlWastePercent.trim() || undefined,
          priorityPageHits30d: form.priorityPageHits30d.trim() || undefined,
          notes: form.notes.trim() || undefined,
        },
      }),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.ok) {
      setStatus('error');
      setError(data?.error?.message || 'Unable to run crawl intelligence.');
      return;
    }

    setResult(data.data as CrawlIntelligenceResult);
    setStatus('success');
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-amber-200 bg-[linear-gradient(135deg,rgba(255,247,237,0.95),rgba(255,255,255,1)_55%,rgba(255,251,235,0.95))]">
        <CardBody className="space-y-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl space-y-2">
              <span className="inline-flex w-fit items-center rounded-full border border-amber-300 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-800">
                Crawl Intelligence: Benchmarked
              </span>
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-gray-950">Benchmark your real crawl data against modeled competitor patterns</h2>
                <p className="mt-1 text-sm text-gray-700">
                  Your metrics are treated as ground truth. Competitor behavior is directional modeling so the output stays useful without pretending certainty.
                </p>
              </div>
            </div>
            <div className="grid gap-2 text-sm text-gray-700 sm:grid-cols-3 lg:max-w-md">
              <InsightPill label="Layer 1" value="Your crawl reality" />
              <InsightPill label="Layer 2" value="Competitor model" />
              <InsightPill label="Layer 3" value="Gap detection" />
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <label className="space-y-1 text-sm xl:col-span-2">
              <span className="font-medium text-gray-900">Market</span>
              <input
                value={form.market}
                onChange={(e) => updateField('market', e.currentTarget.value)}
                placeholder="Home services SEO and lead generation"
                className="w-full rounded-lg border bg-white px-3 py-2"
              />
            </label>
            <label className="space-y-1 text-sm xl:col-span-2">
              <span className="font-medium text-gray-900">Website</span>
              <input
                value={form.website}
                onChange={(e) => updateField('website', e.currentTarget.value)}
                placeholder="https://www.example.com"
                className="w-full rounded-lg border bg-white px-3 py-2"
              />
            </label>
            <label className="space-y-1 text-sm xl:col-span-4">
              <span className="font-medium text-gray-900">Competitors</span>
              <input
                value={form.competitors}
                onChange={(e) => updateField('competitors', e.currentTarget.value)}
                placeholder="competitor1.com, competitor2.com, competitor3.com"
                className="w-full rounded-lg border bg-white px-3 py-2"
              />
            </label>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white/90 p-4">
            <div className="mb-3">
              <h3 className="text-sm font-semibold text-gray-900">First-party log inputs</h3>
              <p className="text-sm text-gray-600">Add what you know from logs today. Even partial inputs give the model a stronger grounding than pure market guessing.</p>
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <label className="space-y-1 text-sm">
                <span className="font-medium text-gray-900">Priority page recrawl cadence</span>
                <input
                  value={form.priorityRecrawlDays}
                  onChange={(e) => updateField('priorityRecrawlDays', e.currentTarget.value)}
                  placeholder="9"
                  inputMode="decimal"
                  className="w-full rounded-lg border px-3 py-2"
                />
                <span className="text-xs text-gray-500">Average days between crawls for money pages</span>
              </label>
              <label className="space-y-1 text-sm">
                <span className="font-medium text-gray-900">New page discovery speed</span>
                <input
                  value={form.newPageDiscoveryHours}
                  onChange={(e) => updateField('newPageDiscoveryHours', e.currentTarget.value)}
                  placeholder="36"
                  inputMode="decimal"
                  className="w-full rounded-lg border px-3 py-2"
                />
                <span className="text-xs text-gray-500">Hours to first crawl for newly published pages</span>
              </label>
              <label className="space-y-1 text-sm">
                <span className="font-medium text-gray-900">Crawl waste</span>
                <input
                  value={form.crawlWastePercent}
                  onChange={(e) => updateField('crawlWastePercent', e.currentTarget.value)}
                  placeholder="22"
                  inputMode="decimal"
                  className="w-full rounded-lg border px-3 py-2"
                />
                <span className="text-xs text-gray-500">Percent of bot hits spent on low-value pages</span>
              </label>
              <label className="space-y-1 text-sm">
                <span className="font-medium text-gray-900">Priority page crawls in 30 days</span>
                <input
                  value={form.priorityPageHits30d}
                  onChange={(e) => updateField('priorityPageHits30d', e.currentTarget.value)}
                  placeholder="84"
                  inputMode="numeric"
                  className="w-full rounded-lg border px-3 py-2"
                />
                <span className="text-xs text-gray-500">Useful when you track a known set of strategic URLs</span>
              </label>
              <label className="space-y-1 text-sm md:col-span-2 xl:col-span-4">
                <span className="font-medium text-gray-900">Log observations</span>
                <textarea
                  value={form.notes}
                  onChange={(e) => updateField('notes', e.currentTarget.value)}
                  placeholder="Example: Googlebot keeps revisiting filtered URLs, blog updates take 5-7 days to be recrawled, product pages with fresh internal links get picked up faster."
                  rows={4}
                  className="w-full rounded-lg border px-3 py-2"
                />
              </label>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={runAnalysis}
              disabled={status === 'loading'}
              className="inline-flex items-center justify-center rounded-md bg-gray-950 px-4 py-2 text-sm font-semibold text-white hover:bg-black disabled:opacity-50"
            >
              {status === 'loading' ? 'Running benchmark...' : 'Run crawl benchmark'}
            </button>
            <p className="text-sm text-gray-600">Best results come from at least one real metric plus 2-3 competitor domains.</p>
          </div>

          {status === 'error' && error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
          ) : null}
        </CardBody>
      </Card>

      {result ? (
        <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <CardBody className="space-y-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">Executive read</div>
                <h3 className="mt-1 text-lg font-semibold text-gray-950">{result.market_summary}</h3>
                <p className="mt-2 text-sm leading-6 text-gray-700">{result.executive_summary || 'No executive summary returned.'}</p>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {result.benchmark_snapshot.length ? (
                  result.benchmark_snapshot.map((item, index) => (
                    <article key={`${item.metric}-${index}`} className="rounded-2xl border bg-gray-50 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="text-sm font-semibold text-gray-950">{item.metric}</div>
                        <span className="rounded-full bg-white px-2 py-1 text-[11px] font-medium uppercase tracking-wide text-gray-600">
                          {item.confidence}
                        </span>
                      </div>
                      <div className="mt-3 space-y-2 text-sm text-gray-700">
                        <div><span className="font-medium text-gray-900">You:</span> {item.your_value || '—'}</div>
                        <div><span className="font-medium text-gray-900">Modeled range:</span> {item.competitor_range || '—'}</div>
                        <div><span className="font-medium text-gray-900">Verdict:</span> {item.verdict || '—'}</div>
                        <div className="text-gray-600">{item.why_it_matters || '—'}</div>
                      </div>
                    </article>
                  ))
                ) : (
                  <EmptyState message="No benchmark snapshot returned." />
                )}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="space-y-4">
              <ListSection title="Gap alerts" items={result.gap_alerts} emptyLabel="No gap alerts returned." />
              <ListSection title="Priority actions" items={result.priority_actions} emptyLabel="No priority actions returned." />
              <ListSection title="ROI hooks" items={result.roi_hooks} emptyLabel="No ROI hooks returned." />
            </CardBody>
          </Card>

          <Card className="xl:col-span-2">
            <CardBody className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-950">Modeled competitor patterns</h3>
                  <p className="text-sm text-gray-600">These are directional estimates anchored by your first-party crawl inputs and market context.</p>
                </div>
              </div>
              <div className="grid gap-3 lg:grid-cols-2">
                {result.competitors.length ? (
                  result.competitors.map((item, index) => (
                    <article key={`${item.name}-${index}`} className="rounded-2xl border bg-white p-4 shadow-sm">
                      <div className="text-base font-semibold text-gray-950">{item.name || `Competitor ${index + 1}`}</div>
                      <div className="mt-3 space-y-2 text-sm text-gray-700">
                        <div><span className="font-medium text-gray-900">Modeled crawl pattern:</span> {item.modeled_crawl_pattern || '—'}</div>
                        <div><span className="font-medium text-gray-900">Content velocity:</span> {item.content_velocity_signal || '—'}</div>
                        <div><span className="font-medium text-gray-900">Opportunity:</span> {item.opportunity || '—'}</div>
                        <div><span className="font-medium text-gray-900">Risk:</span> {item.risk || '—'}</div>
                      </div>
                    </article>
                  ))
                ) : (
                  <EmptyState message="No competitor profiles returned." />
                )}
              </div>
            </CardBody>
          </Card>

          <Card className="xl:col-span-2">
            <CardBody className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-500">Transparency</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                {result.data_transparency.length ? (
                  result.data_transparency.map((item, index) => (
                    <li key={`transparency-${index}`} className="rounded-xl border bg-gray-50 px-3 py-2">
                      {item}
                    </li>
                  ))
                ) : (
                  <li className="rounded-xl border bg-gray-50 px-3 py-2">Your data is first-party. Competitor benchmarks are modeled estimates.</li>
                )}
              </ul>
            </CardBody>
          </Card>
        </div>
      ) : null}
    </div>
  );
}

function InsightPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/80 bg-white/85 px-3 py-2 shadow-sm">
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">{label}</div>
      <div className="mt-1 text-sm font-medium text-gray-900">{value}</div>
    </div>
  );
}

function ListSection({
  title,
  items,
  emptyLabel,
}: {
  title: string;
  items: string[];
  emptyLabel: string;
}) {
  return (
    <section className="space-y-2">
      <h3 className="text-sm font-semibold text-gray-950">{title}</h3>
      {items.length ? (
        <ul className="space-y-2">
          {items.map((item, index) => (
            <li key={`${title}-${index}`} className="rounded-xl border bg-gray-50 px-3 py-2 text-sm text-gray-700">
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-500">{emptyLabel}</p>
      )}
    </section>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed px-4 py-6 text-center text-sm text-gray-500">
      {message}
    </div>
  );
}
