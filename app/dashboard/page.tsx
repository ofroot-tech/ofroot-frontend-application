// app/dashboard/page.tsx
// Example authed page that fetches current user via route handler, SSR.

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

async function getUser() {
  const h = await headers();
  const host = h.get('host');
  const proto = h.get('x-forwarded-proto') || 'http';
  const base = `${proto}://${host}`;
  const res = await fetch(`${base}/api/auth/me`, {
    cache: 'no-store',
    headers: {
      // Forward cookies so route can read auth token
      cookie: h.get('cookie') || '',
    },
  });
  if (!res.ok) return null;
  const body = await res.json();
  return body?.data ?? null;
}

export default async function DashboardPage() {
  const user = await getUser();

  if (!user) {
    redirect('/auth/login');
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-16 space-y-4">
      <h1 className="text-2xl font-semibold">Welcome, {user.name}</h1>
      <p className="text-gray-600">Email: {user.email}</p>
      <form action="/api/auth/logout" method="post">
        <button type="submit" className="rounded bg-black text-white px-3 py-2">Logout</button>
      </form>
    </div>
  );
}
