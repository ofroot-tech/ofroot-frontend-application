import { notFound } from 'next/navigation';
import CaseStudyPage from '@/components/growth/CaseStudyPage';
import { getCaseStudy } from '@/app/lib/proof-content';
import { growthMetadata } from '@/app/lib/growth-content';

const study = getCaseStudy('marketing-websites');

export const metadata = growthMetadata('Marketing Websites and Discoverability | Capability Example', study?.description || 'An OfRoot engineering capability example.', '/case-studies/marketing-websites');

export default function Page() {
  if (!study) notFound();
  return <CaseStudyPage study={study} />;
}
