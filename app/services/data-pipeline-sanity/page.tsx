import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Data Pipeline Sanity | OfRoot',
  description:
    'Data quality and pipeline reliability for lead operations: dedupe, reconciliation, validation, and monitoring.',
  alternates: { canonical: '/services/data-pipeline-sanity' },
};

export default function DataPipelineSanityPage() {
  return (
    <main className="bg-white px-6 pb-16 pt-28 sm:px-8 sm:pt-32">
      <div className="mx-auto max-w-5xl">
        <p className="inline-flex rounded-full border border-[#FF9312]/30 bg-[#FFF7ED] px-4 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#B45309]">
          Pillar 03
        </p>
        <h1 className="mt-4 text-4xl font-black leading-tight text-slate-900 sm:text-5xl">
          Data pipeline sanity for accurate lead and revenue reporting.
        </h1>
        <p className="mt-4 max-w-3xl text-slate-600">
          We fix data integrity issues between ad platforms, forms, automation tools, and CRM so decision-making is based on trusted numbers.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-900">What we implement</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              <li>• Field-level validation before writes</li>
              <li>• Deduplication and merge strategies</li>
              <li>• Source-of-truth reconciliation jobs</li>
              <li>• Monitoring, alerts, and incident playbooks</li>
            </ul>
          </div>
          <div className="rounded-xl border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-900">Outcome focus</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              <li>• Fewer lost or duplicated leads</li>
              <li>• Accurate funnel and attribution reporting</li>
              <li>• Lower operational cleanup burden</li>
              <li>• Confidence in forecast and pacing decisions</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/consulting/book" className="rounded-md bg-[#FF9312] px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-[#FFB14A]">
            Book an integration call
          </Link>
          <Link href="/pricing" className="rounded-md border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50">
            See pricing
          </Link>
        </div>
      </div>
    </main>
  );
}
