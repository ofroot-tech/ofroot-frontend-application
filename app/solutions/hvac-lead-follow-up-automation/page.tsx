import GrowthPage from '@/components/growth/GrowthPage';
import { growthMetadata, growthPages } from '@/app/lib/growth-content';

const content = growthPages.hvacLeadFollowUp;

export const metadata = growthMetadata('HVAC Lead Follow-Up Automation | OfRoot', content.description, content.path);

export default function Page() {
  return <GrowthPage content={content} kind="solution" />;
}
