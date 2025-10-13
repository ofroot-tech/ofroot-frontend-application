# Authentication System (Next.js + Laravel Sanctum) — Updated

# Summary — quick answer first

This document applies the suggested hardening and refactors. It centralizes cookie options. It normalizes API responses. It adds CSRF notes, logs, typed responses, and a refresh strategy. It keeps tokens out of the browser. It stays SSR-friendly.

# Feynman summary

Next.js acts as a secure post office. The browser hands requests to Next. Next talks to Laravel. Laravel returns a token. Next hides the token in an httpOnly cookie. The cookie never reaches client JS. Server routes read the cookie and ask Laravel who the user is. Pages can render or redirect on the server.

# Changes made (alphabetical, short)

* a. Centralized cookie options. See `app/lib/cookies.ts`.
* b. Error shape normalized. All Next API responses use `{ ok: boolean, data?: any, error?: { message: string } }`.
* c. Logging added to Next API routes for auth failures.
* d. Typed responses: `types/auth.ts` and Zod examples.
* e. Token refresh plan documented.
* f. CSRF notes added for Laravel/Sanctum.
* g. `api` adapter cleaned: clear separation of client vs server adapters.
* h. Tests checklist added.
* i. Logout route now redirects browsers (form posts) to `/auth/login` after clearing the cookie; XHR receives JSON.
* j. `/api/auth/me` flattens a `{ data: user }` Laravel payload to avoid nested `data.data`.

# Environment (unchanged)

* Frontend local: `.env.local` with `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api`.
* Frontend production: `.env.production` with `NEXT_PUBLIC_API_BASE_URL=https://<your-laravel-host>/api`.
* Backend local: `.env` with `APP_URL=http://localhost:8000`, `DB_CONNECTION=sqlite`, `DB_DATABASE=database/database.sqlite`.

# File map (key pieces) — updated

* `app/utils/api.ts` — client axios helper (baseURL: `/api`).
* `app/lib/api.ts` — server-to-server client adapter.
* `app/lib/cookies.ts` — centralized cookie options and helpers.
* `app/lib/response.ts` — normalized Next API responses.
* `app/lib/logger.ts` — minimal structured server logger.
* `context/AuthContext.tsx` — auth provider and hook. Uses normalized responses.
* `app/api/auth/*.ts` — Next API routes. Use centralized cookie utils and logging.
* `types/auth.ts` — zod schema and TS types for `me` and auth responses.

# New helper: `app/lib/cookies.ts`

```ts
// app/lib/cookies.ts
export const TOKEN_COOKIE_NAME = process.env.NODE_ENV === 'production' ? '__Host-ofroot_token' : 'ofroot_token';
export const LEGACY_COOKIE_NAME = 'ofroot_token';
export const DEFAULT_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  path: '/',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 60 * 60 * 24 * 30, // 30 days
};

export function setAuthCookie(res: any, token: string) {
  res.cookies.set(TOKEN_COOKIE_NAME, token, DEFAULT_COOKIE_OPTIONS);
}

export function clearAuthCookie(res?: any) {
  // Clear both the hardened and legacy names
  if (res?.cookies) {
    res.cookies.set(TOKEN_COOKIE_NAME, '', { path: '/', maxAge: 0 });
    res.cookies.set(LEGACY_COOKIE_NAME, '', { path: '/', maxAge: 0 });
  }
}
```

# Normalized response helper

```ts
// app/lib/response.ts
import { NextResponse } from 'next/server';
export function ok(data = {}) { return NextResponse.json({ ok: true, data }, { status: 200 }); }
export function created(data = {}) { return NextResponse.json({ ok: true, data }, { status: 201 }); }
export function fail(message = 'Error', status = 400) { return NextResponse.json({ ok: false, error: { message } }, { status }); }
```

# Updated Next API `login` route

```ts
// app/api/auth/login/route.ts
import { NextRequest } from 'next/server';
import { api } from '@/app/lib/api';
import { ok, fail } from '@/app/lib/response';
import { setAuthCookie } from '@/app/lib/cookies';
import { logger } from '@/app/lib/logger';
import { loginSchema } from '@/types/auth';

export async function POST(req: NextRequest) {
  const ct = req.headers.get('content-type') || '';
  const { email = '', password = '' } = ct.includes('json') ? await req.json().catch(() => ({})) : Object.fromEntries((await req.formData()).entries()) as any;
  const parsed = loginSchema.safeParse({ email, password });
  if (!parsed.success) return fail('Email and password are required', 400);
  try {
    const { token } = await api.login(email, password, 'next-web');
    const res = ok({});
    setAuthCookie(res, token);
    logger.info('auth.login.success', { email });
    return res;
  } catch (e: any) {
    logger.warn('auth.login.failed', { email, status: e?.status, message: e?.message });
    return fail('Login failed', e?.status || 500);
  }
}
```

# Updated Next API `me` route (reads cookie and proxies)

