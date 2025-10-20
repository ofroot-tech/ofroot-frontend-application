"use server";

import { NextRequest } from 'next/server';
import { getAuthTokenFromRequest } from '@/app/lib/cookies';
import { api } from '@/app/lib/api';
import { ok, fail } from '@/app/lib/response';

export async function POST(req: NextRequest) {
  const token = await getAuthTokenFromRequest(req);
  if (!token) return fail('Please sign in to chat with the team.', 401);

  const body = await req.json().catch(() => ({}));
  const message = typeof body?.message === 'string' ? body.message : '';
  if (!message.trim()) return fail('Message is required.', 422);

  try {
    const res = await api.chatSend(message, token);
    return ok(res.data);
  } catch (err: any) {
    return fail(err?.message || 'Chat service unavailable', err?.status ?? 500);
  }
}
