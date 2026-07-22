import GrowthPage from '@/components/growth/GrowthPage';
import { growthMetadata, growthPages } from '@/app/lib/growth-content';
const content = growthPages.privateCompanyAi;
export const metadata = growthMetadata('Private Company AI Systems', content.description, content.path);
export default function Page() { return <GrowthPage content={content} kind="service" />; }
