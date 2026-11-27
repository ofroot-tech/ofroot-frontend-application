import { DRUPAL_INSTALLER_NEWS, SETUP_ROUTE_GUIDE } from '@/app/lib/security-editorial-20261125';
import SecurityArticle, { securityArticleMetadata } from '@/components/editorial/SecurityArticle';

export const metadata = securityArticleMetadata(SETUP_ROUTE_GUIDE);

export default function SetupRouteGuidePage() {
  return <SecurityArticle article={SETUP_ROUTE_GUIDE} related={DRUPAL_INSTALLER_NEWS} />;
}
