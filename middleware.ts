/**
 * Middleware: Landing variant stickiness (Knuth-style notes)
 *
 * Goal
 *  - If a landing URL includes a query param `v` (e.g. /landing/x?v=B), set a cookie
 *    `ofroot_variant_<slug>` to that value and redirect to the same URL without `v`.
 *  - This ensures the chosen variant persists across future visits without leaking the
 *    query param to analytics/canonical URLs.
 *
 * Scope
 *  - Applies to /landing/:slug* paths only.
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const { pathname, searchParams } = url;

  // Only handle /landing/... paths
  if (!pathname.startsWith('/landing/')) return NextResponse.next();

  const v = searchParams.get('v');
  if (!v) return NextResponse.next();

  // Extract slug between /landing/ and the next slash (or end)
  const match = pathname.match(/^\/landing\/([^/]+)/);
  const slug = match?.[1];
  if (!slug) return NextResponse.next();

  // Create a clean URL without the `v` param
  const clean = new URL(url);
  clean.searchParams.delete('v');

  const res = NextResponse.redirect(clean, { status: 307 });
  res.cookies.set(`ofroot_variant_${slug}`, v, {
    path: '/',
    httpOnly: false,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  return res;
}

export const config = {
  matcher: ['/landing/:path*'],
};
