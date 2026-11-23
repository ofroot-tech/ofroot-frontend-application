import { CONFIGURED_COMMERCE_NEWS, BUILD_SYSTEM_RETIREMENT_GUIDE } from '@/app/lib/security-editorial-20261122';
import SecurityArticle, { securityArticleMetadata } from '@/components/editorial/SecurityArticle';

export const metadata = securityArticleMetadata(BUILD_SYSTEM_RETIREMENT_GUIDE);

export default function BuildSystemRetirementGuidePage() {
  return <SecurityArticle article={BUILD_SYSTEM_RETIREMENT_GUIDE} related={CONFIGURED_COMMERCE_NEWS} />;
}
