import Link from 'next/link';
import { ArrowRight, BarChart3, CheckCircle2, FileText, Route, Sparkles } from 'lucide-react';
import { Card, CardBody, PageHeader } from '@/app/dashboard/_components/UI';
import { AI_PROCESS_STAGES } from '@/app/lib/ai-process';
import { TrackedPageView } from '@/components/growth/Analytics';

export function AiProcessDashboard() {
  return (
    <div className="space-y-6 reveal-in fade-only">
      <TrackedPageView event="ai_process_dashboard_viewed" label="dashboard" />
      <PageHeader title="AI Process" subtitle="Follow the journey from business discovery to measured improvement." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['Current phase', 'Not started', 'Complete your business profile to begin.'],
          ['Estimated annual opportunity', 'Not calculated', 'Added after cost analysis is reviewed.'],
          ['Realized value', 'Not available', 'Measured after launch against an approved baseline.'],
          ['Implementation status', 'Not started', 'Build activity stays in Automation Build.'],
        ].map(([label, value, note]) => <Card key={label}><CardBody className="h-full"><p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p><p className="mt-2 text-lg font-semibold text-gray-900">{value}</p><p className="mt-1 text-sm text-gray-600">{note}</p></CardBody></Card>)}
      </div>

      <Card className="border-amber-200 bg-amber-50/60">
        <CardBody className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div><p className="text-xs font-semibold uppercase tracking-wide text-amber-800">Next action</p><h2 className="mt-1 text-lg font-semibold text-gray-900">Complete your business profile</h2><p className="mt-1 text-sm text-gray-700">Share the operating context needed to plan department discovery.</p></div>
          <Link href="/onboarding/automations" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#FF9312] px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-[#ffad42] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2">Start profile<ArrowRight className="h-4 w-4" /></Link>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <div className="flex items-start gap-3"><Route className="mt-0.5 h-5 w-5 text-[#B55B00]" /><div><h2 className="text-base font-semibold text-gray-900">Your process journey</h2><p className="mt-1 text-sm text-gray-600">Stages unlock as reviewed deliverables become available. Status is written out so color is never the only signal.</p></div></div>
          <ol className="mt-6 grid gap-3 lg:grid-cols-2">
            {AI_PROCESS_STAGES.map((stage, index) => {
              const isNext = index === 0;
              return <li key={stage.id} data-ai-process-stage={stage.id} className={`rounded-lg border p-4 ${isNext ? 'border-amber-300 bg-amber-50' : 'border-gray-200 bg-white'}`}>
                <div className="flex items-start gap-3"><span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${isNext ? 'bg-amber-500 text-slate-950' : 'bg-gray-100 text-gray-600'}`}>{stage.number}</span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="text-sm font-semibold text-gray-900">{stage.title}</h3><span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${isNext ? 'border-amber-300 bg-amber-100 text-amber-900' : 'border-gray-200 bg-gray-100 text-gray-600'}`}>{isNext ? 'Next' : 'Upcoming'}</span></div><p className="mt-1 text-sm text-gray-600">{stage.description}</p><p className="mt-3 text-xs text-gray-500">Deliverables: {stage.deliverables.join(' · ')}</p></div></div>
              </li>;
            })}
          </ol>
        </CardBody>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card><CardBody className="h-full"><Sparkles className="h-5 w-5 text-[#B55B00]" /><h2 className="mt-3 text-sm font-semibold text-gray-900">Opportunities</h2><p className="mt-2 text-sm text-gray-600">No scored opportunities yet. They will appear after process mapping and cost analysis are reviewed.</p></CardBody></Card>
        <Card><CardBody className="h-full"><BarChart3 className="h-5 w-5 text-[#B55B00]" /><h2 className="mt-3 text-sm font-semibold text-gray-900">Value measurement</h2><p className="mt-2 text-sm text-gray-600">No approved baseline yet. Estimated and realized value stay empty until supporting inputs exist.</p></CardBody></Card>
        <Card><CardBody className="h-full"><FileText className="h-5 w-5 text-[#B55B00]" /><h2 className="mt-3 text-sm font-semibold text-gray-900">Documents and reports</h2><p className="mt-2 text-sm text-gray-600">No deliverables have been published. Reviewed maps, reports, and proposals will appear here.</p></CardBody></Card>
      </div>

      <Card>
        <CardBody className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-700" /><div><h2 className="text-sm font-semibold text-gray-900">Automation Build remains the implementation workspace</h2><p className="mt-1 text-sm text-gray-600">Open it for selected automations, delivery stages, test status, and launch progress.</p></div></div><Link href="/dashboard/automation-build" className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-700 focus-visible:ring-offset-2">Open Automation Build<ArrowRight className="h-4 w-4" /></Link></CardBody>
      </Card>
    </div>
  );
}