```ts
// app/api/auth/me/route.ts
import { NextRequest } from 'next/server';
import { api } from '@/app/lib/api';
import { ok, fail } from '@/app/lib/response';
import { getAuthTokenFromRequest } from '@/app/lib/cookies';

export async function GET(req: NextRequest) {
  const token = await getAuthTokenFromRequest();
  if (!token) return fail('Not authenticated', 401);
  try {
    const raw = await api.me(token);
    const user = (raw as any)?.data ?? raw; // flatten Laravel { data: user }
    return ok(user);
  } catch {
    return fail('Could not validate session', 401);
  }
}
```

# Updated Next API `logout` route (redirect or JSON)

```ts
// app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/app/lib/api';
import { clearAuthCookie, getAuthTokenFromRequest } from '@/app/lib/cookies';
import { ok } from '@/app/lib/response';

export async function POST(req: NextRequest) {
  const token = await getAuthTokenFromRequest();
  if (token) { try { await api.logout(token); } catch {} }

  const accept = req.headers.get('accept') || '';
  const url = new URL(req.url);
  const redirectTo = url.searchParams.get('redirect') || '/auth/login';

  if (accept.includes('text/html')) {
    const res = NextResponse.redirect(new URL(redirectTo, url), 303);
    clearAuthCookie(res);
    return res;
  }

  const res = ok({});
  clearAuthCookie(res);
  return res;
}
```

# Auth context updates (client)

```tsx
// context/AuthContext.tsx
"use client";
import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/app/utils/api';

export const AuthContext = createContext<any>(null);
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    api.get('/auth/me')
      .then(r => { if (r.data?.ok) setUser(r.data.data); else setUser(null); })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  async function login(email: string, password: string) {
    const res = await api.post('/auth/login', new URLSearchParams({ email, password }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
    if (!res.data?.ok) throw new Error(res.data?.error?.message || 'Login failed');
    const me = await api.get('/auth/me');
    if (me.data?.ok) setUser(me.data.data);
    router.push('/dashboard');
  }

  async function logout() {
    const res = await api.post('/auth/logout');
    if (res.data?.ok) setUser(null);
    router.push('/auth/login');
  }

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => { const ctx = useContext(AuthContext); if (!ctx) throw new Error('useAuth must be used within AuthProvider'); return ctx; };
```

# SSR guard (server) — small improvement

```tsx
// app/dashboard/page.tsx
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
export default async function Page() {
  const h = await headers();
  const base = `${h.get('x-forwarded-proto') || 'http'}://${h.get('host')}`;
  const me = await fetch(`${base}/api/auth/me`, { cache: 'no-store', headers: { cookie: h.get('cookie') || '' } });
  if (!me.ok) redirect('/auth/login');
  const body = await me.json();
  const user = body?.data ?? null;
  return <div>Welcome, {user?.name}</div>;
}
```

# CSRF and Sanctum notes

* Laravel Sanctum may require CSRF cookies for SPA flows. This proxy pattern negates client cookies for the token. If you still use Sanctum CSRF, ensure `/sanctum/csrf-cookie` is called server-side or adjust Laravel to accept the proxied token. Document chosen approach.

# Token refresh plan (short)

* a. Short-lived access tokens + refresh tokens stored server-side. Next keeps both in server session or signed cookies. The refresh endpoint is server-to-server.
* b. If Laravel issues long-lived token, monitor and force re-login on 401.

# Testing checklist (alphabetical)

* a. Cookie present and httpOnly after login.
* b. Dashboard SSR redirect when cookie absent.
* c. Logout clears cookie and prevents `me` access.
* d. Browser form logout redirects to `/auth/login` (303).
* e. XHR logout returns `{ ok: true }` and does not navigate.
* f. `/api/auth/me` returns `{ ok: true, data: { id, name, email, ... } }` (not nested).
* g. `login` returns normalized error on bad creds.

# Logging and observability

* Add structured logs for login, logout, and me. Include request id and environment. Keep logs server-side only. Do not log raw tokens.

# Extras: types (example)

```ts
// types/auth.ts
import { z } from 'zod';
export const UserSchema = z.object({ id: z.number(), name: z.string(), email: z.string().email() });
export type User = z.infer<typeof UserSchema>;
```

# Final notes

This update centralizes cookie management. It normalizes responses. It adds small but important production safety features. It keeps the same overall flow.

# Observability (Sentry) — frontend quick setup

- Packages: @sentry/nextjs (runtime) and sentry-cli-binary (CI source maps)
- Config files auto-loaded by Next: `sentry.client.config.ts`, `sentry.server.config.ts`
- Env (dev/prod):
  - NEXT_PUBLIC_SENTRY_DSN=<browser DSN>
  - SENTRY_DSN=<server DSN or reuse browser DSN>
  - SENTRY_ENVIRONMENT=production|staging|development
  - Optional: NEXT_PUBLIC_SENTRY_TRACES=0.05, NEXT_PUBLIC_SENTRY_REPLAY_ERROR=0.1, NEXT_PUBLIC_SENTRY_REPLAY_SESSION=0
- API routes use a helper (`app/api/_helpers/sentry.ts`) to capture exceptions.
- Source maps: run `npm run build` in CI with release info, then `npm run sentry:sourcemaps`.
