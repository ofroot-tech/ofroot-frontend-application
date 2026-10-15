import { notFound } from 'next/navigation';
import CaseStudyPage from '@/components/growth/CaseStudyPage';
import { getCaseStudy } from '@/app/lib/proof-content';
import { growthMetadata } from '@/app/lib/growth-content';

const study = getCaseStudy('reporting-reconciliation');

export const metadata = growthMetadata('Reporting and Data Reconciliation | Capability Example', study?.description || 'An OfRoot engineering capability example.', '/case-studies/reporting-reconciliation');

export default function Page() {
  if (!study) notFound();
  return <CaseStudyPage study={study} />;
}
