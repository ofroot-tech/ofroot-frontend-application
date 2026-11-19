import { OPTIMIZELY_NEWS, THIRD_PARTY_SCRIPT_GUIDE } from '@/app/lib/security-editorial-20261119';
import SecurityArticle, { securityArticleMetadata } from '@/components/editorial/SecurityArticle';

export const metadata = securityArticleMetadata(OPTIMIZELY_NEWS);

export default function OptimizelyIncidentPage() {
  return <SecurityArticle article={OPTIMIZELY_NEWS} related={THIRD_PARTY_SCRIPT_GUIDE} />;
}
