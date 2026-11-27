import { MYCOLORADO_NEWS_DRAFT, DOCUMENT_ACCESS_GUIDE_DRAFT } from '@/app/lib/security-editorial-20261127';
import SecurityArticle, { securityArticleMetadata } from '@/components/editorial/SecurityArticle';

export const metadata = securityArticleMetadata(MYCOLORADO_NEWS_DRAFT);

export default function MyColoradoNewsDraftPage() {
  return <SecurityArticle article={MYCOLORADO_NEWS_DRAFT} related={DOCUMENT_ACCESS_GUIDE_DRAFT} />;
}
