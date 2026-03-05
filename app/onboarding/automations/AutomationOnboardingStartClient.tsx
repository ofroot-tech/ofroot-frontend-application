'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/Toaster';

type Channel = 'instagram' | 'facebook' | 'both';

type StartForm = {
  full_name: string;
  business_email: string;
  company_name: string;
  primary_channel: Channel;
  consent: boolean;
};

const SERVICES_PATH = '/onboarding/automations/services';
const emailRegex = /^\S+@\S+\.\S+$/;
const sentEmailsStorageKey = 'ofroot.automationOnboarding.abandonedCapture';
const INACTIVITY_SECONDS = Math.max(
  20,
  Number.parseInt(process.env.NEXT_PUBLIC_ONBOARDING_ABANDON_SECONDS || '60', 10) || 60
);
const INACTIVITY_MS = INACTIVITY_SECONDS * 1000;

export default function AutomationOnboardingStartClient({ expired = false }: { expired?: boolean }) {
  const router = useRouter();
  const inflightRef = useRef(false);
  const inactivityTimerRef = useRef<number | null>(null);
  const trackingStoppedRef = useRef(false);
  const formRef = useRef<StartForm>({
    full_name: '',
    business_email: '',
    company_name: '',
    primary_channel: 'both',
    consent: false,
  });

  const [form, setForm] = useState<StartForm>({
    full_name: '',
    business_email: '',
    company_name: '',
    primary_channel: 'both',
    consent: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const validEmail = useMemo(() => emailRegex.test(form.business_email.trim()), [form.business_email]);
  const hasName = useMemo(() => form.full_name.trim().length > 0, [form.full_name]);
  useEffect(() => {
    formRef.current = form;
  }, [form]);

  function getSentKeys(): string[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = sessionStorage.getItem(sentEmailsStorageKey);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed.map((x) => String(x).toLowerCase()) : [];
    } catch {
      return [];
    }
  }

  function markSent(key: string) {
    if (typeof window === 'undefined') return;
    const lower = key.toLowerCase();
    const existing = getSentKeys();
    if (existing.includes(lower)) return;
    const next = [...existing, lower].slice(-50);
    sessionStorage.setItem(sentEmailsStorageKey, JSON.stringify(next));
  }

  function hasSent(key: string) {
    return getSentKeys().includes(key.toLowerCase());
  }

  function getCaptureKey(email: string) {
    return `start:${email.toLowerCase()}`;
  }

  function clearInactivityTimer() {
    if (inactivityTimerRef.current != null) {
      window.clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
  }

  async function sendCapture(reason: 'inactivity' | 'pagehide' | 'beforeunload' | 'visibility_hidden') {
    if (trackingStoppedRef.current) return;
    const snapshot = formRef.current;
    const email = snapshot.business_email.trim().toLowerCase();
    const fullName = snapshot.full_name.trim();
    if (!emailRegex.test(email)) return;
    if (!fullName) return;
    const captureKey = getCaptureKey(email);
    if (hasSent(captureKey)) return;
    if (inflightRef.current) return;
    inflightRef.current = true;

    const payload = {
      stage: 'start',
      business_email: email,
      full_name: fullName,
      company_name: snapshot.company_name.trim(),
      primary_channel: snapshot.primary_channel,
      consent: snapshot.consent,
      reason,
      inactivity_seconds: INACTIVITY_SECONDS,
      path: '/onboarding/automations',
    };

    try {
      if (reason !== 'inactivity' && typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
        const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
        navigator.sendBeacon('/api/automation-onboarding/capture-email', blob);
        return;
      }

      const res = await fetch('/api/automation-onboarding/capture-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: reason !== 'inactivity',
      });
      const body = await res.json().catch(() => ({}));
      if (res.ok && body?.ok) {
        markSent(captureKey);
      }
    } catch {
      // Ignore capture failures; onboarding flow should remain uninterrupted.
    } finally {
      inflightRef.current = false;
    }
  }

  function resetInactivityTimer() {
    if (trackingStoppedRef.current) return;
    const fullName = formRef.current.full_name.trim();
    if (!fullName) return;
    const email = formRef.current.business_email.trim().toLowerCase();
    if (!emailRegex.test(email)) return;
    const captureKey = getCaptureKey(email);
    if (hasSent(captureKey)) return;
    clearInactivityTimer();
    inactivityTimerRef.current = window.setTimeout(() => {
      void sendCapture('inactivity');
    }, INACTIVITY_MS);
  }

  useEffect(() => {
    if (validEmail && hasName) resetInactivityTimer();
    else clearInactivityTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validEmail, hasName, form.business_email, form.full_name]);

  useEffect(() => {
    const onActivity = () => resetInactivityTimer();
    const handlePageHide = () => { void sendCapture('pagehide'); };
    const handleBeforeUnload = () => { void sendCapture('beforeunload'); };
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') void sendCapture('visibility_hidden');
      else resetInactivityTimer();
    };
    const events: Array<keyof WindowEventMap> = ['keydown', 'mousedown', 'mousemove', 'touchstart', 'scroll'];
    for (const evt of events) window.addEventListener(evt, onActivity, { passive: true });
    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      for (const evt of events) window.removeEventListener(evt, onActivity);
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInactivityTimer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function validateLocal(input: StartForm) {
    const next: Record<string, string> = {};
    if (!input.full_name.trim()) next.full_name = 'Full name is required';
    if (!input.business_email.trim()) next.business_email = 'Business email is required';
    else if (!/^\S+@\S+\.\S+$/.test(input.business_email)) next.business_email = 'Enter a valid email';
    if (!input.company_name.trim()) next.company_name = 'Company name is required';
    if (!input.consent) next.consent = 'You must agree to continue';
    return next;
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const localErrors = validateLocal(form);
    setErrors(localErrors);
    setFormError('');
    if (Object.keys(localErrors).length > 0) {
      toast({ type: 'error', title: 'Missing required fields', message: 'Please complete all required onboarding fields.' });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/automation-onboarding/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, next: SERVICES_PATH }),
      });

      const body = await res.json().catch(() => ({}));
      if (!res.ok || !body?.ok) {
        const details = (body?.error?.details || {}) as Record<string, string>;
        if (Object.keys(details).length) setErrors(details);
        const msg = body?.error?.message || 'Could not start onboarding';
        setFormError(msg);
        toast({ type: 'error', title: 'Onboarding start failed', message: msg });
        return;
      }

      trackingStoppedRef.current = true;
      clearInactivityTimer();
      const needsAccount = Boolean(body?.data?.requiresAccountCreation);
      toast({
        type: 'success',
        title: 'Onboarding started',
        message: needsAccount
          ? 'Create your account to finish your automation setup.'
          : 'Sign in to finish your automation setup.',
      });
      const nextUrl = body?.data?.next || `/auth/login?next=${encodeURIComponent(SERVICES_PATH)}`;
      router.push(nextUrl);
    } catch {
      const msg = 'Could not start onboarding. Please try again.';
      setFormError(msg);
      toast({ type: 'error', title: 'Network error', message: msg });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-bold text-slate-900">Automation onboarding</h1>
      <p className="mt-3 text-slate-600">
        Start with your basic details, then sign in to complete your automation services setup.
      </p>

      {expired ? (
        <div className="mt-4 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Your onboarding session expired. Please complete this first step again.
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="mt-8 space-y-5 rounded-xl border bg-white p-6 shadow-sm">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="full_name">Full name</label>
          <p className="mb-1 text-xs text-slate-500">Use the primary contact person for this automation project.</p>
          <input
            id="full_name"
            value={form.full_name}
            onChange={(e) => setForm((prev) => ({ ...prev, full_name: e.target.value }))}
            placeholder="e.g., Jane Smith"
            className="w-full rounded-md border px-3 py-2"
          />
          {errors.full_name ? <p className="mt-1 text-sm text-red-600">{errors.full_name}</p> : null}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="business_email">Business email</label>
          <p className="mb-1 text-xs text-slate-500">We use this for login setup and onboarding follow-up.</p>
          <input
            id="business_email"
            type="email"
            value={form.business_email}
            onChange={(e) => setForm((prev) => ({ ...prev, business_email: e.target.value }))}
            placeholder="name@company.com"
            className="w-full rounded-md border px-3 py-2"
          />
          {errors.business_email ? <p className="mt-1 text-sm text-red-600">{errors.business_email}</p> : null}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="company_name">Company name</label>
          <p className="mb-1 text-xs text-slate-500">The brand or legal business name we should reference.</p>
          <input
            id="company_name"
            value={form.company_name}
            onChange={(e) => setForm((prev) => ({ ...prev, company_name: e.target.value }))}
            placeholder="e.g., Acme Home Services"
            className="w-full rounded-md border px-3 py-2"
          />
          {errors.company_name ? <p className="mt-1 text-sm text-red-600">{errors.company_name}</p> : null}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="primary_channel">Primary channel</label>
          <p className="mb-1 text-xs text-slate-500">Pick where most leads currently come from.</p>
          <select
            id="primary_channel"
            value={form.primary_channel}
            onChange={(e) => setForm((prev) => ({ ...prev, primary_channel: e.target.value as Channel }))}
            className="w-full rounded-md border px-3 py-2"
          >
            <option value="instagram">Instagram</option>
            <option value="facebook">Facebook</option>
            <option value="both">Both</option>
          </select>
        </div>

        <label className="flex items-start gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={form.consent}
            onChange={(e) => setForm((prev) => ({ ...prev, consent: e.target.checked }))}
            className="mt-1"
          />
          <span>I agree to share this information so OfRoot can start automation planning and contact me about setup.</span>
        </label>
        {errors.consent ? <p className="text-sm text-red-600">{errors.consent}</p> : null}

        {formError ? <p className="text-sm text-red-600">{formError}</p> : null}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-[#FF9312] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#E07F00] disabled:opacity-60"
        >
          {submitting ? 'Saving...' : 'Continue to sign in'}
        </button>
      </form>
    </div>
  );
}
