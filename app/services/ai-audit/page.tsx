import type { Metadata } from 'next';
import AiAudit from '@/components/AiAudit';

export const metadata: Metadata = {
  title: 'Free AI Readiness Audit',
  description: 'Can AI agents find, read, and use your website? Get a free readiness report powered by Ora, then let OfRoot help implement the fixes.',
  alternates: { canonical: '/services/ai-audit' },
  openGraph: { title: 'How does your website look to AI? | OfRoot', description: 'Run a free scan. See the evidence. Find your next fix.', url: '/services/ai-audit' },
};

export default function AiAuditPage() {
  return <AiAudit />;
}
