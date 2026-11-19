import { SMS_PHISHING_NEWS_DRAFT, ACCOUNT_RECOVERY_GUIDE_DRAFT } from '@/app/lib/security-editorial-20261118';
import SecurityArticle, { securityArticleMetadata } from '@/components/editorial/SecurityArticle';

export const metadata = securityArticleMetadata(SMS_PHISHING_NEWS_DRAFT);

export default function SentencingUpdateDraftPage() {
  return <SecurityArticle article={SMS_PHISHING_NEWS_DRAFT} related={ACCOUNT_RECOVERY_GUIDE_DRAFT} />;
}
