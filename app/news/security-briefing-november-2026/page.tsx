import { SECURITY_NEWS } from '@/app/lib/application-security-content';
import SecurityArticle, { securityArticleMetadata } from '@/components/editorial/SecurityArticle';

export const metadata = securityArticleMetadata(SECURITY_NEWS);

export default function SecurityBriefingPage() {
  return <SecurityArticle article={SECURITY_NEWS} />;
}
