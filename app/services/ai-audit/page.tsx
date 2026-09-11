import type { Metadata } from 'next';
import AiAudit from '@/components/AiAudit';
import JsonLd from '@/components/seo/JsonLd';
import { SITE } from '@/app/config/site';

export const metadata: Metadata = {
  title: 'Free AI Website Readiness Scanner',
  description: 'Scan your public website for technical signals that help AI agents find, read, and use it. Get an Ora-powered score, evidence, and prioritized fixes.',
  alternates: { canonical: '/services/ai-audit' },
  openGraph: { title: 'Free AI Website Readiness Scanner | OfRoot', description: 'Run a technical website scan, see the evidence, and identify the next fixes.', url: '/services/ai-audit' },
};

export default function AiAuditPage() {
  return (
    <>
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'OfRoot AI Website Readiness Scanner',
        url: `${SITE.url}/services/ai-audit`,
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        isAccessibleForFree: true,
        description: 'A technical website scanner powered by Ora that evaluates whether AI agents can find, read, and use a public website.',
      }} />
      <AiAudit />
    </>
  );
}
