import GrowthPage from '@/components/growth/GrowthPage';
import { growthMetadata, growthPages } from '@/app/lib/growth-content';
const content = growthPages.aiDiscoverability;
export const metadata = growthMetadata('AI Discoverability Services', content.description, content.path);
export default function Page() { return <GrowthPage content={content} kind="service" />; }
