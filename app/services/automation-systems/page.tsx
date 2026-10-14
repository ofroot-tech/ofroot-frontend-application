import GrowthPage from '@/components/growth/GrowthPage';
import { growthMetadata, growthPages } from '@/app/lib/growth-content';
const content = growthPages.automationSystems;
export const metadata = growthMetadata('Integrations, Internal Tools & Automation', content.description, content.path);
export default function Page() { return <GrowthPage content={content} kind="service" />; }
