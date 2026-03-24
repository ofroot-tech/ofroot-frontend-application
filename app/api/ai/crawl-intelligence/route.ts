"use server";

import { NextRequest } from 'next/server';
import { getAuthTokenFromRequest } from '@/app/lib/cookies';
import { fail, ok } from '@/app/lib/response';

type CrawlMetricsInput = {
  priorityRecrawlDays?: number | string;
  newPageDiscoveryHours?: number | string;
  crawlWastePercent?: number | string;
  priorityPageHits30d?: number | string;
  notes?: string;
};

type CrawlIntelligenceRequest = {
  provider?: 'openai';
  apiKey?: string;
  model?: string;
  companyName?: string;
  market?: string;
  website?: string;
  competitors?: string[];
  firstParty?: CrawlMetricsInput;
};

function toOptionalNumber(value: number | string | undefined): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value !== 'string') return null;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function POST(req: NextRequest) {
  const token = await getAuthTokenFromRequest(req);
  if (!token) return fail('Please sign in again.', 401);

  const body = (await req.json().catch(() => ({}))) as CrawlIntelligenceRequest;
  const apiKey = (body.apiKey || '').trim();
  const provider = body.provider || 'openai';
  const model = (body.model || 'gpt-4.1-mini').trim();
  const companyName = (body.companyName || 'Our company').trim();
  const market = (body.market || '').trim();
  const website = (body.website || '').trim();
  const competitors = (Array.isArray(body.competitors) ? body.competitors : [])
    .map((item) => String(item).trim())
    .filter(Boolean)
    .slice(0, 10);

  const firstParty = {
    priorityRecrawlDays: toOptionalNumber(body.firstParty?.priorityRecrawlDays),
    newPageDiscoveryHours: toOptionalNumber(body.firstParty?.newPageDiscoveryHours),
    crawlWastePercent: toOptionalNumber(body.firstParty?.crawlWastePercent),
    priorityPageHits30d: toOptionalNumber(body.firstParty?.priorityPageHits30d),
    notes: String(body.firstParty?.notes || '').trim(),
  };

  if (!apiKey) return fail('API key is required.', 422);
  if (provider !== 'openai') return fail('Only OpenAI provider is supported right now.', 422);

  if (
    firstParty.priorityRecrawlDays == null &&
    firstParty.newPageDiscoveryHours == null &&
    firstParty.crawlWastePercent == null &&
    firstParty.priorityPageHits30d == null &&
    !firstParty.notes
  ) {
    return fail('Add at least one first-party crawl metric or log observation.', 422);
  }

  const systemPrompt = [
    'You are a senior technical SEO strategist building a crawl intelligence benchmark for a SaaS dashboard.',
    'Treat first-party crawl metrics as ground truth and competitor behavior as directional modeling only.',
    'Do not claim competitor data is observed directly.',
    'Return strict JSON only with keys: market_summary, executive_summary, benchmark_snapshot, competitors, gap_alerts, priority_actions, roi_hooks, data_transparency.',
    'benchmark_snapshot must be an array of objects with keys: metric, your_value, competitor_range, verdict, why_it_matters, confidence.',
    'competitors must be an array of objects with keys: name, modeled_crawl_pattern, content_velocity_signal, opportunity, risk.',
    'gap_alerts, priority_actions, roi_hooks, and data_transparency must be arrays of concise strings.',
    'Keep output concise, practical, and premium-product ready.',
  ].join(' ');

  const userPrompt = {
    companyName,
    market: market || undefined,
    website: website || undefined,
    competitors,
    firstParty,
    objective:
      'Benchmark our real crawl behavior against modeled competitor patterns, surface the most material crawl efficiency gaps, and recommend fixes that could improve discovery and lead generation.',
  };

  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        input: [
          { role: 'system', content: [{ type: 'input_text', text: systemPrompt }] },
          { role: 'user', content: [{ type: 'input_text', text: JSON.stringify(userPrompt) }] },
        ],
        max_output_tokens: 2600,
      }),
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message = payload?.error?.message || 'AI provider request failed.';
      return fail(message, response.status);
    }

    const outputText: string = payload?.output_text || '';
    let parsed: any;
    try {
      parsed = JSON.parse(outputText);
    } catch {
      return fail('Analysis output could not be parsed as JSON.', 502);
    }

    const result = {
      market_summary: String(parsed?.market_summary || market || 'Unknown market'),
      executive_summary: String(parsed?.executive_summary || ''),
      benchmark_snapshot: Array.isArray(parsed?.benchmark_snapshot)
        ? parsed.benchmark_snapshot.slice(0, 6).map((item: any) => ({
            metric: String(item?.metric || ''),
            your_value: String(item?.your_value || ''),
            competitor_range: String(item?.competitor_range || ''),
            verdict: String(item?.verdict || ''),
            why_it_matters: String(item?.why_it_matters || ''),
            confidence: String(item?.confidence || 'directional'),
          }))
        : [],
      competitors: Array.isArray(parsed?.competitors)
        ? parsed.competitors.slice(0, 6).map((item: any) => ({
            name: String(item?.name || ''),
            modeled_crawl_pattern: String(item?.modeled_crawl_pattern || ''),
            content_velocity_signal: String(item?.content_velocity_signal || ''),
            opportunity: String(item?.opportunity || ''),
            risk: String(item?.risk || ''),
          }))
        : [],
      gap_alerts: Array.isArray(parsed?.gap_alerts) ? parsed.gap_alerts.map((item: any) => String(item)) : [],
      priority_actions: Array.isArray(parsed?.priority_actions)
        ? parsed.priority_actions.map((item: any) => String(item))
        : [],
      roi_hooks: Array.isArray(parsed?.roi_hooks) ? parsed.roi_hooks.map((item: any) => String(item)) : [],
      data_transparency: Array.isArray(parsed?.data_transparency)
        ? parsed.data_transparency.map((item: any) => String(item))
        : [
            'Your crawl metrics are first-party inputs.',
            'Competitor ranges are modeled estimates, not directly observed log data.',
          ],
      ai_context: {
        provider,
        model,
        generated_at: new Date().toISOString(),
      },
    };

    return ok(result);
  } catch (err: any) {
    return fail(err?.message || 'Failed to run crawl intelligence analysis.', 500);
  }
}
