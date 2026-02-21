import { NextRequest } from 'next/server';
import { z } from 'zod';
import { fail, ok } from '@/app/lib/response';
import { logger } from '@/app/lib/logger';
import {
  getIntroSessionCookieOptions,
  INTRO_LETTERS_SESSION_COOKIE,
  matchesIntroCredentials,
  signIntroSession,
} from '@/app/lib/introLettersAuth';

const FAILED_ATTEMPTS_WINDOW_MS = 10 * 60 * 1000;
const FAILED_ATTEMPTS_LIMIT = 5;
const failedByIp = new Map<string, number[]>();

const authSchema = z.object({
  username: z.string().trim().min(1).max(320),
  password: z.string().min(1).max(200),
});

function getClientIp(req: NextRequest) {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.headers.get('x-real-ip') || 'unknown';
}

function recentFailures(ip: string, nowMs: number) {
  const hits = failedByIp.get(ip) || [];
  const withinWindow = hits.filter((t) => nowMs - t < FAILED_ATTEMPTS_WINDOW_MS);
  if (withinWindow.length) failedByIp.set(ip, withinWindow);
  else failedByIp.delete(ip);
  return withinWindow;
}

function addFailure(ip: string, nowMs: number) {
  const hits = recentFailures(ip, nowMs);
  hits.push(nowMs);
  failedByIp.set(ip, hits);
}

function isThrottled(ip: string, nowMs: number) {
  return recentFailures(ip, nowMs).length >= FAILED_ATTEMPTS_LIMIT;
}

export async function POST(req: NextRequest) {
  const nowMs = Date.now();
  const ip = getClientIp(req);

  if (isThrottled(ip, nowMs)) {
    logger.warn('intro_letters.auth.throttled', { ip });
    return fail('Too many failed attempts. Try again in 10 minutes.', 429, undefined, {
      code: 'TOO_MANY_ATTEMPTS',
    });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = authSchema.safeParse(body);
  if (!parsed.success) {
    return fail('Username and password are required.', 400, undefined, {
      details: parsed.error.flatten(),
    });
  }

  const { username, password } = parsed.data;
  const valid = matchesIntroCredentials(username, password);
  if (!valid) {
    addFailure(ip, nowMs);
    logger.warn('intro_letters.auth.failed', { ip });
    return fail('Invalid credentials.', 401);
  }

  failedByIp.delete(ip);
  const signed = signIntroSession({ username });
  if (!signed) {
    logger.error('intro_letters.auth.misconfigured', {
      nodeEnv: process.env.NODE_ENV || 'unknown',
    });
    return fail('Intro letters auth is not configured on this server.', 500);
  }

  const res = ok({
    authenticated: true,
    expiresAt: new Date(signed.expiresAt * 1000).toISOString(),
  });
  res.cookies.set(
    INTRO_LETTERS_SESSION_COOKIE,
    signed.token,
    getIntroSessionCookieOptions(signed.expiresAt - Math.floor(nowMs / 1000))
  );
  logger.info('intro_letters.auth.success', { ip });
  return res;
}
