import { OPTIMIZELY_NEWS_DRAFT, THIRD_PARTY_SCRIPT_GUIDE_DRAFT } from '@/app/lib/security-editorial-20261119';
import SecurityArticle, { securityArticleMetadata } from '@/components/editorial/SecurityArticle';

export const metadata = securityArticleMetadata(OPTIMIZELY_NEWS_DRAFT);

export default function OptimizelyIncidentDraftPage() {
  return <SecurityArticle article={OPTIMIZELY_NEWS_DRAFT} related={THIRD_PARTY_SCRIPT_GUIDE_DRAFT} />;
}
