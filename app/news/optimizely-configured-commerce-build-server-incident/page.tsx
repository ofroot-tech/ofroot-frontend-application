import { CONFIGURED_COMMERCE_NEWS_DRAFT, BUILD_SYSTEM_RETIREMENT_GUIDE_DRAFT } from '@/app/lib/security-editorial-20261122';
import SecurityArticle, { securityArticleMetadata } from '@/components/editorial/SecurityArticle';

export const metadata = securityArticleMetadata(CONFIGURED_COMMERCE_NEWS_DRAFT);

export default function ConfiguredCommerceIncidentDraftPage() {
  return <SecurityArticle article={CONFIGURED_COMMERCE_NEWS_DRAFT} related={BUILD_SYSTEM_RETIREMENT_GUIDE_DRAFT} />;
}
