import Link from 'next/link';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

export default async function SessionDebugPage() {
  let status = 0;
  let data: any = null;
  let error: string | null = null;

  try {
    const h = await headers();
    const host = h.get('host');
    const proto = h.get('x-forwarded-proto') || 'http';
    const base = `${proto}://${host}`;
    const res = await fetch(`${base}/api/auth/me`, {
      cache: 'no-store',
      headers: { cookie: h.get('cookie') || '' },
    });
    status = res.status;
    try {
      data = await res.json();
    } catch (_) {
      data = null;
    }
  } catch (e: any) {
    error = e?.message || String(e);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 space-y-6">
      <h1 className="text-2xl font-semibold">Session Debug</h1>

      <div className="space-y-2">
        <p><span className="font-medium">/api/auth/me status:</span> {status || 'n/a'}</p>
        {error && <p className="text-red-600">Fetch error: {error}</p>}
      </div>

      <div>
        <p className="font-medium mb-2">/api/auth/me response:</p>
        <pre className="whitespace-pre-wrap rounded border bg-gray-50 p-3 text-sm">
{JSON.stringify(data, null, 2)}
        </pre>
      </div>

      <div className="flex items-center gap-4">
        <Link className="underline" href="/auth/login">Go to Login</Link>
        <Link className="underline" href="/auth/register">Go to Register</Link>
        <form action="/api/auth/logout" method="post">
          <button className="rounded bg-black text-white px-3 py-1" type="submit">Logout</button>
        </form>
      </div>

      <p className="text-sm text-gray-600">Tip: After logging in, revisit this page to see /api/auth/me return your user.</p>
    </div>
  );
}
