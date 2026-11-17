import { SECURITY_GUIDE } from '@/app/lib/application-security-content';
import SecurityArticle, { securityArticleMetadata } from '@/components/editorial/SecurityArticle';

export const metadata = securityArticleMetadata(SECURITY_GUIDE);

export default function ApplicationSecurityGuidePage() {
  return <SecurityArticle article={SECURITY_GUIDE} />;
}
