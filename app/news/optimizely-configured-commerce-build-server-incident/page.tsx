import { CONFIGURED_COMMERCE_NEWS, BUILD_SYSTEM_RETIREMENT_GUIDE } from '@/app/lib/security-editorial-20261122';
import SecurityArticle, { securityArticleMetadata } from '@/components/editorial/SecurityArticle';

export const metadata = securityArticleMetadata(CONFIGURED_COMMERCE_NEWS);

export default function ConfiguredCommerceIncidentPage() {
  return <SecurityArticle article={CONFIGURED_COMMERCE_NEWS} related={BUILD_SYSTEM_RETIREMENT_GUIDE} />;
}
