// app/auth/login/page.tsx
//
// Sign-in — Familiar, fast, and brand-aligned
// ------------------------------------------------------------
// We mirror the subscription page structure for consistency: a confident hero,
// the form in a subtle card, and a sticky value/assistance aside.

import LoginForm from '@/components/LoginForm';
import Link from 'next/link';
import FlashToast from '@/components/FlashToast';
// PublicNavbar removed — global Navbar renders in app/layout

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function LoginPage({ searchParams }: { searchParams?: SearchParams }) {
  const sp = (await searchParams) || {};
  const flash = typeof sp.flash === 'string' ? sp.flash : undefined;

  return (
    <div className="relative">
      
      {/* Background flourish for subtle depth */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(0,0,0,0.06),transparent_50%)]" />

      <div className="mx-auto max-w-6xl px-4 md:px-6 pt-20 md:pt-24 pb-12 md:pb-16">
        <FlashToast flash={flash} />
        <header className="mb-8 md:mb-12">
          <h1 className="text-balance text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-b from-black to-gray-700 bg-clip-text text-transparent">Sign in</span>
          </h1>
          <p className="mt-3 text-base sm:text-lg text-gray-600 max-w-2xl">Welcome back. Access your dashboard and keep moving fast.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-start">
          <section className="rounded-xl border bg-white/80 backdrop-blur p-5 sm:p-6 shadow-sm">
            <LoginForm />
            <p className="mt-5 text-sm text-gray-600">
              No account? <Link href="/subscribe" className="underline">Create one</Link>
            </p>
          </section>

          <aside className="md:sticky md:top-24 space-y-4 text-sm text-gray-700">
            <div className="rounded-xl border p-5 bg-white/80 backdrop-blur shadow-sm">
              <div className="font-medium">What you get</div>
              <ul className="mt-2 space-y-2 text-gray-600">
                <li className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-gray-400" /> <span>Secure authentication and role-based access</span></li>
                <li className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-gray-400" /> <span>Admin dashboard with metrics and user management</span></li>
                <li className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-gray-400" /> <span>Tenants and subscribers pages</span></li>
                <li className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-gray-400" /> <span>Observability with Sentry</span></li>
              </ul>
            </div>
            <div className="rounded-xl border p-5 bg-white/80 backdrop-blur shadow-sm">
              <div className="font-medium">Need help?</div>
              <p className="mt-1 text-gray-600">Contact support and we’ll get you set up quickly.</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
