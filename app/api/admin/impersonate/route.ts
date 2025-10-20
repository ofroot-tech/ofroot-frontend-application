"use server";

import { NextRequest } from 'next/server';
import { ok, fail } from '@/app/lib/response';
import { getAuthTokenFromRequest, setAuthCookie } from '@/app/lib/cookies';
import { api } from '@/app/lib/api';

export async function POST(req: NextRequest) {
  const token = await getAuthTokenFromRequest(req);
  if (!token) {
    return fail('Admin session required', 401);
  }

  const body = await req.json().catch(() => ({}));
  const role = typeof body.role === 'string' && body.role ? String(body.role) : undefined;
  const plan = typeof body.plan === 'string' && body.plan ? String(body.plan) : undefined;

  try {
    const result = await api.adminImpersonate(token, { role, plan });
    const response = ok({ message: result.message ?? 'Impersonation applied', user: result.user });
    setAuthCookie(response, result.token);
    return response;
  } catch (err: any) {
    return fail(err?.message || 'Failed to impersonate', err?.status ?? 500);
  }
}
