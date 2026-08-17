import { notFound } from 'next/navigation';
import CaseStudyPage from '@/components/growth/CaseStudyPage';
import { getCaseStudy } from '@/app/lib/proof-content';
import { growthMetadata } from '@/app/lib/growth-content';

const study = getCaseStudy('healthcare-ai-automation');

export const metadata = growthMetadata(
  'Healthcare AI Automation Case Study',
  study?.description || 'How an anonymized healthcare operations team improved workflow visibility with AI-assisted routing, summarization, observability, and runbooks.',
  '/case-studies/healthcare-ai-automation',
);

export default function Page() {
  if (!study) notFound();
  return <CaseStudyPage study={study} />;
}
