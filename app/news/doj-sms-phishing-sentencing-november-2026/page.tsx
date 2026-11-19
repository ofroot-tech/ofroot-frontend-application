import { SMS_PHISHING_NEWS, ACCOUNT_RECOVERY_GUIDE } from '@/app/lib/security-editorial-20261118';
import SecurityArticle, { securityArticleMetadata } from '@/components/editorial/SecurityArticle';

export const metadata = securityArticleMetadata(SMS_PHISHING_NEWS);

export default function SentencingUpdatePage() {
  return <SecurityArticle article={SMS_PHISHING_NEWS} related={ACCOUNT_RECOVERY_GUIDE} />;
}
