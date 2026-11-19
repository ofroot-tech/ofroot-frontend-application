import { OPTIMIZELY_NEWS, THIRD_PARTY_SCRIPT_GUIDE } from '@/app/lib/security-editorial-20261119';
import SecurityArticle, { securityArticleMetadata } from '@/components/editorial/SecurityArticle';

export const metadata = securityArticleMetadata(THIRD_PARTY_SCRIPT_GUIDE);

export default function ThirdPartyScriptGuidePage() {
  return <SecurityArticle article={THIRD_PARTY_SCRIPT_GUIDE} related={OPTIMIZELY_NEWS} />;
}
