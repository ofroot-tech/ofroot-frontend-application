import { notFound } from 'next/navigation';
import CaseStudyPage from '@/components/growth/CaseStudyPage';
import { getCaseStudy } from '@/app/lib/proof-content';
import { growthMetadata } from '@/app/lib/growth-content';

const study = getCaseStudy('crm-erp-sync');

export const metadata = growthMetadata('API Integration and Automation | Capability Example', study?.description || 'An OfRoot engineering capability example.', '/case-studies/crm-erp-sync');

export default function Page() {
  if (!study) notFound();
  return <CaseStudyPage study={study} />;
}
