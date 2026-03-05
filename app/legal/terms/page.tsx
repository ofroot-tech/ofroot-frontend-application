import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of service for OfRoot websites and services.',
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 pb-16 pt-24">
      <h1 className="text-3xl font-bold text-slate-900">Terms of Service</h1>
      <p className="mt-4 text-slate-700">
        By using OfRoot sites and services, you agree to lawful use, responsible account handling,
        and accurate information in submitted forms.
      </p>
      <p className="mt-3 text-slate-700">
        Service scope, pricing, and delivery details are governed by signed proposals or subscription terms where applicable.
      </p>
      <p className="mt-3 text-slate-700">
        Questions about terms can be sent to{' '}
        <a className="underline" href="mailto:communications@ofroot.technology">communications@ofroot.technology</a>.
      </p>
      <p className="mt-3 text-sm text-slate-500">Last updated: February 17, 2026</p>
    </main>
  );
}

