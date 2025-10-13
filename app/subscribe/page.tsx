// app/subscribe/page.tsx
//
// Subscription Entry — A Frictionless Onramp
// ------------------------------------------------------------
// In a SaaS, the subscription page is the front door for new accounts.
// Our working definition: users subscribe (free tier for now), receive a
// safe default role (member), and are authenticated immediately.
//
// Design principles (as prose, per literate programming):
// - Visual hierarchy: a confident hero, then the form.
// - Reduced friction: minimal fields, familiar pricing controls.
// - Accessibility: semantic headings, readable contrast, keyboardable UI.
// - Honesty: zero fake promises; the right column lists what’s actually included.

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { TOKEN_COOKIE_NAME, LEGACY_COOKIE_NAME } from '@/app/lib/cookies';
import SubscribeForm from '@/components/SubscribeForm';
import PublicNavbar from '@/app/components/PublicNavbar';

export default async function SubscribePage() {
  // Server-side guard: if already authenticated, take them to the dashboard.
  const store = await cookies();
  const token = store.get(TOKEN_COOKIE_NAME)?.value || store.get(LEGACY_COOKIE_NAME)?.value;
  if (token) redirect('/dashboard/overview');

  // The page renders a compact, approachable form. We pair it with a benefits
  // column that stays visible (sticky) on taller screens to reinforce value.
  return (
    <div className="relative">
      <PublicNavbar />
      {/* Background flourish for subtle depth */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(0,0,0,0.06),transparent_50%)]" />

      <div className="mx-auto max-w-6xl px-4 md:px-6 pt-20 md:pt-24 pb-12 md:pb-16">
        <header className="mb-8 md:mb-12">
          <h1 className="text-balance text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-b from-black to-gray-700 bg-clip-text text-transparent">Start your subscription</span>
          </h1>
          <p className="mt-3 text-base sm:text-lg text-gray-600 max-w-2xl">Pick a plan, create your account, and get started in minutes.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-start">
          <section className="rounded-xl border bg-white/80 backdrop-blur p-5 sm:p-6 shadow-sm">
            {/* We keep the form self-contained and accessible. */}
            <SubscribeForm />
            <p className="mt-5 text-sm text-gray-600">Already have an account? <a className="underline" href="/auth/login">Sign in</a></p>
          </section>

          <aside className="md:sticky md:top-24 space-y-4 text-sm text-gray-700">
            <div className="rounded-xl border p-5 bg-white/80 backdrop-blur shadow-sm">
              <div className="font-medium">What’s included</div>
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
            <div className="rounded-xl border p-5 bg-white/80 backdrop-blur shadow-sm">
              <div className="font-medium">Why teams choose us</div>
              <p className="mt-1 text-gray-600">Fast setup, hardened auth, and a production-ready admin so you can focus on your product.</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
