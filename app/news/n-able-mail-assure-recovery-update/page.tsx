import { MAIL_ASSURE_NEWS_DRAFT, SAAS_RECOVERY_GUIDE_DRAFT } from '@/app/lib/security-editorial-20261123';
import SecurityArticle, { securityArticleMetadata } from '@/components/editorial/SecurityArticle';

export const metadata = securityArticleMetadata(MAIL_ASSURE_NEWS_DRAFT);

export default function MailAssureIncidentDraftPage() {
  return <SecurityArticle article={MAIL_ASSURE_NEWS_DRAFT} related={SAAS_RECOVERY_GUIDE_DRAFT} />;
}
