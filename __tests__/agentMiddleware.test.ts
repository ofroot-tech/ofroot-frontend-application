/** @jest-environment node */

import type { NextRequest } from 'next/server';
import { middleware } from '@/middleware';

jest.mock('next/server', () => {
  class NextResponse extends Response {
    cookies = { set: (name: string, value: string) => this.headers.set('set-cookie', `${name}=${value}`) };
    static next() { return new NextResponse(null, { headers: { 'x-middleware-next': '1' } }); }
    static redirect(url: URL, { status }: { status: number }) { return new NextResponse(null, { status, headers: { location: url.href } }); }
  }
  return { NextResponse };
}, { virtual: true });

function request(path: string, accept = 'text/html', method = 'GET') {
  const url = new URL(path, 'https://www.ofroot.technology');
  return Object.assign(new Request(url, { method, headers: { accept } }), { nextUrl: url }) as NextRequest;
}

describe('agent readiness middleware routing', () => {
  it('serves public page-specific Markdown with cache negotiation and no cookies', async () => {
    const response = middleware(request('/services/automation-systems?source=test', 'text/markdown'));
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('text/markdown; charset=utf-8');
    expect(response.headers.get('vary')).toBe('Accept');
    expect(response.headers.get('set-cookie')).toBeNull();
    const text = await response.text();
    expect(text).toContain('https://www.ofroot.technology/services/automation-systems');
    expect(text).not.toContain('source=test');
  });

  it('keeps browser HTML rendering and adds discoverable alternate headers', () => {
    const response = middleware(request('/'));
    expect(response.headers.get('x-middleware-next')).toBe('1');
    expect(response.headers.get('content-type')).toBeNull();
    expect(response.headers.get('link')).toContain('/llms.txt');
    expect(response.headers.get('vary')).toBe('Accept');
  });

  it.each(['/dashboard', '/api/sales-inquiry', '/auth/login', '/services/unknown'])('does not expose Markdown for %s', path => {
    const response = middleware(request(path, 'text/markdown'));
    expect(response.headers.get('x-middleware-next')).toBe('1');
    expect(response.headers.get('link')).toBeNull();
  });

  it('leaves public mutation requests to the application', () => {
    const response = middleware(request('/', 'text/markdown', 'POST'));
    expect(response.headers.get('x-middleware-next')).toBe('1');
    expect(response.headers.get('content-signal')).toBeNull();
  });

  it('serves the custom robots policy and honors HEAD without a body', async () => {
    const get = middleware(request('/robots.txt'));
    const head = middleware(request('/robots.txt', 'text/plain', 'HEAD'));
    expect(await get.text()).toContain('Content-Signal: search=yes, ai-input=yes, ai-train=no');
    expect(get.headers.get('content-type')).toBe('text/plain; charset=utf-8');
    expect(await head.text()).toBe('');
    expect(head.headers.get('content-signal')).toBe(get.headers.get('content-signal'));
  });

  it('preserves landing variant redirects, other query values, and the variant cookie', () => {
    const response = middleware(request('/landing/hvac?v=B&utm_source=test'));
    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('https://www.ofroot.technology/landing/hvac?utm_source=test');
    expect(response.headers.get('set-cookie')).toContain('ofroot_variant_hvac=B');
  });
});
