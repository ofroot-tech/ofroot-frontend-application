'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, RotateCcw } from 'lucide-react';
import { track } from '@/app/lib/ab';
import { calculateReadiness, readinessAnswerOptions, readinessQuestions } from '@/app/lib/ai-readiness';

const priorityActions: Record<string, string> = {
  Workflow: 'Document one trigger, outcome, owner, and exception path.',
  Value: 'Record the current cost, delay, error rate, or capacity baseline.',
  Data: 'Name approved sources, owners, freshness rules, and conflict handling.',
  Permissions: 'Define least-privilege read and write access outside the model.',
  Controls: 'Set approval boundaries, validation, deduplication, and safe-stop rules.',
  Operations: 'Build an evaluation set, monitoring, alerts, runbook, and accountable owners.',
};

export default function ReadinessAssessment() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const complete = step >= readinessQuestions.length;
  const question = readinessQuestions[step];
  const result = useMemo(() => calculateReadiness(answers), [answers]);

  useEffect(() => {
    track({ category: 'assessment', action: 'readiness_assessment_viewed', label: 'ai_agent_readiness', meta: { path: window.location.pathname } });
  }, []);

  const chooseAnswer = (value: number) => {
    if (!question) return;
    const nextAnswers = { ...answers, [question.id]: value };
    setAnswers(nextAnswers);
    track({ category: 'assessment', action: 'readiness_question_answered', label: question.category, value, meta: { question_id: question.id, question_number: step + 1 } });

    if (step === readinessQuestions.length - 1) {
      const completedResult = calculateReadiness(nextAnswers);
      track({ category: 'assessment', action: 'readiness_assessment_completed', label: completedResult.stage, value: completedResult.score, meta: { score: completedResult.score, stage: completedResult.stage } });
    }
    setStep(current => current + 1);
  };

  const restart = () => {
    setAnswers({});
    setStep(0);
    track({ category: 'assessment', action: 'readiness_assessment_restarted', label: 'ai_agent_readiness' });
  };

  if (complete) {
    return (
      <section aria-labelledby="readiness-result-heading" className="rounded-[2px] border border-[#d2caeb]/16 bg-[#211c2c] p-6 shadow-[0_24px_70px_rgba(15,23,42,.10)] sm:p-9">
        <div className="flex flex-col gap-7 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[.16em] text-[#c4abe3]">Your readiness result</p>
            <h2 id="readiness-result-heading" className="mt-3 text-3xl font-medium sm:text-4xl">{result.stage}</h2>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-[#c0b5cc]">{result.summary}</p>
          </div>
          <div className="flex size-32 shrink-0 flex-col items-center justify-center rounded-[2px] border-[10px] border-[#b4a0ef] bg-[#211c2c] text-white" aria-label={`${result.score} out of 100`}>
            <span className="text-4xl font-medium">{result.score}</span>
            <span className="text-xs text-slate-300">out of 100</span>
          </div>
        </div>

        <div className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {result.categoryScores.map(item => (
            <div key={item.category} className="rounded-[2px] bg-[#17141f] p-5">
              <div className="flex items-center justify-between gap-3"><span className="font-bold">{item.category}</span><span className="text-sm font-bold text-[#e1c7f2]">{item.score}%</span></div>
              <div className="mt-3 h-2 overflow-hidden rounded-[2px] bg-[#4a3c59]"><div className="h-full rounded-[2px] bg-[#574064]" style={{ width: `${item.score}%` }} /></div>
            </div>
          ))}
        </div>

        <div className="mt-9 rounded-[2px] border border-[#b4a0ef]/25 bg-[#30263d] p-6">
          <h3 className="text-xl font-medium">Your next three priorities</h3>
          <ol className="mt-5 space-y-4">
            {result.priorities.map((priority, index) => (
              <li key={priority} className="flex gap-3"><CheckCircle2 className="mt-0.5 size-5 shrink-0 text-[#c4abe3]" /><span><strong>{index + 1}. {priority}:</strong> {priorityActions[priority]}</span></li>
            ))}
          </ol>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href={`/book?source=ai-agent-readiness-assessment&score=${result.score}`} onClick={() => track({ category: 'cta', action: 'readiness_audit_clicked', label: result.stage, value: result.score, meta: { score: result.score } })} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[2px] bg-[#574064] px-6 py-3 font-bold text-[#faf9fc] hover:bg-[#6d4c70]">Review the result with OfRoot<ArrowRight className="size-4" /></Link>
          <Link href="/research/ai-agent-readiness-methodology" className="inline-flex min-h-12 items-center justify-center rounded-[2px] border border-[#6d617f] px-6 py-3 font-bold hover:bg-[#262231]">Read the scoring methodology</Link>
          <button type="button" onClick={restart} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[2px] px-5 py-3 font-bold text-[#c0b5cc] hover:bg-[#30263d]"><RotateCcw className="size-4" />Start again</button>
        </div>
        <p className="mt-6 text-sm text-[#b4a3c5]">This result is decision support, not a certification or security assessment. Your answers stay in this browser; OfRoot does not store them.</p>
      </section>
    );
  }

  const progress = Math.round((step / readinessQuestions.length) * 100);
  return (
    <section aria-labelledby="assessment-question" className="rounded-[2px] border border-[#d2caeb]/16 bg-[#211c2c] p-6 shadow-[0_24px_70px_rgba(15,23,42,.10)] sm:p-9">
      <div className="flex items-center justify-between gap-4 text-sm font-bold"><span className="text-[#e1c7f2]">{question.category}</span><span className="text-[#b4a3c5]">Question {step + 1} of {readinessQuestions.length}</span></div>
      <div className="mt-4 h-2 overflow-hidden rounded-[2px] bg-[#4a3c59]" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} aria-label="Assessment progress"><div className="h-full rounded-[2px] bg-[#574064] transition-[width]" style={{ width: `${progress}%` }} /></div>
      <h2 id="assessment-question" className="mt-8 text-2xl font-medium leading-tight sm:text-3xl">{question.prompt}</h2>
      <p className="mt-3 text-base leading-7 text-[#c0b5cc]">{question.guidance}</p>
      <fieldset className="mt-8 grid gap-3"><legend className="sr-only">Choose the answer that best describes your organization</legend>{readinessAnswerOptions.map(option => <button key={option.value} type="button" onClick={() => chooseAnswer(option.value)} className="group min-h-[72px] rounded-[2px] border border-[#d2caeb]/16 p-5 text-left transition hover:border-[#b4a0ef] hover:bg-[#30263d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffb78f]"><span className="flex items-center justify-between gap-4"><span><span className="block font-bold text-[#faf9fc]">{option.label}</span><span className="mt-1 block text-sm text-[#c0b5cc]">{option.description}</span></span><ArrowRight className="size-5 shrink-0 text-[#b4a3c5] transition-transform group-hover:translate-x-1" /></span></button>)}</fieldset>
      <div className="mt-6 flex items-center justify-between"><button type="button" disabled={step === 0} onClick={() => setStep(current => Math.max(0, current - 1))} className="inline-flex min-h-11 items-center gap-2 rounded-[2px] px-3 font-semibold text-[#c0b5cc] disabled:cursor-not-allowed disabled:opacity-30 hover:not-disabled:bg-[#30263d]"><ArrowLeft className="size-4" />Previous</button><span className="text-xs text-[#b4a3c5]">No email required</span></div>
    </section>
  );
}
