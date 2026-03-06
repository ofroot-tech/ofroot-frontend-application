"use server";

import { NextRequest } from 'next/server';
import { getAuthTokenFromRequest } from '@/app/lib/cookies';
import { fail, ok } from '@/app/lib/response';

type CompetitorAnalysisRequest = {
  provider?: 'openai';
  apiKey?: string;
  model?: string;
  companyName?: string;
  market?: string;
  website?: string;
  competitors?: string[];
};

export async function POST(req: NextRequest) {
  const token = await getAuthTokenFromRequest(req);
  if (!token) return fail('Please sign in again.', 401);

  const body = (await req.json().catch(() => ({}))) as CompetitorAnalysisRequest;
  const apiKey = (body.apiKey || '').trim();
  const provider = body.provider || 'openai';
  const model = (body.model || 'gpt-4.1-mini').trim();
  const companyName = (body.companyName || 'Our company').trim();
  const market = (body.market || '').trim();
  const website = (body.website || '').trim();
  const competitors = (Array.isArray(body.competitors) ? body.competitors : []).map((c) => String(c).trim()).filter(Boolean).slice(0, 12);

  if (!apiKey) return fail('API key is required.', 422);
  if (provider !== 'openai') return fail('Only OpenAI provider is supported right now.', 422);

  const systemPrompt = [
    'You are a senior growth strategist focused on SEO and content GTM for B2B software companies.',
    'Return strict JSON only with keys: detected_market, competitors, seo_playbook, opportunities, risks, next_30_day_plan.',
    'competitors must be an array of objects with keys: name, positioning, seo_strength, acquisition_channels, content_angle, gaps_to_exploit.',
    'seo_playbook, opportunities, risks, and next_30_day_plan must be arrays of concise strings.',
    'If market is missing, infer it from company and website context and state assumptions.',
  ].join(' ');

  const userPrompt = {
    companyName,
    market: market || undefined,
    website: website || undefined,
    competitors,
    objective: 'Analyze competitor performance patterns and SEO strategies so we can prioritize what to copy, avoid, and out-execute.',
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
        max_output_tokens: 2400,
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
      detected_market: String(parsed?.detected_market || market || 'Unknown market'),
      competitors: Array.isArray(parsed?.competitors) ? parsed.competitors.slice(0, 8) : [],
      seo_playbook: Array.isArray(parsed?.seo_playbook) ? parsed.seo_playbook.map((x: any) => String(x)) : [],
      opportunities: Array.isArray(parsed?.opportunities) ? parsed.opportunities.map((x: any) => String(x)) : [],
      risks: Array.isArray(parsed?.risks) ? parsed.risks.map((x: any) => String(x)) : [],
      next_30_day_plan: Array.isArray(parsed?.next_30_day_plan) ? parsed.next_30_day_plan.map((x: any) => String(x)) : [],
      ai_context: {
        provider,
        model,
        generated_at: new Date().toISOString(),
      },
    };

    return ok(result);
  } catch (err: any) {
    return fail(err?.message || 'Failed to run competitor analysis.', 500);
  }
}
