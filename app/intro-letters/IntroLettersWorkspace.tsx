'use client';

import { FormEvent, useMemo, useState } from 'react';
import {
  getDefaultIntroTemplate,
  INTRO_SERVICE_LABELS,
} from '@/app/lib/introLettersTemplates';
import type { IntroService } from '@/app/lib/introLettersTemplates';

const MAX_RECIPIENTS = 25;

type Props = {
  initialAuthenticated: boolean;
  initialUsername: string | null;
  initialExpiresAt: string | null;
};

type RecipientInput = {
  id: string;
  leaderName: string;
  companyName: string;
  email: string;
  title: string;
};

type SendResult = {
  email: string;
  ok: boolean;
  message: string;
  providerId?: string;
};

type SendBatchResult = {
  id: string;
  at: string;
  service: IntroService;
  summary: {
    total: number;
    sent: number;
    failed: number;
  };
  results: SendResult[];
};

function makeRecipient(): RecipientInput {
  return {
    id:
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`,
    leaderName: '',
    companyName: '',
    email: '',
    title: '',
  };
}

function initialTemplates(service: IntroService) {
  return getDefaultIntroTemplate(service);
}

export default function IntroLettersWorkspace({
  initialAuthenticated,
  initialUsername,
  initialExpiresAt,
}: Props) {
  const [authenticated, setAuthenticated] = useState(initialAuthenticated);
  const [sessionUsername, setSessionUsername] = useState(initialUsername);
  const [sessionExpiresAt, setSessionExpiresAt] = useState(initialExpiresAt);

  const [gateUsername, setGateUsername] = useState('');
  const [gatePassword, setGatePassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [service, setService] = useState<IntroService>('workflow_automation');
  const [senderName, setSenderName] = useState('Dimitri McDaniel');
  const [subjectTemplate, setSubjectTemplate] = useState(
    initialTemplates('workflow_automation').subjectTemplate
  );
  const [bodyTemplate, setBodyTemplate] = useState(
    initialTemplates('workflow_automation').bodyTemplate
  );
  const [recipients, setRecipients] = useState<RecipientInput[]>([
    makeRecipient(),
  ]);
  const [sendLoading, setSendLoading] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [sendHistory, setSendHistory] = useState<SendBatchResult[]>([]);

  const canAddRecipient = recipients.length < MAX_RECIPIENTS;
  const expiresAtText = useMemo(() => {
    if (!sessionExpiresAt) return null;
    const parsed = new Date(sessionExpiresAt);
    if (Number.isNaN(parsed.getTime())) return null;
    return parsed.toLocaleString();
  }, [sessionExpiresAt]);

  async function onUnlock(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);
    try {
      const res = await fetch('/api/intro-letters/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: gateUsername,
          password: gatePassword,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.ok) {
        setAuthError(json?.error?.message || 'Unable to unlock this workspace.');
        return;
      }
      setAuthenticated(true);
      setSessionUsername(gateUsername.trim());
      setSessionExpiresAt(json?.data?.expiresAt || null);
      setGatePassword('');
    } catch (err: any) {
      setAuthError(err?.message || 'Unexpected error while unlocking.');
    } finally {
      setAuthLoading(false);
    }
  }

  async function onLock() {
    await fetch('/api/intro-letters/logout', { method: 'POST' }).catch(() => {});
    setAuthenticated(false);
    setSessionUsername(null);
    setSessionExpiresAt(null);
    setSendHistory([]);
  }

  function updateRecipient(id: string, field: keyof RecipientInput, value: string) {
    setRecipients((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  }

  function addRecipient() {
    if (!canAddRecipient) return;
    setRecipients((prev) => [...prev, makeRecipient()]);
  }

  function removeRecipient(id: string) {
    setRecipients((prev) => {
      if (prev.length === 1) return prev;
      return prev.filter((r) => r.id !== id);
    });
  }

  function applyDefaultTemplate(nextService: IntroService) {
    const next = getDefaultIntroTemplate(nextService);
    setSubjectTemplate(next.subjectTemplate);
    setBodyTemplate(next.bodyTemplate);
  }

  async function onSend(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSendError(null);

    const trimmedRecipients = recipients
      .map((r) => ({
        leaderName: r.leaderName.trim(),
        companyName: r.companyName.trim(),
        email: r.email.trim(),
        title: r.title.trim() || undefined,
      }))
      .filter((r) => r.leaderName || r.companyName || r.email || r.title);

    if (trimmedRecipients.length === 0) {
      setSendError('Add at least one recipient.');
      return;
    }
    if (trimmedRecipients.length > MAX_RECIPIENTS) {
      setSendError(`A maximum of ${MAX_RECIPIENTS} recipients is allowed per send.`);
      return;
    }
    const missing = trimmedRecipients.findIndex(
      (r) => !r.leaderName || !r.companyName || !r.email
    );
    if (missing !== -1) {
      setSendError(
        `Recipient row ${missing + 1} is missing name, company, or email.`
      );
      return;
    }

    setSendLoading(true);
    try {
      const res = await fetch('/api/intro-letters/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service,
          senderName: senderName.trim(),
          subjectTemplate,
          bodyTemplate,
          recipients: trimmedRecipients,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.ok) {
        setSendError(json?.error?.message || 'Unable to send intro letters.');
        return;
      }

      setSendHistory((prev) => [
        {
          id:
            typeof crypto !== 'undefined' && crypto.randomUUID
              ? crypto.randomUUID()
              : `${Date.now()}-${Math.random()}`,
          at: new Date().toISOString(),
          service,
          summary: json.data.summary,
          results: json.data.results,
        },
        ...prev,
      ]);
    } catch (err: any) {
      setSendError(err?.message || 'Unexpected send error.');
    } finally {
      setSendLoading(false);
    }
  }

  if (!authenticated) {
    return (
      <section className="mx-auto max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-extrabold text-slate-900">Intro Letters Outreach</h1>
        <p className="mt-2 text-sm text-slate-600">
          This workspace is password-protected.
        </p>
        <form className="mt-6 space-y-4" onSubmit={onUnlock}>
          <div>
            <label htmlFor="gate-username" className="mb-1 block text-sm font-medium text-slate-700">
              Gate username
            </label>
            <input
              id="gate-username"
              type="email"
              value={gateUsername}
              onChange={(e) => setGateUsername(e.target.value)}
              required
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-[#FF9312] focus:outline-none focus:ring-2 focus:ring-[#FF9312]/30"
            />
          </div>
          <div>
            <label htmlFor="gate-password" className="mb-1 block text-sm font-medium text-slate-700">
              Gate password
            </label>
            <input
              id="gate-password"
              type="password"
              value={gatePassword}
              onChange={(e) => setGatePassword(e.target.value)}
              required
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-[#FF9312] focus:outline-none focus:ring-2 focus:ring-[#FF9312]/30"
            />
          </div>
          {authError && (
            <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {authError}
            </p>
          )}
          <button
            type="submit"
            disabled={authLoading}
            className="inline-flex items-center rounded-md bg-[#FF9312] px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-[#FFB14A] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {authLoading ? 'Unlocking...' : 'Unlock'}
          </button>
        </form>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">
              Intro Letters Outreach
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Authenticated {sessionUsername ? `as ${sessionUsername}` : ''}.
              {expiresAtText ? ` Session expires ${expiresAtText}.` : ''}
            </p>
          </div>
          <button
            type="button"
            onClick={onLock}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Lock
          </button>
        </div>
      </div>

      <form
        className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
        onSubmit={onSend}
      >
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label htmlFor="service" className="mb-1 block text-sm font-medium text-slate-700">
              Service
            </label>
            <select
              id="service"
              value={service}
              onChange={(e) => {
                const next = e.target.value as IntroService;
                setService(next);
                applyDefaultTemplate(next);
              }}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-[#FF9312] focus:outline-none focus:ring-2 focus:ring-[#FF9312]/30"
            >
              <option value="workflow_automation">Workflow automation</option>
              <option value="landing_pages">Marketing landing pages</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label htmlFor="senderName" className="mb-1 block text-sm font-medium text-slate-700">
              Sender name
            </label>
            <input
              id="senderName"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              required
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-[#FF9312] focus:outline-none focus:ring-2 focus:ring-[#FF9312]/30"
            />
          </div>
        </div>

        <div className="mt-4">
          <div className="mb-1 flex items-center justify-between gap-3">
            <label htmlFor="subjectTemplate" className="text-sm font-medium text-slate-700">
              Subject template
            </label>
            <button
              type="button"
              onClick={() => applyDefaultTemplate(service)}
              className="text-xs font-medium underline text-slate-600"
            >
              Load default copy
            </button>
          </div>
          <input
            id="subjectTemplate"
            value={subjectTemplate}
            onChange={(e) => setSubjectTemplate(e.target.value)}
            required
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-[#FF9312] focus:outline-none focus:ring-2 focus:ring-[#FF9312]/30"
          />
        </div>

        <div className="mt-4">
          <label htmlFor="bodyTemplate" className="mb-1 block text-sm font-medium text-slate-700">
            Body template
          </label>
          <textarea
            id="bodyTemplate"
            value={bodyTemplate}
            onChange={(e) => setBodyTemplate(e.target.value)}
            required
            rows={12}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm leading-relaxed focus:border-[#FF9312] focus:outline-none focus:ring-2 focus:ring-[#FF9312]/30"
          />
          <p className="mt-1 text-xs text-slate-500">
            Supported tokens: {'{{leaderName}}'}, {'{{companyName}}'}, {'{{serviceName}}'}, {'{{senderName}}'}.
          </p>
        </div>

        <div className="mt-6 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <h2 className="text-sm font-semibold text-slate-900">
              Recipients ({recipients.length}/{MAX_RECIPIENTS})
            </h2>
            <button
              type="button"
              onClick={addRecipient}
              disabled={!canAddRecipient}
              className="rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Add recipient
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-3 py-2">Leader name</th>
                  <th className="px-3 py-2">Company</th>
                  <th className="px-3 py-2">Email</th>
                  <th className="px-3 py-2">Title</th>
                  <th className="px-3 py-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {recipients.map((recipient) => (
                  <tr key={recipient.id} className="border-t border-slate-200">
                    <td className="px-3 py-2">
                      <input
                        value={recipient.leaderName}
                        onChange={(e) =>
                          updateRecipient(recipient.id, 'leaderName', e.target.value)
                        }
                        placeholder="Jane Doe"
                        className="w-44 rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-[#FF9312] focus:outline-none focus:ring-1 focus:ring-[#FF9312]/30"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        value={recipient.companyName}
                        onChange={(e) =>
                          updateRecipient(recipient.id, 'companyName', e.target.value)
                        }
                        placeholder="Acme Co."
                        className="w-44 rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-[#FF9312] focus:outline-none focus:ring-1 focus:ring-[#FF9312]/30"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="email"
                        value={recipient.email}
                        onChange={(e) =>
                          updateRecipient(recipient.id, 'email', e.target.value)
                        }
                        placeholder="leader@company.com"
                        className="w-56 rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-[#FF9312] focus:outline-none focus:ring-1 focus:ring-[#FF9312]/30"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        value={recipient.title}
                        onChange={(e) =>
                          updateRecipient(recipient.id, 'title', e.target.value)
                        }
                        placeholder="CEO (optional)"
                        className="w-44 rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-[#FF9312] focus:outline-none focus:ring-1 focus:ring-[#FF9312]/30"
                      />
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button
                        type="button"
                        onClick={() => removeRecipient(recipient.id)}
                        disabled={recipients.length === 1}
                        className="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {sendError && (
          <p className="mt-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {sendError}
          </p>
        )}

        <div className="mt-4">
          <button
            type="submit"
            disabled={sendLoading}
            className="inline-flex items-center rounded-md bg-[#FF9312] px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-[#FFB14A] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {sendLoading ? 'Sending...' : 'Send intro letters'}
          </button>
        </div>
      </form>

      {sendHistory.length > 0 && (
        <div className="space-y-4">
          {sendHistory.map((batch) => (
            <article key={batch.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-sm font-semibold text-slate-900">
                  {new Date(batch.at).toLocaleString()} · {INTRO_SERVICE_LABELS[batch.service]}
                </h2>
                <p className="text-sm text-slate-600">
                  Sent {batch.summary.sent}/{batch.summary.total} · Failed {batch.summary.failed}
                </p>
              </div>
              <div className="mt-3 overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                      <th className="px-3 py-2">Email</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2">Message</th>
                      <th className="px-3 py-2">Provider id</th>
                    </tr>
                  </thead>
                  <tbody>
                    {batch.results.map((result, idx) => (
                      <tr key={`${result.email}-${idx}`} className="border-t border-slate-200">
                        <td className="px-3 py-2">{result.email}</td>
                        <td className="px-3 py-2">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                              result.ok
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-rose-100 text-rose-700'
                            }`}
                          >
                            {result.ok ? 'sent' : 'failed'}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-slate-700">{result.message}</td>
                        <td className="px-3 py-2 text-slate-700">{result.providerId || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
