import { SMS_PHISHING_NEWS_DRAFT, ACCOUNT_RECOVERY_GUIDE_DRAFT } from '@/app/lib/security-editorial-20261118';
import SecurityArticle, { securityArticleMetadata } from '@/components/editorial/SecurityArticle';

export const metadata = securityArticleMetadata(ACCOUNT_RECOVERY_GUIDE_DRAFT);

export default function AccountRecoveryGuideDraftPage() {
  return <SecurityArticle article={ACCOUNT_RECOVERY_GUIDE_DRAFT} related={SMS_PHISHING_NEWS_DRAFT} />;
}
