import { CONFIGURED_COMMERCE_NEWS_DRAFT, BUILD_SYSTEM_RETIREMENT_GUIDE_DRAFT } from '@/app/lib/security-editorial-20261122';
import SecurityArticle, { securityArticleMetadata } from '@/components/editorial/SecurityArticle';

export const metadata = securityArticleMetadata(BUILD_SYSTEM_RETIREMENT_GUIDE_DRAFT);

export default function BuildSystemRetirementGuideDraftPage() {
  return <SecurityArticle article={BUILD_SYSTEM_RETIREMENT_GUIDE_DRAFT} related={CONFIGURED_COMMERCE_NEWS_DRAFT} />;
}
