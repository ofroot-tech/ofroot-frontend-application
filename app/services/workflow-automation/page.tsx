import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Workflow Automation | OfRoot',
  description:
    'Make, Zapier, and API workflow automation for lead qualification, follow-up, reminders, and meeting booking.',
  alternates: { canonical: '/services/workflow-automation' },
};

export default function WorkflowAutomationPage() {
  return (
    <main className="bg-white px-6 pb-16 pt-28 sm:px-8 sm:pt-32">
      <div className="mx-auto max-w-5xl">
        <p className="inline-flex rounded-full border border-[#FF9312]/30 bg-[#FFF7ED] px-4 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#B45309]">
          Pillar 02
        </p>
        <h1 className="mt-4 text-4xl font-black leading-tight text-slate-900 sm:text-5xl">
          Workflow automation that books meetings, not just tasks.
        </h1>
        <p className="mt-4 max-w-3xl text-slate-600">
          We design operational workflows in Make, Zapier, and direct APIs with retries, fallback paths, and clear ownership.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-900">What we implement</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              <li>• Qualification and scoring automations</li>
              <li>• Appointment scheduling and reminder sequences</li>
              <li>• Pipeline stage progression and SLA checks</li>
              <li>• Error monitoring and recovery logic</li>
            </ul>
          </div>
          <div className="rounded-xl border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-900">Outcome focus</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              <li>• Shorter lead-to-meeting cycle time</li>
              <li>• Fewer manual steps for ops and sales</li>
              <li>• Better pipeline velocity visibility</li>
              <li>• Stable automations that survive scale</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/consulting/book" className="rounded-md bg-[#FF9312] px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-[#FFB14A]">
            Book an integration call
          </Link>
          <Link href="/automations" className="rounded-md border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50">
            Back to automations
          </Link>
        </div>
      </div>
    </main>
  );
}
