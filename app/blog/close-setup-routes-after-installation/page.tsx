import { DRUPAL_INSTALLER_NEWS_DRAFT, SETUP_ROUTE_GUIDE_DRAFT } from '@/app/lib/security-editorial-20261125';
import SecurityArticle, { securityArticleMetadata } from '@/components/editorial/SecurityArticle';

export const metadata = securityArticleMetadata(SETUP_ROUTE_GUIDE_DRAFT);

export default function SetupRouteGuideDraftPage() {
  return <SecurityArticle article={SETUP_ROUTE_GUIDE_DRAFT} related={DRUPAL_INSTALLER_NEWS_DRAFT} />;
}
