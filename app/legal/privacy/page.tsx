import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy policy for OfRoot services and websites.',
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 pb-16 pt-24">
      <h1 className="text-3xl font-bold text-slate-900">Privacy Policy</h1>
      <p className="mt-4 text-slate-700">
        OfRoot collects only the data needed to provide services, respond to inquiries,
        and operate products securely. We do not sell customer data.
      </p>
      <p className="mt-3 text-slate-700">
        If you submit forms, we use your details to communicate about your request.
        For privacy-related requests, contact{' '}
        <a className="underline" href="mailto:communications@ofroot.technology">communications@ofroot.technology</a>.
      </p>
      <p className="mt-3 text-sm text-slate-500">Last updated: February 17, 2026</p>
    </main>
  );
}

