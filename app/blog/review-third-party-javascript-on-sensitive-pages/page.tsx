import { OPTIMIZELY_NEWS_DRAFT, THIRD_PARTY_SCRIPT_GUIDE_DRAFT } from '@/app/lib/security-editorial-20261119';
import SecurityArticle, { securityArticleMetadata } from '@/components/editorial/SecurityArticle';

export const metadata = securityArticleMetadata(THIRD_PARTY_SCRIPT_GUIDE_DRAFT);

export default function ThirdPartyScriptGuideDraftPage() {
  return <SecurityArticle article={THIRD_PARTY_SCRIPT_GUIDE_DRAFT} related={OPTIMIZELY_NEWS_DRAFT} />;
}
