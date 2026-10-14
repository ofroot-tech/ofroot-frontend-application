import { notFound } from 'next/navigation';
import CaseStudyPage from '@/components/growth/CaseStudyPage';
import { getCaseStudy } from '@/app/lib/proof-content';
import { growthMetadata } from '@/app/lib/growth-content';

const study = getCaseStudy('home-services-mvp');

export const metadata = growthMetadata('Operational Workflow Applications | Capability Example', study?.description || 'An OfRoot engineering capability example.', '/case-studies/home-services-mvp');

export default function Page() {
  if (!study) notFound();
  return <CaseStudyPage study={study} />;
}
