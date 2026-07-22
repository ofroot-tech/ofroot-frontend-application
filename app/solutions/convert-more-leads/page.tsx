import GrowthPage from '@/components/growth/GrowthPage';
import { growthMetadata, growthPages } from '@/app/lib/growth-content';
const content = growthPages.convertMoreLeads;
export const metadata = growthMetadata('Convert More Leads with Connected Automation', content.description, content.path);
export default function Page() { return <GrowthPage content={content} kind="solution" />; }
