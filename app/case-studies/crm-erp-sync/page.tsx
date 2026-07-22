import { notFound } from 'next/navigation';
import CaseStudyPage from '@/components/growth/CaseStudyPage';
import { getCaseStudy } from '@/app/lib/proof-content';
import { growthMetadata } from '@/app/lib/growth-content';

const study = getCaseStudy('crm-erp-sync');

export const metadata = growthMetadata('CRM and ERP Synchronization Case Study', study?.description || 'An anonymized OfRoot implementation record.', '/case-studies/crm-erp-sync');

export default function Page() {
  if (!study) notFound();
  return <CaseStudyPage study={study} />;
}
