import { notFound } from 'next/navigation';
import CaseStudyPage from '@/components/growth/CaseStudyPage';
import { getCaseStudy } from '@/app/lib/proof-content';
import { growthMetadata } from '@/app/lib/growth-content';

const study = getCaseStudy('healthcare-ai-automation');

export const metadata = growthMetadata('AI-Assisted Business Tools | Capability Example', study?.description || 'An OfRoot engineering capability example.', '/case-studies/healthcare-ai-automation');

export default function Page() {
  if (!study) notFound();
  return <CaseStudyPage study={study} />;
}
