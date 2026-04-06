"use server";

import { NextRequest } from 'next/server';
import { getAuthTokenFromRequest } from '@/app/lib/cookies';
import { fail, ok } from '@/app/lib/response';
import type { BlogPostGenerationResult } from '@/app/lib/api';
import { getUserFromSessionToken } from '@/app/lib/supabase-store';
import { ingestWorkflowEvent } from '@/app/lib/workflows/engine';

type BlogGenerateRequest = {
  topic?: string;
  tone?: string;
  keywords?: string[];
  provider?: 'openai';
  apiKey?: string;
  model?: string;
  companyName?: string;
  market?: string;
  website?: string;
};

function parseJsonObject(input: string): Record<string, any> | null {
  try {
    const parsed = JSON.parse(input);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const token = await getAuthTokenFromRequest(req);
  if (!token) return fail('Please sign in again.', 401);
  const user = await getUserFromSessionToken(token).catch(() => null);

  const body = (await req.json().catch(() => ({}))) as BlogGenerateRequest;
  const topic = (body.topic || '').trim();
  const apiKey = (body.apiKey || '').trim();
  const provider = body.provider || 'openai';
  const model = (body.model || 'gpt-4.1-mini').trim();
  const tone = (body.tone || '').trim();
  const keywords = (Array.isArray(body.keywords) ? body.keywords : []).map((k) => String(k).trim()).filter(Boolean).slice(0, 10);

  if (!topic) return fail('Topic is required.', 422);
  if (!apiKey) return fail('API key is required.', 422);
  if (provider !== 'openai') return fail('Only OpenAI provider is supported right now.', 422);

  const systemPrompt = [
    'You are an expert SaaS content strategist and SEO blog writer.',
    'Return strict JSON only with keys: title, slug, excerpt, body, meta_title, meta_description, tags, ai_context.',
    'The body must be markdown with clear headings and actionable insights.',
    'No markdown code fences in the JSON output.',
  ].join(' ');

  const userPrompt = {
    topic,
    tone: tone || 'Friendly yet expert',
    keywords,
    company: (body.companyName || '').trim() || undefined,
    market: (body.market || '').trim() || undefined,
    website: (body.website || '').trim() || undefined,
    constraints: {
      excerptMaxChars: 220,
      metaTitleMaxChars: 60,
      metaDescriptionMaxChars: 160,
      targetWordCount: '900-1400',
      includeSections: ['intro', 'problem framing', 'strategy', 'implementation ideas', 'CTA'],
    },
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
        max_output_tokens: 2200,
      }),
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message = payload?.error?.message || 'AI provider request failed.';
      return fail(message, response.status);
    }

    const text: string = payload?.output_text || '';
    const parsed = parseJsonObject(text);
    if (!parsed) return fail('AI output could not be parsed as JSON.', 502);

    const result: BlogPostGenerationResult = {
      title: String(parsed.title || topic),
      slug: String(parsed.slug || '').trim() || String(parsed.title || topic).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      excerpt: typeof parsed.excerpt === 'string' ? parsed.excerpt : '',
      body: typeof parsed.body === 'string' ? parsed.body : '',
      meta_title: typeof parsed.meta_title === 'string' ? parsed.meta_title : null,
      meta_description: typeof parsed.meta_description === 'string' ? parsed.meta_description : null,
      featured_image_url: typeof parsed.featured_image_url === 'string' ? parsed.featured_image_url : null,
      tags: Array.isArray(parsed.tags) ? parsed.tags.map((tag: any) => String(tag)).slice(0, 8) : [],
      ai_context: {
        provider,
        model,
        mock: false,
        topic,
        options: {
          tone,
          keywords,
        },
      },
    };

    if (!result.title || !result.body) {
      return fail('AI response missing required blog fields.', 502);
    }

    await ingestWorkflowEvent({
      tenantId: user?.tenant_id ?? null,
      eventType: 'blog.draft_generated',
      eventPayload: {
        title: result.title,
        slug: result.slug,
        tags: result.tags || [],
        topic,
      },
    }).catch(() => {});

    return ok(result);
  } catch (err: any) {
    return fail(err?.message || 'Failed to generate blog draft.', 500);
  }
}
