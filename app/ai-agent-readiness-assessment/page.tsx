import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/seo/JsonLd';
import { SITE } from '@/app/config/site';
import ReadinessAssessment from './ReadinessAssessment';

export const metadata: Metadata = {
  title: 'Free AI Agent Readiness Assessment',
  description: 'Score your workflow, data, permissions, controls, measurement, and operating readiness for a production AI agent in 12 practical questions.',
  alternates: { canonical: '/ai-agent-readiness-assessment' },
  openGraph: { title: 'Free AI Agent Readiness Assessment | OfRoot', description: 'A practical 12-question assessment for production AI-agent readiness.', url: `${SITE.url}/ai-agent-readiness-assessment`, type: 'website', images: [`${SITE.url}/og.jpg`] },
};

export default function AiAgentReadinessAssessmentPage() {
  const webApplication = { '@context': 'https://schema.org', '@type': 'WebApplication', name: 'OfRoot AI Agent Readiness Assessment', url: `${SITE.url}/ai-agent-readiness-assessment`, applicationCategory: 'BusinessApplication', operatingSystem: 'Web', isAccessibleForFree: true, description: 'A 12-question decision-support assessment covering workflow, value, data, permissions, controls, and operations.' };
  const breadcrumb = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: SITE.url }, { '@type': 'ListItem', position: 2, name: 'AI Agent Readiness Assessment', item: `${SITE.url}/ai-agent-readiness-assessment` }] };
  return <main id="main-content" className="bg-[#f7f6f2] px-6 py-12 text-slate-950 sm:px-8 sm:py-16"><JsonLd data={[webApplication, breadcrumb]} /><div className="mx-auto max-w-5xl"><nav aria-label="Breadcrumb" className="mb-7 text-sm text-slate-500"><Link href="/">Home</Link> / <span className="text-slate-800">AI Agent Readiness Assessment</span></nav><div className="mb-8 max-w-3xl"><p className="text-sm font-bold uppercase tracking-[.16em] text-[#9A4A00]">Free decision-support tool · about 4 minutes</p><h1 className="mt-3 text-balance text-4xl font-black sm:text-6xl">Is your business ready for an AI agent?</h1><p className="mt-5 text-lg leading-8 text-slate-600">Answer 12 practical questions. You will receive a readiness score, a six-part breakdown, and the three operating gaps to address first.</p><p className="mt-4 text-sm text-slate-600">Want to test your public website instead? <Link href="/services/ai-audit" className="font-bold text-[#8F4700] underline">Run the technical website readiness scanner.</Link></p></div><ReadinessAssessment /><div className="mt-10 grid gap-5 border-t border-slate-200 pt-10 sm:grid-cols-3"><div><h2 className="text-lg font-black">What it measures</h2><p className="mt-2 text-sm leading-6 text-slate-600">Workflow, value, data, permissions, controls, and operations—not model enthusiasm.</p></div><div><h2 className="text-lg font-black">What it does not do</h2><p className="mt-2 text-sm leading-6 text-slate-600">It is not a certification, compliance review, or guarantee that an implementation will succeed.</p></div><div><h2 className="text-lg font-black">How it is scored</h2><p className="mt-2 text-sm leading-6 text-slate-600">Every dimension is weighted equally in version 1.0. <Link href="/research/ai-agent-readiness-methodology" className="font-bold text-[#8F4700] underline">See the full methodology.</Link></p></div></div></div></main>;
}
