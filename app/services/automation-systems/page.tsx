import GrowthPage from '@/components/growth/GrowthPage';
import { growthMetadata, growthPages } from '@/app/lib/growth-content';
const content = growthPages.automationSystems;
export const metadata = growthMetadata('Automation Systems for Revenue Operations', content.description, content.path);
export default function Page() { return <GrowthPage content={content} kind="service" />; }
