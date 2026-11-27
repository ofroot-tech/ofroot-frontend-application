import { MYCOLORADO_NEWS_DRAFT, DOCUMENT_ACCESS_GUIDE_DRAFT } from '@/app/lib/security-editorial-20261127';
import SecurityArticle, { securityArticleMetadata } from '@/components/editorial/SecurityArticle';

export const metadata = securityArticleMetadata(DOCUMENT_ACCESS_GUIDE_DRAFT);

export default function DocumentAccessGuideDraftPage() {
  return <SecurityArticle article={DOCUMENT_ACCESS_GUIDE_DRAFT} related={MYCOLORADO_NEWS_DRAFT} />;
}
