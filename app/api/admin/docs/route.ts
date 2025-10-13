// app/api/admin/docs/route.ts
//
// Server route to create/update Markdown files under /docs.
// SECURITY: This must be limited to super admins. We gate by ADMIN_EMAILS env
// via the backend token decoded from our /auth/me proxy.
//
// Production Note (persistence):
//   Writing to the local filesystem is non-persistent on many serverless hosts
//   (e.g., Vercel). This route now proxies the Laravel backend Docs API which
//   persists to the database.

import { NextRequest } from 'next/server';
import { getAuthTokenFromRequest } from '@/app/lib/cookies';
import { api } from '@/app/lib/api';
import { fail, ok } from '@/app/lib/response';

function isSuperAdmin(email: string | undefined | null) {
  const allow = (process.env.ADMIN_EMAILS || '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
  return !!email && allow.includes(email.toLowerCase());
}

function parseTitle(md: string) {
  const first = md.split(/\r?\n/)[0] || '';
  if (first.startsWith('# ')) return first.slice(2).trim();
  return 'Untitled';
}

async function assertSuperAdminOrFail() {
  const token = await getAuthTokenFromRequest();
  if (!token) return fail('Unauthorized', 401);
  try {
    const raw = await api.me(token);
    const user = (raw as any)?.data ?? raw;
    if (!isSuperAdmin(user?.email)) return fail('Forbidden', 403);
    return { token };
  } catch (err: any) {
    return fail('Unauthorized', 401);
  }
}

export async function GET(req: NextRequest) {
  const auth = await assertSuperAdminOrFail();
  if ((auth as any)?.ok === false) return auth as any;
  const token = (auth as any).token as string;
  try {
    const res = await api.adminListDocs(token);
    return ok(res.data);
  } catch (e: any) {
    return fail(e?.message || 'Failed to list docs', e?.status || 500);
  }
}

export async function POST(req: NextRequest) {
  const auth = await assertSuperAdminOrFail();
  if ((auth as any)?.ok === false) return auth as any;
  const token = (auth as any).token as string;

  const body = await req.json().catch(() => ({} as any));
  const slug = String(body.slug || '').trim();
  const title = String(body.title || '').trim();
  const mdBody = String(body.body || '').trim();
  if (!slug || !/^[a-z0-9-_]+$/.test(slug)) return fail('Invalid slug', 400);
  if (!title || !mdBody) return fail('Title and body are required', 400);

  try {
    const res = await api.adminCreateDoc({ slug, title, body: mdBody }, token);
    return ok(res.data);
  } catch (e: any) {
    return fail(e?.message || 'Failed to create doc', e?.status || 500);
  }
}
