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
import { Suspense } from 'react';
import Link from 'next/link';
import { TOKEN_COOKIE_NAME, LEGACY_COOKIE_NAME } from '@/app/lib/cookies';
import SubscribeForm from '@/components/SubscribeForm';
// PublicNavbar removed — global Navbar renders in app/layout
import PromoBanner from '@/components/PromoBanner';
import BottomPromoBanner from '@/components/BottomPromoBanner';
import ClientViewPing from '@/components/ClientViewPing';
import AuditRequestButton from '@/components/AuditRequestButton';
import { PRODUCT_CATALOG, type ProductConfig } from '@/app/config/products';
import { api } from '@/app/lib/api';

export default async function SubscribePage({ searchParams }: { searchParams?: URLSearchParams | { [key: string]: string | string[] | undefined } | Promise<URLSearchParams | { [key: string]: string | string[] | undefined }> }) {
  // Server-side guard: if already authenticated, take them to the dashboard.
  const store = await cookies();
  const token = store.get(TOKEN_COOKIE_NAME)?.value || store.get(LEGACY_COOKIE_NAME)?.value;
  if (token) redirect('/dashboard/overview');

  // Next.js 15 may provide searchParams as a Promise. Await if needed.
  const awaited = (searchParams && typeof (searchParams as any)?.then === 'function')
    ? await (searchParams as Promise<URLSearchParams | { [key: string]: string | string[] | undefined }>)
    : (searchParams as URLSearchParams | { [key: string]: string | string[] | undefined } | undefined);
  let productParam: string | null | undefined;
  if (awaited && typeof (awaited as any).get === 'function') {
    productParam = (awaited as unknown as URLSearchParams).get('product');
  } else {
    const spObj = (awaited as { [key: string]: string | string[] | undefined } | undefined) || {};
    const maybe = spObj.product;
    productParam = Array.isArray(maybe) ? maybe[0] : maybe;
  }
  const productSlug = (productParam || '').toString().toLowerCase();
  const isOnTask = productSlug === 'ontask';
  // Try to fetch product details from backend; fallback to static catalog
  let productConfig: ProductConfig | undefined = productSlug ? PRODUCT_CATALOG[productSlug] : undefined;
  if (productSlug) {
    try {
      const items = await api.publicListProducts();
      const match = (items || []).find((p) => p.slug === productSlug);
      if (match) {
        const planPrices: ProductConfig['planPrices'] = {};
        (match.pricingRules || []).forEach((r) => {
          if (r.plan === 'pro' || r.plan === 'business') {
            const monthly = r.monthly != null ? String(r.monthly) : undefined;
            const yearly = r.yearly != null ? String(r.yearly) : undefined;
            if (monthly || yearly) {
              planPrices[r.plan] = {
                monthly: monthly ?? (productConfig?.planPrices?.[r.plan]?.monthly || ''),
                yearly: yearly ?? (productConfig?.planPrices?.[r.plan]?.yearly || ''),
              } as any;
            }
          }
        });
        productConfig = {
          slug: match.slug,
          kind: match.kind,
          name: match.name,
          anchorPrice: match.anchor_price ?? productConfig?.anchorPrice ?? '$49',
          heroTitle: match.hero_title ?? productConfig?.heroTitle,
          heroSubtitle: match.hero_subtitle ?? productConfig?.heroSubtitle,
          planPrices: Object.keys(planPrices).length ? planPrices : productConfig?.planPrices,
          includes: (match.includes && Array.isArray(match.includes) ? match.includes : productConfig?.includes) ?? [],
          defaultPlan: match.default_plan ?? productConfig?.defaultPlan,
        } as ProductConfig;
      }
    } catch {
      // Ignore network/JSON errors and keep static fallback
    }
  }
  // Anchor price derived from catalog (fallback to $49)
  const anchorPrice = productConfig?.anchorPrice || (isOnTask ? '$29' : '$49');
  // Precompute a single end date label so banners match exactly
  const end = new Date();
  end.setDate(end.getDate() + 5);
  const endStr = end.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });

  // The page renders a compact, approachable form. We pair it with a benefits
  // column that stays visible (sticky) on taller screens to reinforce value.
  return (
    <div className="relative snap-page" style={{ ['--chevron-bottom-offset' as any]: '18px', ['--chevron-top-offset' as any]: '18px', ['--chevron-glow-opacity' as any]: 0.9 }}>
      {/* Section 1: Promo banner + intro header */}
      <section data-snap-section className="section-full snap-fade">
        {/* Promo banner — client-rendered for date math and dismiss state */}
        <Suspense>
          <PromoBanner spaced anchorPrice={anchorPrice} endStr={endStr} />
        </Suspense>
        {/* Background flourish for subtle depth */}
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(0,0,0,0.06),transparent_50%)]" />

        <div className="mx-auto max-w-6xl px-4 md:px-6 pt-20 md:pt-24 pb-12 md:pb-16">
          {/* Fire a lightweight view event client-side */}
          <ClientViewPing />
          <header className="mb-8 md:mb-12">
            <h1 className="text-balance text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight">
              <span className="bg-gradient-to-b from-black to-gray-700 bg-clip-text text-transparent">{productConfig?.heroTitle || (isOnTask ? 'OnTask for home services' : 'Start your subscription')}</span>
            </h1>
            {productConfig?.heroSubtitle ? (
              <p className="mt-3 text-base sm:text-lg text-gray-700 max-w-2xl">{productConfig.heroSubtitle}</p>
            ) : (
              <p className="mt-3 text-base sm:text-lg text-gray-700 max-w-2xl">{isOnTask ? 'OnTask keeps home services steady: one calendar, estimates → invoices, Stripe payments, and a ladder to Plus and the 30-day pilot.' : 'Start on the full plan today. No trial gimmicks—just the complete product from day one.'}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">Secure Stripe checkout. Billing renews on your chosen cadence with easy cancellation before renewal.</p>
            <p className="mt-3 text-sm font-medium text-gray-700">{isOnTask ? 'Starter $29/month · Plus $299/month · Annual saves ~2 months · 30-day pilot from $12K.' : 'Trusted by local pros.'}</p>
          </header>
        </div>
      </section>

      {/* Section 2: Subscribe form + value column */}
      <section data-snap-section className="section-full snap-fade">
        <div className="mx-auto max-w-6xl px-4 md:px-6 pb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-start">
            <div className="rounded-xl border bg-white/80 backdrop-blur p-5 sm:p-6 shadow-sm">
              {/* We keep the form self-contained and accessible. */}
              <SubscribeForm productConfig={productConfig} />
              <div className="mt-4 text-sm text-gray-700">
                <div className="font-medium">Add modules anytime</div>
                <p className="mt-1">Start with a trial and add features, marketing, development capacity, or automation as you grow.</p>
                <a href="/services/add-ons" className="underline">See add‑ons</a>
              </div>
              <p className="mt-5 text-sm text-gray-600">Already have an account? <a className="underline" href="/auth/login">Sign in</a></p>
            </div>

            <aside className="md:sticky md:top-24 space-y-4 text-sm text-gray-700">
              <div className="rounded-xl border p-5 bg-white/80 backdrop-blur shadow-sm">
                <div className="font-medium">What’s included</div>
                <ul className="mt-2 space-y-2 text-gray-600">
                  {(productConfig?.includes || (isOnTask
                    ? [
                      'One calendar for jobs, crews, and follow-ups',
                      'Estimates → invoices → Stripe payments',
                      'Team messaging and reminders',
                      'Exports and customer history you own',
                    ]
                    : [
                      'Secure authentication and role-based access',
                      'Admin dashboard with metrics and user management',
                      'Tenants and subscribers pages',
                      'Observability with Sentry',
                    ])).map((inc) => (
                    <li key={inc} className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-gray-400" /> <span>{inc}</span></li>
                  ))}
                </ul>
              </div>
              {isOnTask && (
                <div className="rounded-xl border p-5 bg-emerald-50 backdrop-blur shadow-sm space-y-2">
                  <div className="text-sm font-semibold text-emerald-800">Add AI intake + routing</div>
                  <p className="text-sm text-gray-800">Keep OnTask for scheduling, estimates, and payments. When you’re ready, add the 30-day operator-led pilot for AI intake + routing.</p>
                  <p className="text-sm font-medium text-gray-900">Pilot: from $12K · 30 days · weekly demos</p>
                  <div className="flex flex-col sm:flex-row gap-2 text-sm font-semibold">
                    <Link href="/pricing#pilot" className="inline-flex items-center justify-center rounded-lg bg-gray-900 text-white px-4 py-2">See pilot pricing</Link>
                    <Link href="/consulting/book" className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-900 px-4 py-2 hover:bg-gray-50">Scope a pilot</Link>
                  </div>
                </div>
              )}
              {isOnTask && (
                <div className="rounded-xl border p-5 bg-white/80 backdrop-blur shadow-sm space-y-2">
                  <div className="text-sm font-semibold text-gray-900">Pricing progression</div>
                  <p className="text-sm text-gray-700">Starter $29/month for calendar, estimates → invoices, Stripe, and basic automations. Plus $299/month unlocks integrations, higher volume, and priority chat. Annual saves ~2 months.</p>
                  <p className="text-sm text-gray-700">When volume or integrations grow, step into the 30-day pilot (from $12K) and then a quarterly retainer.</p>
                  <div className="flex flex-col sm:flex-row gap-2 text-sm font-semibold">
                    <Link href="/subscribe?product=ontask" className="inline-flex items-center justify-center rounded-lg bg-black text-white px-4 py-2 hover:bg-gray-900">Start Starter</Link>
                    <Link href="/subscribe?product=ontask" className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-900 px-4 py-2 hover:bg-gray-50">Upgrade to Plus</Link>
                  </div>
                </div>
              )}
              {productConfig?.comparison && (
                <div className="rounded-xl border p-5 bg-white/80 backdrop-blur shadow-sm space-y-3">
                  <div className="font-medium">How we stack up to {productConfig.comparison.competitor}</div>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Matches</div>
                    <ul className="mt-1 space-y-2 text-gray-600">
                      {productConfig.comparison.parity.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-400" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">OnTask extras</div>
                    <ul className="mt-1 space-y-2 text-gray-600">
                      {productConfig.comparison.differentiators.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#20b2aa]" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              <div className="rounded-xl border p-5 bg-white/80 backdrop-blur shadow-sm">
                <div className="font-medium">Free AI audit (website + ads)</div>
                <p className="mt-1 text-gray-600">No‑cost review of your site and ad accounts. Get quick wins and a prioritized action list within 48 hours.</p>
                <p className="mt-2 text-gray-600">Ready to implement? Upgrade to the monthly plan and we’ll execute the recommendations for you.</p>
                {/* Inline client-only audit request button */}
                { }
                <AuditRequestButton />
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
      </section>

      {/* Section 3: Bottom promo banner */}
      <section data-snap-section className="section-full snap-fade">
        <div className="mx-auto max-w-6xl px-4 md:px-6 py-16">
          <Suspense>
            <BottomPromoBanner anchorPrice={anchorPrice} endStr={endStr} />
          </Suspense>
        </div>
      </section>
    </div>
  );
}

// (Client components moved to components/* and imported above.)
