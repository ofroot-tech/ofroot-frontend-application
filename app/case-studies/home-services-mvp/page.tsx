import { notFound } from 'next/navigation';
import CaseStudyPage from '@/components/growth/CaseStudyPage';
import { getCaseStudy } from '@/app/lib/proof-content';
import { growthMetadata } from '@/app/lib/growth-content';

const study = getCaseStudy('home-services-mvp');

export const metadata = growthMetadata('Home Services Workflow Case Study', study?.description || 'A documented OfRoot implementation record.', '/case-studies/home-services-mvp');

export default function Page() {
  if (!study) notFound();
  return <CaseStudyPage study={study} />;
}
