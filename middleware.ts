/**
 * Middleware: Landing variant stickiness (Knuth-style notes)
 *
 * Goal
 *  - If a landing URL includes a query param `v` (e.g. /landing/x?v=B), set a cookie
 *    `ofroot_variant_<slug>` to that value and redirect to the same URL without `v`.
 *  - This ensures the chosen variant persists across future visits without leaking the
 *    query param to analytics/canonical URLs.
 *
 * Public reading routes also expose a page-specific Markdown representation when
 * explicitly requested. No authenticated content or origin requests are involved.
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { agentDiscoveryHeaders, CONTENT_SIGNAL, markdownResponse } from '@/app/lib/agent-readiness';
import { agentRobotsText } from '@/app/lib/agent-robots';

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const { pathname, searchParams } = url;

  if (req.method === 'GET' || req.method === 'HEAD') {
    if (pathname === '/robots.txt') {
      return new NextResponse(req.method === 'HEAD' ? null : agentRobotsText(), {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Content-Signal': CONTENT_SIGNAL,
          'Cache-Control': 'public, max-age=3600',
          'X-Content-Type-Options': 'nosniff',
        },
      });
    }

    const markdown = markdownResponse(req.method, pathname, req.headers.get('accept'));
    if (markdown) return new NextResponse(markdown.body, { headers: markdown.headers });

    const discovery = agentDiscoveryHeaders(pathname);
    if (discovery) {
      const response = NextResponse.next();
      Object.entries(discovery).forEach(([name, value]) => response.headers.set(name, value));
      return response;
    }
  }

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
  matcher: ['/', '/robots.txt', '/services/:path*', '/solutions/:path*', '/insights/:path*', '/landing/:path*'],
};
