// app/api/proxy/public/invoices/[externalId]/checkout/route.ts
import { NextRequest } from 'next/server';
import { API_BASE_URL } from '@/app/lib/config';

export async function POST(req: NextRequest, context: { params: Promise<{ externalId: string }> }) {
  const resolved = await context.params;
  const externalId = decodeURIComponent(resolved?.externalId || '');
  if (!externalId) return new Response(JSON.stringify({ error: { message: 'Missing externalId' } }), { status: 400 });
  const body = await req.json().catch(() => ({}));
  const url = `${API_BASE_URL}/public/invoices/${encodeURIComponent(externalId)}/checkout`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {}),
    // optional: forward cookies/headers if needed
  });
  const text = await res.text();
  return new Response(text, { status: res.status, headers: { 'Content-Type': res.headers.get('content-type') || 'application/json' } });
}
