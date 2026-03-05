// app/api/auth/register-status/route.ts

import { NextRequest } from 'next/server';
import { API_BASE_URL } from '@/app/lib/config';
import { ok } from '@/app/lib/response';

export async function GET(_req: NextRequest) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(`${API_BASE_URL}/auth/register-status`, {
      cache: 'no-store',
      signal: controller.signal,
    });
    const body = await res.json();
    const open = Boolean((body as any)?.open ?? (body as any)?.data?.open);
    return ok({ open, degraded: false });
  } catch (err: any) {
    // Keep sign-up path responsive even if backend status endpoint is unavailable.
    return ok({ open: true, degraded: true });
  } finally {
    clearTimeout(timeout);
  }
}
