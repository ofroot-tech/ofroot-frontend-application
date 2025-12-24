/**
 * # Dialer workspace (dashboard-protected)
 *
 * Server component that gates access via the dashboard auth pattern (token +
 * /api/me). The UI remains the same stub shell so we can wire live data later.
 */
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { api, type User } from '@/app/lib/api';
import { TOKEN_COOKIE_NAME, LEGACY_COOKIE_NAME } from '@/app/lib/cookies';
import { CheckCircle, Clock3, PhoneCall, PhoneOff, Voicemail } from 'lucide-react';

async function getToken() {
  const store = await cookies();
  return store.get(TOKEN_COOKIE_NAME)?.value || store.get(LEGACY_COOKIE_NAME)?.value;
}

const sampleQueue = [
  { name: 'Nia Patel', phone: '+1 (206) 555-0114', timezone: 'America/Los_Angeles', lastOutcome: 'No answer' },
  { name: 'Arun Iyer', phone: '+1 (303) 555-0199', timezone: 'America/Denver', lastOutcome: 'New' },
  { name: 'Mara Ochoa', phone: '+1 (917) 555-0108', timezone: 'America/New_York', lastOutcome: 'Callback' },
];

const script = [
  'Open with the value hook: faster outbound, compliant follow-ups, ready-made scripts.',
  'Qualify: confirm current dialer, team size, and geos they call.',
  'Offer: pilot with Twilio or bring-your-own provider; stress compliance guardrails.',
  'Close: schedule handoff or send follow-up SMS with booking link.',
];

export default async function DialerPage() {
  const token = await getToken();
  if (!token) redirect('/auth/login');

  const me = await api.me(token).catch(() => null as User | null);
  if (!me) redirect('/auth/login');

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
      <header className="mb-8 rounded-xl border bg-white/80 p-6 shadow-card">
        <p className="text-sm font-semibold text-brand-700">Dialer workspace</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">Power through your queue with local presence</h1>
        <p className="mt-3 max-w-3xl text-base text-gray-600">
          This stub mirrors the production layout: next-contact queue, guided script, call controls, and quick dispositions. Provider choice
          (Twilio first) and compliance banners slot in without reshaping the UI.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border bg-white/80 p-6 shadow-card">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-brand-700">Now dialing</p>
                <h2 className="text-2xl font-semibold text-gray-900">{sampleQueue[0].name}</h2>
                <p className="text-gray-600">{sampleQueue[0].phone} · {sampleQueue[0].timezone}</p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
                <CheckCircle className="h-4 w-4" /> Ready
              </span>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button className="inline-flex items-center gap-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500">
                <PhoneCall className="h-4 w-4" /> Start call
              </button>
              <button className="inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-semibold text-gray-800 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-500">
                <PhoneOff className="h-4 w-4" /> Hang up
              </button>
              <button className="inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-semibold text-gray-800 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-500">
                <Voicemail className="h-4 w-4" /> Drop voicemail
              </button>
              <span className="inline-flex items-center gap-2 rounded-md bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                <Clock3 className="h-4 w-4" /> Quiet hours enforced
              </span>
            </div>
          </div>

          <div className="rounded-xl border bg-white/80 p-6 shadow-card">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Script</h3>
              <span className="text-sm text-gray-500">Preview mode</span>
            </div>
            <ol className="mt-4 space-y-3 text-sm text-gray-700">
              {script.map((line, idx) => (
                <li key={idx} className="flex gap-3 rounded-lg border border-dashed border-gray-200 bg-white/70 px-3 py-2">
                  <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand-50 text-sm font-semibold text-brand-700">{idx + 1}</span>
                  <span>{line}</span>
                </li>
              ))}
            </ol>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-gray-600">
              <span className="rounded-full bg-emerald-50 px-3 py-1 font-medium text-emerald-700">Recording notice on</span>
              <span className="rounded-full bg-blue-50 px-3 py-1 font-medium text-blue-700">Local presence</span>
              <span className="rounded-full bg-amber-50 px-3 py-1 font-medium text-amber-700">DNC guard active</span>
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-xl border bg-white/80 p-5 shadow-card">
            <h3 className="text-lg font-semibold text-gray-900">Queue</h3>
            <ul className="mt-4 space-y-3 text-sm text-gray-700">
              {sampleQueue.map((contact) => (
                <li key={contact.phone} className="rounded-lg border px-3 py-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{contact.name}</p>
                      <p className="text-gray-600">{contact.phone}</p>
                    </div>
                    <span className="rounded-full bg-gray-100 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-gray-700">{contact.lastOutcome}</span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">{contact.timezone}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border bg-white/80 p-5 shadow-card">
            <h3 className="text-lg font-semibold text-gray-900">Quick dispositions</h3>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              {['Connected', 'Voicemail', 'Callback', 'Bad number'].map((label) => (
                <button
                  key={label}
                  className="rounded-md border px-3 py-2 font-semibold text-gray-800 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {label}
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs text-gray-500">Follow-up SMS and email steps will slot beneath these buttons.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
