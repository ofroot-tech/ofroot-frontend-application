import { SMS_PHISHING_NEWS, ACCOUNT_RECOVERY_GUIDE } from '@/app/lib/security-editorial-20261118';
import SecurityArticle, { securityArticleMetadata } from '@/components/editorial/SecurityArticle';

export const metadata = securityArticleMetadata(ACCOUNT_RECOVERY_GUIDE);

export default function AccountRecoveryGuidePage() {
  return <SecurityArticle article={ACCOUNT_RECOVERY_GUIDE} related={SMS_PHISHING_NEWS} />;
}
