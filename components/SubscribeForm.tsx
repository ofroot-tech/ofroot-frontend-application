"use client";

/**
 * SubscribeForm — A Typical SaaS Subscription Onramp
 * ------------------------------------------------------------
 * Design goals (marketing + UX):
 * - Familiar pricing selector (Free • Pro • Business) with monthly/yearly toggle.
 * - Simple account form; clear promise: no credit card required for Free.
 * - Honest, minimal friction: default safe role set by backend; cookie set by proxy.
 * - Accessibility: real radio buttons for plan selection, labels, and live regions.
 * - Security: honeypot field to deter basic signup bots.
 * - Literate structure: comments explain purpose so code is readable as prose.
 */
import { useForm } from 'react-hook-form';
import { useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/Toaster';
import api from '@/app/utils/api';
import { trackCtaClick, track } from '@/app/lib/ab';
import type { ProductConfig } from '@/app/config/products';
import { useUnsavedChangesPrompt } from '@/app/hooks/useUnsavedChangesPrompt';

interface SubscribeInputs {
  name: string;
  email: string;
  password: string;
  // optional marketing field; not required/backed yet
  coupon?: string;
  // honeypot (hidden)
  company?: string;
}

type PlanId = 'pro' | 'business';

const BASE_PLANS: Array<{
  id: PlanId;
  name: string;
  priceMonthly: string;
  priceYearly: string;
  features: string[];
  recommended?: boolean;
}> = [
  { id: 'pro', name: 'Pro', priceMonthly: '$49', priceYearly: '$490', features: ['Unlimited projects', 'Priority support', 'Advanced analytics'], recommended: true },
  { id: 'business', name: 'Business', priceMonthly: '$99', priceYearly: '$990', features: ['SSO & Roles', 'Audit logs', 'SLA support'] },
];

function scorePassword(pw: string): number {
  // A tiny, readable heuristic: length + diversity signals
  let s = 0;
  if (pw.length >= 8) s += 1;
  if (pw.length >= 12) s += 1;
  if (/[A-Z]/.test(pw)) s += 1;
  if (/[a-z]/.test(pw)) s += 1;
  if (/\d/.test(pw)) s += 1;
  if (/[^A-Za-z0-9]/.test(pw)) s += 1;
  return Math.min(s, 5);
}

export default function SubscribeForm({ productConfig }: { productConfig?: ProductConfig }) {
  const { register, handleSubmit, watch, formState } = useForm<SubscribeInputs>({ mode: 'onBlur' });
  const { errors } = formState;
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [plan, setPlan] = useState<PlanId>((productConfig?.defaultPlan as PlanId) || 'pro');
  const [accept, setAccept] = useState(false);
  const [showPw, setShowPw] = useState(false);
  // Sales inquiries use external JotForm now
  const SALES_URL = 'https://form.jotform.com/252643426225151';
  const announceRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const password = watch('password') || '';
  const pwScore = useMemo(() => scorePassword(password), [password]);

  // Resolve plan prices with optional per-product overrides
  const PLANS = useMemo(() => {
    return BASE_PLANS.map((p) => {
      const override = productConfig?.planPrices && (productConfig.planPrices as any)[p.id] as { monthly?: string; yearly?: string } | undefined;
      const priceMonthly = override?.monthly || p.priceMonthly;
      const priceYearly = override?.yearly || p.priceYearly;
      return { ...p, priceMonthly, priceYearly };
    });
  }, [productConfig]);

  // Unsaved changes detection: if any fields filled or non-default selection
  const watchedName = watch('name') || '';
  const watchedEmail = watch('email') || '';
  const watchedCoupon = watch('coupon') || '';
  const dirty = Boolean(watchedName || watchedEmail || password || watchedCoupon || plan !== ((productConfig?.defaultPlan as PlanId) || 'pro') || billingCycle !== 'monthly');
  useUnsavedChangesPrompt(dirty && !loading);

  const onSubmit = async (data: SubscribeInputs) => {
    try {
      setLoading(true);
      setError('');

      // Simple honeypot: if filled, fail fast.
      if (data.company && data.company.trim().length > 0) {
        throw new Error('Invalid submission');
      }

      // Derive product context from URL if present (?product=ontask|helpr|...)
      let product: string | undefined;
      try {
        const sp = new URLSearchParams(window.location.search);
        const p = sp.get('product');
        if (p) product = p.toLowerCase();
      } catch {}

      const res = await fetch('/api/subscribe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: data.name, email: data.email, password: data.password, plan, billingCycle, coupon: data.coupon, product }),
      });

      const body = await res.json().catch(() => ({}));
      if (!res.ok || !body?.url) {
        throw new Error(body?.error?.message || 'Unable to start checkout');
      }

      toast({ type: 'success', title: 'Checkout', message: 'Redirecting to secure payment…' });
      window.location.href = body.url as string;
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || err?.response?.data?.message || err?.message || 'Subscription failed';
      setError(msg);
      toast({ type: 'error', title: 'Subscription failed', message: msg });
    } finally {
      setLoading(false);
    }
  };

  // Small helper to announce plan/price updates to screen readers
  function announce(text: string) {
    if (announceRef.current) announceRef.current.textContent = text;
  }

  const cta = 'Start subscription';

  // Consistent form input styling
  const baseInput = 'w-full rounded-lg border border-gray-300 px-3 py-2.5 text-[15px] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-colors disabled:opacity-60 disabled:cursor-not-allowed';
  const inputClass = (hasError?: boolean) => `${baseInput} ${hasError ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`;

  return (
    <div className="space-y-6">
  {/* Billing cycle toggle */}
  <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-sm" role="group" aria-label="Billing cycle">
        <button
          type="button"
          onClick={() => { setBillingCycle('monthly'); announce('Monthly billing selected'); track({ category: 'ab', action: 'billing_toggle', label: 'monthly' }); }}
          aria-pressed={billingCycle === 'monthly'}
          className={`rounded-md border px-3 py-1.5 ${billingCycle === 'monthly' ? 'bg-black text-white' : 'bg-white hover:bg-gray-50'}`}
        >
          Monthly
        </button>
        <button
          type="button"
          onClick={() => { setBillingCycle('yearly'); announce('Yearly billing selected. Two months free'); track({ category: 'ab', action: 'billing_toggle', label: 'yearly' }); }}
          aria-pressed={billingCycle === 'yearly'}
          className={`rounded-md border px-3 py-1.5 ${billingCycle === 'yearly' ? 'bg-black text-white' : 'bg-white hover:bg-gray-50'}`}
        >
          Yearly
        </button>
        {/* More prominent savings badge */}
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0c5132] bg-[#d1fae5] border border-[#10b981]/40 rounded-full px-2 py-0.5 mt-2 sm:mt-0">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 6L9 17l-5-5" stroke="#065f46" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Save 2 months with yearly
        </span>
      </div>

      {/* Plans grid using accessible radio cards */}
      <fieldset className="grid grid-cols-1 sm:grid-cols-2 gap-4" aria-label="Select a plan">
        <legend className="sr-only">Plan</legend>
        {PLANS.map((p) => {
          const price = billingCycle === 'monthly' ? p.priceMonthly : p.priceYearly;
          const active = plan === p.id;
          const recommended = Boolean(p.recommended);
          const badgeId = `plan-${p.id}-badge`;
          const isBusiness = p.id === 'business';
          return (
            <label
              key={p.id}
              className={
                `relative cursor-pointer text-left rounded-lg border p-4 block overflow-hidden transition-colors min-h-[280px] ${
                  active
                    ? 'ring-2 ring-black bg-white'
                    : recommended
                      ? 'border-gray-300 bg-white'
                      : 'hover:bg-gray-50'
                }`
              }
            >
              <input
                type="radio"
                name="plan"
                value={p.id}
                className="sr-only"
                checked={active}
                onChange={(e) => {
                  if (isBusiness) {
                    e.preventDefault();
                    announce('Business plan selected — opening contact form');
                    track({ category: 'cta', action: 'plan_select', label: 'business' });
                    window.open(SALES_URL, '_blank', 'noopener,noreferrer');
                    return;
                  }
                  setPlan(p.id);
                  announce(`${p.name} plan selected at ${price} per ${billingCycle === 'monthly' ? 'month' : 'year'}`);
                  track({ category: 'cta', action: 'plan_select', label: p.id });
                }}
                aria-checked={active}
                aria-describedby={recommended ? badgeId : undefined}
              />
              {/* Top-left "Most popular" pill for Pro */}
              {recommended && (
                <span
                  id={badgeId}
                  className="absolute left-3 top-3 inline-flex items-center rounded-full bg-black text-white px-2 py-0.5 text-[10px] font-medium leading-4 whitespace-nowrap select-none"
                >
                  Most popular
                </span>
              )}

              {/* Top-right yearly savings chip per screenshot */}
              {billingCycle === 'yearly' && (
                <span className="absolute right-3 top-3 inline-flex items-center rounded-full bg-[#fef3c7] text-[#92400e] px-2 py-0.5 text-[10px] font-medium leading-4 select-none max-sm:hidden">2 mo</span>
              )}

              {/* Title row */}
              <div className="flex items-center justify-between">
                <div className="font-medium">{p.name}</div>
              </div>

              <div className="mt-1 text-2xl font-semibold flex items-center gap-2">
                <span>{price}</span>
                <span className="text-sm text-gray-500">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                {billingCycle === 'yearly' && (
                  (() => {
                    const m = Number((p.priceMonthly || '').replace(/[^\d.]/g, ''));
                    const y = Number((p.priceYearly || '').replace(/[^\d.]/g, ''));
                    if (m > 0 && y > 0) {
                      const pct = Math.round((1 - (y / (m * 12))) * 100);
                      if (isFinite(pct) && pct > 0) {
                        return <span className="ml-1 inline-flex items-center rounded-full bg-[#dcfce7] text-[#065f46] px-2 py-0.5 text-[10px] font-medium leading-4 whitespace-nowrap select-none">Save {pct}%</span>;
                      }
                    }
                    return null;
                  })()
                )}
              </div>
              {billingCycle === 'yearly' && (
                <div className="text-[11px] text-gray-500">≈ {(Number((p.priceYearly || '').replace(/[^\d.]/g, ''))/12).toLocaleString(undefined,{style:'currency',currency:'USD'})}/mo</div>
              )}
              <ul className="mt-2 text-sm text-gray-600 space-y-1">
                {p.features.map((f) => (<li key={f}>• {f}</li>))}
              </ul>
              {isBusiness && (
                <div className="mt-3">
                  <a href={SALES_URL} target="_blank" rel="noopener noreferrer" className="text-sm underline">Talk to sales</a>
                </div>
              )}
              <div className="sr-only">{active ? 'Selected' : 'Not selected'}</div>
            </label>
          );
        })}
      </fieldset>

      {/* Screen reader live announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only" ref={announceRef} />

      {/* Account form */}
      <form id="subscribe-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 scroll-mt-24" noValidate>
        {/* Sales handled via external contact form */}
        {/* Hidden fields to ensure Next API receives plan info even if we convert to FormData later */}
        <input type="hidden" name="plan" value={plan} />
        <input type="hidden" name="billingCycle" value={billingCycle} />
        <div>
          <label htmlFor="name" className="sr-only">Name</label>
          <input id="name" {...register('name', { required: 'Please enter your name' })} type="text" placeholder="Name" className={inputClass(!!errors.name)} aria-invalid={!!errors.name} aria-describedby={errors.name ? 'name-error' : undefined} required />
          {errors.name && <p id="name-error" className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
        </div>
        <div>
          <label htmlFor="email" className="sr-only">Email</label>
          <input id="email" {...register('email', { required: 'Please enter a valid email' })} type="email" placeholder="Email" className={inputClass(!!errors.email)} aria-invalid={!!errors.email} aria-describedby={errors.email ? 'email-error' : undefined} required />
          {errors.email && <p id="email-error" className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
        </div>
        <div>
          <label htmlFor="password" className="sr-only">Password</label>
          <div className="relative">
            <input id="password" {...register('password', { required: 'Please choose a password', minLength: { value: 8, message: 'Use at least 8 characters' } })} type={showPw ? 'text' : 'password'} placeholder="Password" className={`${inputClass(!!errors.password)} pr-24`} aria-invalid={!!errors.password} aria-describedby={errors.password ? 'password-error' : 'password-help'} required minLength={8} />
            <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 text-xs underline" aria-pressed={showPw} aria-label={showPw ? 'Hide password' : 'Show password'}>{showPw ? 'Hide' : 'Show'}</button>
          </div>
          {/* Password strength meter */}
          <div className="mt-1 h-1 w-full bg-gray-200 rounded" aria-hidden>
            <div className={`h-1 rounded ${pwScore <= 2 ? 'bg-red-500' : pwScore === 3 ? 'bg-yellow-500' : 'bg-green-600'}`} style={{ width: `${(pwScore / 5) * 100}%` }} />
          </div>
          <div id="password-help" className="mt-1 text-xs text-gray-500">Use 12+ chars, with upper/lowercase, number, and symbol.</div>
          {errors.password && <p id="password-error" className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
        </div>
        {/* Optional coupon — note: applied at billing stage when using paid plans */}
        <div>
          <label htmlFor="coupon" className="sr-only">Coupon</label>
          <input id="coupon" {...register('coupon')} type="text" placeholder={'Coupon (optional)'} className={baseInput} />
          <p className="mt-1 text-xs text-gray-500">Trial eligible coupons apply at the end of your trial.</p>
        </div>
        {/* Honeypot */}
        <div style={{ position: 'absolute', left: '-9999px' }} aria-hidden>
          <label htmlFor="company">Company</label>
          <input id="company" {...register('company')} type="text" tabIndex={-1} autoComplete="off" />
        </div>
        {/* Terms */}
        <label className="text-sm text-gray-700 inline-flex items-center gap-2">
          <input type="checkbox" checked={accept} onChange={(e) => setAccept(e.currentTarget.checked)} />
          I agree to the <a className="underline" href="/legal/terms">Terms</a> and <a className="underline" href="/legal/privacy">Privacy</a>.
        </label>
        {error && <p className="text-red-600 text-sm" role="alert" aria-live="polite">{error}</p>}
        <button
          type="submit"
          disabled={loading || !accept}
          className={`p-2 rounded ${loading || !accept ? 'bg-gray-300 text-gray-600' : 'bg-black text-white'}`}
          onClick={() => trackCtaClick({ slug: 'subscribe', label: 'start_trial' })}
        >
          {loading ? 'Creating account…' : cta}
        </button>
        <p className="text-[11px] text-gray-500">Trusted by 300+ contractors. Secure Stripe checkout.</p>
        {/* Honest fine print */}
        <p className="text-xs text-gray-500">
          Pay the first period today. Future renewals follow your {billingCycle} cadence. Cancel anytime before the next renewal.
        </p>
      </form>
    </div>
  );
}
