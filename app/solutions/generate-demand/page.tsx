import GrowthPage from '@/components/growth/GrowthPage';
import { growthMetadata, growthPages } from '@/app/lib/growth-content';
const content = growthPages.generateDemand;
export const metadata = growthMetadata('Generate Demand with AI Discoverability', content.description, content.path);
export default function Page() { return <GrowthPage content={content} kind="solution" />; }
