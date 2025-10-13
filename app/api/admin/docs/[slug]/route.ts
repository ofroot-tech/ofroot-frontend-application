// app/api/admin/docs/[slug]/route.ts
//
// Super-admin protected CRUD for a single Markdown doc under /docs.
// Now proxies to the Laravel backend for durable persistence.
// Supports:
// - GET:    fetch { slug, title, body }
// - PUT:    update the file contents (title + body)
// - DELETE: remove the file
//
// Production Note (persistence): local FS is ephemeral on serverless. Proxied to DB via backend.

import { NextRequest } from 'next/server';
import { getAuthTokenFromRequest } from '@/app/lib/cookies';
import { api } from '@/app/lib/api';
import { fail, ok } from '@/app/lib/response';

function isSuperAdmin(email: string | undefined | null) {
  const allow = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return !!email && allow.includes(email.toLowerCase());
}

async function assertSuperAdminOrFail() {
  const token = await getAuthTokenFromRequest();
  if (!token) return fail('Unauthorized', 401);
  try {
    const raw = await api.me(token);
    const user = (raw as any)?.data ?? raw;
    if (!isSuperAdmin(user?.email)) return fail('Forbidden', 403);
    return { token };
  } catch (err) {
    return fail('Unauthorized', 401);
  }
}

export async function GET(req: NextRequest, context: { params: Promise<{ slug: string }> }) {
  const auth = await assertSuperAdminOrFail();
  if ((auth as any)?.ok === false) return auth as any;
  const token = (auth as any).token as string;

  const { slug } = await context.params;
  try {
    const res = await api.adminGetDoc(slug, token);
    return ok(res.data);
  } catch (e: any) {
    return fail(e?.message || 'Not found', e?.status || 404);
  }
}

export async function PUT(req: NextRequest, context: { params: Promise<{ slug: string }> }) {
  const auth = await assertSuperAdminOrFail();
  if ((auth as any)?.ok === false) return auth as any;
  const token = (auth as any).token as string;

  const { slug } = await context.params;
  const body = await req.json().catch(() => ({} as any));
  const title = String(body.title || '').trim();
  const mdBody = String(body.body || '').trim();
  if (!title || !mdBody) return fail('Title and body are required', 400);

  try {
    const res = await api.adminUpdateDoc(slug, { title, body: mdBody }, token);
    return ok(res.data);
  } catch (e: any) {
    return fail(e?.message || 'Failed to write file', e?.status || 500);
  }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ slug: string }> }) {
  const auth = await assertSuperAdminOrFail();
  if ((auth as any)?.ok === false) return auth as any;
  const token = (auth as any).token as string;

  const { slug } = await context.params;
  try {
    const res = await api.adminDeleteDoc(slug, token);
    return ok(res.data);
  } catch (e: any) {
    return fail(e?.message || 'Not found', e?.status || 404);
  }
}
