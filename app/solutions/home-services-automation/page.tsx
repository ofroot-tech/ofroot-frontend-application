import GrowthPage from '@/components/growth/GrowthPage';
import { growthMetadata, growthPages } from '@/app/lib/growth-content';

const content = growthPages.homeServicesAutomation;

export const metadata = growthMetadata('Home-Service Automation for HVAC and Plumbing | OfRoot', content.description, content.path);

export default function Page() {
  return <GrowthPage content={content} kind="solution" />;
}
