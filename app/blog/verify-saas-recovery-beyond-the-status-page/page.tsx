import { MAIL_ASSURE_NEWS_DRAFT, SAAS_RECOVERY_GUIDE_DRAFT } from '@/app/lib/security-editorial-20261123';
import SecurityArticle, { securityArticleMetadata } from '@/components/editorial/SecurityArticle';

export const metadata = securityArticleMetadata(SAAS_RECOVERY_GUIDE_DRAFT);

export default function SaaSRecoveryGuideDraftPage() {
  return <SecurityArticle article={SAAS_RECOVERY_GUIDE_DRAFT} related={MAIL_ASSURE_NEWS_DRAFT} />;
}
