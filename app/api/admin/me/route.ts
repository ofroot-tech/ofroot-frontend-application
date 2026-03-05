// app/api/admin/me/route.ts
//
// Super-admin probe — returns { email, isSuperAdmin } for the current session.
// Purpose: allow the dashboard shell to conditionally show admin-only links
// (like Docs CRUD) without exposing any privileged data.
//
// Contract:
// - Reads auth token from cookies.
// - Calls backend /auth/me to resolve the current user.
// - Evaluates ADMIN_EMAILS (comma-separated) to determine super-admin status.
// - Responds with ok({ email, isSuperAdmin }) or fail(...).

import { NextRequest } from 'next/server';
import { getAuthTokenFromRequest } from '@/app/lib/cookies';
import { ok } from '@/app/lib/response';
import { getUserFromSessionToken } from '@/app/lib/supabase-store';

function isSuperAdmin(email: string | undefined | null) {
  const allow = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return !!email && allow.includes(email.toLowerCase());
}

export async function GET(_req: NextRequest) {
  const token = await getAuthTokenFromRequest();
  if (!token) {
    return ok({ email: null, name: null, plan: null, isSuperAdmin: false, hasBlogAddon: false });
  }
  try {
    const user = await getUserFromSessionToken(token);
    if (!user) {
      return ok({ email: null, name: null, plan: null, isSuperAdmin: false, hasBlogAddon: false });
    }
    const email = user?.email ?? null;
    const name = user?.name ?? null;
    const plan = user?.plan ?? null;
    return ok({ email, name, plan, isSuperAdmin: isSuperAdmin(email), hasBlogAddon: false });
  } catch {
    return ok({ email: null, name: null, plan: null, isSuperAdmin: false, hasBlogAddon: false });
  }
}
