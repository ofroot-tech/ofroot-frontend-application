// app/api/auth/register-status/route.ts

import { NextRequest } from 'next/server';
import { api } from '@/app/lib/api';
import { ok, fail } from '@/app/lib/response';

export async function GET(_req: NextRequest) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '')}/auth/register-status`, { cache: 'no-store' });
    const body = await res.json();
    return ok(body);
  } catch (err: any) {
    return fail('Failed to fetch registration status', 500);
  }
}
