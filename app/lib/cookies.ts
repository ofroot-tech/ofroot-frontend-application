// app/lib/cookies.ts
// Centralized cookie helpers and options for auth token management.

import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';

export const TOKEN_COOKIE_NAME = process.env.NODE_ENV === 'production' ? '__Host-ofroot_token' : 'ofroot_token';
export const LEGACY_COOKIE_NAME = 'ofroot_token';

export const DEFAULT_COOKIE_OPTIONS = {
  httpOnly: true as const,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  // 30 days by default
  maxAge: 60 * 60 * 24 * 30,
};

// Read token from the request cookie store on the server
export async function getAuthTokenFromRequest(_: NextRequest | Request | void = undefined): Promise<string | undefined> {
  const store = await cookies();
  return store.get(TOKEN_COOKIE_NAME)?.value || store.get(LEGACY_COOKIE_NAME)?.value;
}

export function setAuthCookie(res: NextResponse, token: string, opts?: Partial<typeof DEFAULT_COOKIE_OPTIONS>) {
  res.cookies.set(TOKEN_COOKIE_NAME, token, { ...DEFAULT_COOKIE_OPTIONS, ...opts });
}

export async function clearAuthCookie(res?: NextResponse) {
  const store = await cookies();
  // Clear on the cookie store for SSR responses
  store.set(TOKEN_COOKIE_NAME, '', { path: '/', maxAge: 0 });
  store.set(LEGACY_COOKIE_NAME, '', { path: '/', maxAge: 0 });
  // Also clear on the NextResponse if provided
  if (res) {
    res.cookies.set(TOKEN_COOKIE_NAME, '', { path: '/', maxAge: 0 });
    res.cookies.set(LEGACY_COOKIE_NAME, '', { path: '/', maxAge: 0 });
  }
}
