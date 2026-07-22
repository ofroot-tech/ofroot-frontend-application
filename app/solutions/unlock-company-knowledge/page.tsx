import GrowthPage from '@/components/growth/GrowthPage';
import { growthMetadata, growthPages } from '@/app/lib/growth-content';
const content = growthPages.unlockKnowledge;
export const metadata = growthMetadata('Unlock Company Knowledge with Private AI', content.description, content.path);
export default function Page() { return <GrowthPage content={content} kind="solution" />; }
