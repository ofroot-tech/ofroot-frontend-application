import { createHmac, timingSafeEqual } from 'crypto';

export const INTRO_LETTERS_SESSION_COOKIE = 'ofroot_intro_letters_session';
export const INTRO_LETTERS_SESSION_TTL_SECONDS = 60 * 60 * 12; // 12 hours

const FALLBACK_GATE_USER = 'dimitri.mcdaniel@gmail.com';
const FALLBACK_GATE_PASSWORD = '1734';
const DEV_FALLBACK_SECRET = 'intro-letters-dev-secret-change-me';

type IntroSessionPayload = {
  u: string;
  exp: number;
};

export type IntroSession = {
  username: string;
  expiresAt: number;
};

type SignIntroSessionOptions = {
  username: string;
  nowMs?: number;
  ttlSeconds?: number;
};

type VerifyIntroSessionOptions = {
  nowMs?: number;
};

function base64UrlEncode(value: string) {
  return Buffer.from(value, 'utf8').toString('base64url');
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, 'base64url').toString('utf8');
}

function getSigningSecret(): string | null {
  const fromEnv = process.env.INTRO_LETTERS_GATE_SECRET?.trim();
  if (fromEnv) return fromEnv;
  if (process.env.NODE_ENV === 'production') return null;
  return DEV_FALLBACK_SECRET;
}

function signValue(value: string, secret: string) {
  return createHmac('sha256', secret).update(value).digest('base64url');
}

function safeEqual(a: string, b: string) {
  const aBuf = Buffer.from(a, 'utf8');
  const bBuf = Buffer.from(b, 'utf8');
  const len = Math.max(aBuf.length, bBuf.length, 1);
  const paddedA = Buffer.alloc(len);
  const paddedB = Buffer.alloc(len);
  aBuf.copy(paddedA);
  bBuf.copy(paddedB);
  return timingSafeEqual(paddedA, paddedB) && aBuf.length === bBuf.length;
}

export function getIntroGateUser() {
  return process.env.INTRO_LETTERS_GATE_USER?.trim() || FALLBACK_GATE_USER;
}

export function getIntroGatePassword() {
  return process.env.INTRO_LETTERS_GATE_PASSWORD?.trim() || FALLBACK_GATE_PASSWORD;
}

export function matchesIntroCredentials(username: string, password: string) {
  const expectedUser = getIntroGateUser().toLowerCase();
  const expectedPassword = getIntroGatePassword();
  return (
    safeEqual(username.trim().toLowerCase(), expectedUser) &&
    safeEqual(password.trim(), expectedPassword)
  );
}

export function getIntroSessionCookieOptions(maxAge = INTRO_LETTERS_SESSION_TTL_SECONDS) {
  return {
    httpOnly: true as const,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge,
  };
}

export function signIntroSession(opts: SignIntroSessionOptions): { token: string; expiresAt: number } | null {
  const secret = getSigningSecret();
  if (!secret) return null;

  const nowMs = opts.nowMs ?? Date.now();
  const ttl = opts.ttlSeconds ?? INTRO_LETTERS_SESSION_TTL_SECONDS;
  const payload: IntroSessionPayload = {
    u: opts.username.trim(),
    exp: Math.floor(nowMs / 1000) + ttl,
  };
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = signValue(encodedPayload, secret);
  return {
    token: `${encodedPayload}.${signature}`,
    expiresAt: payload.exp,
  };
}

export function verifyIntroSession(
  token: string | undefined | null,
  opts?: VerifyIntroSessionOptions
): IntroSession | null {
  if (!token) return null;
  const secret = getSigningSecret();
  if (!secret) return null;

  const [encodedPayload, signature] = token.split('.');
  if (!encodedPayload || !signature) return null;

  const expectedSig = signValue(encodedPayload, secret);
  if (!safeEqual(signature, expectedSig)) return null;

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as IntroSessionPayload;
    const now = Math.floor((opts?.nowMs ?? Date.now()) / 1000);
    if (!payload?.u || typeof payload.exp !== 'number' || payload.exp <= now) return null;
    return {
      username: payload.u,
      expiresAt: payload.exp,
    };
  } catch {
    return null;
  }
}
