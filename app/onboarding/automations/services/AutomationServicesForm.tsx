'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/Toaster';
import {
  AUTOMATION_CATALOG,
  type AutomationCatalogId,
} from '@/app/lib/automation-catalog';

type TriggerType = 'comments' | 'inbound_dm' | 'keyword' | 'form_submit';

const triggerOptions: Array<{ value: TriggerType; label: string }> = [
  { value: 'comments', label: 'Comments' },
  { value: 'inbound_dm', label: 'Inbound DM' },
  { value: 'keyword', label: 'Keyword' },
  { value: 'form_submit', label: 'Form submit' },
];

type Props = {
  businessEmail: string;
  fullName: string;
  companyName: string;
};

const defaultAutomationSelection: AutomationCatalogId[] = ['lead_capture_csv'];
const dmAutomationIds = new Set<AutomationCatalogId>([
  'instagram_dm_autoresponder',
  'facebook_dm_autoresponder',
]);

export default function AutomationServicesForm({ businessEmail, fullName, companyName }: Props) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');
  const inflightRef = useRef(false);
  const trackingStoppedRef = useRef(false);
  const inactivityTimerRef = useRef<number | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);

  const INACTIVITY_SECONDS = Math.max(
    20,
    Number.parseInt(process.env.NEXT_PUBLIC_ONBOARDING_ABANDON_SECONDS || '60', 10) || 60
  );
  const INACTIVITY_MS = INACTIVITY_SECONDS * 1000;
  const STORAGE_KEY = 'ofroot.automationOnboarding.abandonedCapture';
  const [autoResponseEnabled, setAutoResponseEnabled] = useState(false);
  const [csvCaptureEnabled, setCsvCaptureEnabled] = useState(true);
  const [selectedTriggers, setSelectedTriggers] = useState<TriggerType[]>([]);
  const [selectedAutomations, setSelectedAutomations] = useState<AutomationCatalogId[]>(defaultAutomationSelection);

  const triggerSet = useMemo(() => new Set(selectedTriggers), [selectedTriggers]);

  function getSentKeys(): string[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
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
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  function hasSent(key: string) {
    return getSentKeys().includes(key.toLowerCase());
  }

  function getCaptureEmail() {
    const email = String(businessEmail || '').trim().toLowerCase();
    return /^\S+@\S+\.\S+$/.test(email) ? email : '';
  }

  function getCaptureKey(email: string) {
    return `services:${email.toLowerCase()}`;
  }

  function clearInactivityTimer() {
    if (inactivityTimerRef.current != null) {
      window.clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
  }

  async function sendCapture(reason: 'inactivity' | 'pagehide' | 'beforeunload' | 'visibility_hidden') {
    if (trackingStoppedRef.current) return;
    const email = getCaptureEmail();
    if (!email || !fullName.trim()) return;
    const captureKey = getCaptureKey(email);
    if (hasSent(captureKey) || inflightRef.current) return;
    inflightRef.current = true;

    const fd = formRef.current ? new FormData(formRef.current) : null;
    const payload = {
      stage: 'services',
      reason,
      inactivity_seconds: INACTIVITY_SECONDS,
      business_email: email,
      full_name: fullName.trim(),
      company_name: companyName.trim(),
      phone: String(fd?.get('phone') || '').trim(),
      zip: String(fd?.get('zip') || '').trim(),
      target_service_outcome: String(fd?.get('target_service_outcome') || '').trim(),
      escalation_destination: String(fd?.get('escalation_destination') || '').trim(),
      auto_response_enabled: autoResponseEnabled,
      csv_capture_enabled: csvCaptureEnabled,
      trigger_types: selectedTriggers,
      selected_automations: selectedAutomations,
      path: '/onboarding/automations/services',
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
      // Best-effort capture only.
    } finally {
      inflightRef.current = false;
    }
  }

  function resetInactivityTimer() {
    if (trackingStoppedRef.current) return;
    if (!fullName.trim()) return;
    const email = getCaptureEmail();
    if (!email) return;
    const captureKey = getCaptureKey(email);
    if (hasSent(captureKey)) return;
    clearInactivityTimer();
    inactivityTimerRef.current = window.setTimeout(() => {
      void sendCapture('inactivity');
    }, INACTIVITY_MS);
  }

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

    resetInactivityTimer();
    return () => {
      for (const evt of events) window.removeEventListener(evt, onActivity);
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInactivityTimer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    resetInactivityTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoResponseEnabled, csvCaptureEnabled, selectedTriggers, selectedAutomations, businessEmail, fullName]);

  useEffect(() => {
    if (selectedAutomations.some((id) => dmAutomationIds.has(id))) {
      setAutoResponseEnabled(true);
    }
  }, [selectedAutomations]);

  function toggleTrigger(trigger: TriggerType, checked: boolean) {
    setSelectedTriggers((prev) => {
      if (checked) return Array.from(new Set([...prev, trigger]));
      return prev.filter((t) => t !== trigger);
    });
  }

  function toggleAutomation(automationId: AutomationCatalogId, checked: boolean) {
    setSelectedAutomations((prev) => {
      if (checked) return Array.from(new Set([...prev, automationId]));
      const next = prev.filter((id) => id !== automationId);
      return next;
    });
  }

  function validate(formData: FormData) {
    const next: Record<string, string> = {};
    if (!String(formData.get('phone') || '').trim()) next.phone = 'Phone is required';
    if (!String(formData.get('zip') || '').trim()) next.zip = 'ZIP is required';
    if (!String(formData.get('target_service_outcome') || '').trim()) next.target_service_outcome = 'Target service outcome is required';
    if (selectedAutomations.length === 0) next.selected_automations = 'Choose at least one automation';

    const dmTemplate = String(formData.get('dm_template') || '').trim();
    const dmRequired = autoResponseEnabled || selectedAutomations.some((id) => dmAutomationIds.has(id));
    if (dmRequired && !dmTemplate) next.dm_template = 'DM template is required when auto response is enabled';
    if (dmRequired && selectedTriggers.length === 0) next.trigger_types = 'Select at least one trigger type';

    return next;
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError('');

    const fd = new FormData(e.currentTarget);
    const localErrors = validate(fd);
    setErrors(localErrors);
    if (Object.keys(localErrors).length) {
      toast({ type: 'error', title: 'Missing required fields', message: 'Please complete the required automation setup fields.' });
      return;
    }

    const rawQuestions = String(fd.get('qualification_questions') || '');
    const qualification_questions = rawQuestions
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    const payload = {
      phone: String(fd.get('phone') || '').trim(),
      zip: String(fd.get('zip') || '').trim(),
      target_service_outcome: String(fd.get('target_service_outcome') || '').trim(),
      selected_automations: selectedAutomations,
      csv_capture_enabled: csvCaptureEnabled,
      auto_response_enabled: autoResponseEnabled || selectedAutomations.some((id) => dmAutomationIds.has(id)),
      instagram_handle: String(fd.get('instagram_handle') || '').trim(),
      facebook_page: String(fd.get('facebook_page') || '').trim(),
      trigger_types: selectedTriggers,
      dm_template: String(fd.get('dm_template') || '').trim(),
      qualification_questions,
      escalation_destination: String(fd.get('escalation_destination') || ''),
    };

    setSubmitting(true);
    try {
      const res = await fetch('/api/automation-onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const body = await res.json().catch(() => ({}));

      if (res.status === 401) {
        toast({ type: 'error', title: 'Session expired', message: 'Please sign in again to continue.' });
        router.push('/auth/login?next=/onboarding/automations/services');
        return;
      }

      if (!res.ok || !body?.ok) {
        const details = (body?.error?.details || {}) as Record<string, string>;
        if (Object.keys(details).length) setErrors(details);
        const msg = body?.error?.message || 'Could not save automation setup';
        setFormError(msg);
        toast({ type: 'error', title: 'Save failed', message: msg });
        return;
      }

      const leadId = body?.data?.leadId;
      trackingStoppedRef.current = true;
      clearInactivityTimer();
      toast({ type: 'success', title: 'Automation setup saved', message: 'Your build request has been submitted.' });
      router.push(leadId ? `/dashboard/automation-build?submitted=1&lead=${encodeURIComponent(String(leadId))}` : '/dashboard/automation-build?submitted=1');
      return;
    } catch {
      const msg = 'Could not save automation setup. Please try again.';
      setFormError(msg);
      toast({ type: 'error', title: 'Network error', message: msg });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      ref={formRef}
      data-email={businessEmail}
      onSubmit={onSubmit}
      className="mt-8 space-y-6 rounded-xl border bg-white p-6 shadow-sm"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="phone" className="mb-1 block text-sm font-medium text-slate-700">Phone</label>
          <input id="phone" name="phone" className="w-full rounded-md border px-3 py-2" />
          {errors.phone ? <p className="mt-1 text-sm text-red-600">{errors.phone}</p> : null}
        </div>

        <div>
          <label htmlFor="zip" className="mb-1 block text-sm font-medium text-slate-700">ZIP</label>
          <input id="zip" name="zip" className="w-full rounded-md border px-3 py-2" />
          {errors.zip ? <p className="mt-1 text-sm text-red-600">{errors.zip}</p> : null}
        </div>
      </div>

      <div>
        <label htmlFor="target_service_outcome" className="mb-1 block text-sm font-medium text-slate-700">Target service outcome</label>
        <input
          id="target_service_outcome"
          name="target_service_outcome"
          placeholder="e.g., csv lead capture + dm auto-response setup"
          className="w-full rounded-md border px-3 py-2"
        />
        {errors.target_service_outcome ? <p className="mt-1 text-sm text-red-600">{errors.target_service_outcome}</p> : null}
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-slate-700">Automation package (choose at least one)</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {AUTOMATION_CATALOG.map((automation) => (
            <label
              key={automation.id}
              className="flex cursor-pointer flex-col gap-1 rounded-md border border-slate-200 px-3 py-3 text-sm text-slate-700 hover:border-slate-300"
            >
              <span className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedAutomations.includes(automation.id)}
                  onChange={(e) => toggleAutomation(automation.id, e.target.checked)}
                />
                <span className="font-medium text-slate-900">{automation.label}</span>
              </span>
              <span className="pl-6 text-xs text-slate-500">{automation.description}</span>
            </label>
          ))}
        </div>
        {errors.selected_automations ? <p className="text-sm text-red-600">{errors.selected_automations}</p> : null}
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="instagram_handle" className="mb-1 block text-sm font-medium text-slate-700">Instagram handle (optional)</label>
          <input id="instagram_handle" name="instagram_handle" className="w-full rounded-md border px-3 py-2" />
        </div>
        <div>
          <label htmlFor="facebook_page" className="mb-1 block text-sm font-medium text-slate-700">Facebook page (optional)</label>
          <input id="facebook_page" name="facebook_page" className="w-full rounded-md border px-3 py-2" />
        </div>
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={csvCaptureEnabled}
            onChange={(e) => setCsvCaptureEnabled(e.target.checked)}
          />
          Write captured leads to CSV export
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={autoResponseEnabled}
            onChange={(e) => setAutoResponseEnabled(e.target.checked)}
          />
          Enable DM auto-response configuration
        </label>
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-slate-700">Trigger types</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {triggerOptions.map((option) => (
            <label key={option.value} className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={triggerSet.has(option.value)}
                onChange={(e) => toggleTrigger(option.value, e.target.checked)}
              />
              {option.label}
            </label>
          ))}
        </div>
        {errors.trigger_types ? <p className="text-sm text-red-600">{errors.trigger_types}</p> : null}
      </fieldset>

      <div>
        <label htmlFor="dm_template" className="mb-1 block text-sm font-medium text-slate-700">DM template</label>
        <textarea
          id="dm_template"
          name="dm_template"
          rows={4}
          placeholder="Thanks for reaching out. Here are the next steps..."
          className="w-full rounded-md border px-3 py-2"
        />
        {errors.dm_template ? <p className="mt-1 text-sm text-red-600">{errors.dm_template}</p> : null}
      </div>

      <div>
        <label htmlFor="qualification_questions" className="mb-1 block text-sm font-medium text-slate-700">Qualification questions (optional, one per line)</label>
        <textarea
          id="qualification_questions"
          name="qualification_questions"
          rows={4}
          className="w-full rounded-md border px-3 py-2"
        />
      </div>

      <div>
        <label htmlFor="escalation_destination" className="mb-1 block text-sm font-medium text-slate-700">Escalation destination</label>
        <select id="escalation_destination" name="escalation_destination" defaultValue="manual_follow_up" className="w-full rounded-md border px-3 py-2">
          <option value="email">Email</option>
          <option value="slack">Slack</option>
          <option value="manual_follow_up">Manual follow-up</option>
        </select>
      </div>

      {formError ? <p className="text-sm text-red-600">{formError}</p> : null}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-[#FF9312] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#E07F00] disabled:opacity-60"
      >
        {submitting ? 'Saving...' : 'Save automation setup'}
      </button>
    </form>
  );
}
