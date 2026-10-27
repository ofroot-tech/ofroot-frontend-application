import PublicHero from '@/components/growth/PublicHero';
import publicStyles from '@/components/growth/PublicPage.module.css';
import Link from 'next/link';
import { LockKeyhole, FileCheck2, ShieldCheck, UserCheck } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { growthMetadata, SITE_URL } from '@/app/lib/growth-content';
import { TrackedLink } from '@/components/growth/Analytics';

export const metadata = growthMetadata('Security Approach', 'How OfRoot designs company AI and automation systems around access, evidence, isolation, and human control.', '/security');

const safeguards: Array<[string, string, LucideIcon]> = [
  ['Customer-controlled sources', 'Connect only the sources the organization approves.', LockKeyhole],
  ['Permission-aware retrieval', 'Apply user and source permissions before returning context.', UserCheck],
  ['Source-backed responses', 'Link important answers to the material used to produce them.', FileCheck2],
  ['Data isolation', 'Design tenant and customer boundaries as explicit system contracts.', ShieldCheck],
  ['Encryption', 'Use encryption in transit and at rest where supported by the selected infrastructure.', LockKeyhole],
  ['Role-based access', 'Limit access by job responsibility and approved workspace.', UserCheck],
  ['Audit logging', 'Record meaningful access and system actions for review.', FileCheck2],
  ['Human approval', 'Keep sensitive actions behind an explicit person or authorized workflow.', UserCheck],
  ['Model-provider flexibility', 'Choose providers and deployment patterns based on the use case and risk.', ShieldCheck],
  ['Private deployment options', 'Evaluate dedicated or private infrastructure when requirements justify it.', LockKeyhole],
];

export default function SecurityPage() {
  const schema = { '@context': 'https://schema.org', '@type': 'WebPage', name: 'OfRoot Security Approach', url: `${SITE_URL}/security`, description: 'Security principles for OfRoot AI growth systems.' };
  return <main id="main-content" className={`${publicStyles.page} ${publicStyles.legacy} bg-[#17141f] text-[#faf9fc]`}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
        <PublicHero eyebrow="Security" title="Control the knowledge. Control the access. Keep the evidence." description="OfRoot designs company AI and automation systems around approved sources, explicit permissions, visible system behavior, and human control for sensitive actions." breadcrumbs={[{label:'Home',href:'/'},{label:'Security'}]}><p className={publicStyles.note}>Architected to support organization-specific privacy and security requirements. Specific controls depend on the selected architecture and customer environment.</p></PublicHero>
    <section className="px-6 py-20 sm:px-8"><div className="mx-auto max-w-6xl"><div className="grid gap-4 md:grid-cols-2">{safeguards.map(([title, body, Icon]) => <article key={title as string} className="rounded-[2px] border border-[#d2caeb]/16 bg-[#211c2c] p-6"><div className="mb-4 flex h-10 w-10 items-center justify-center rounded-[2px] bg-[#30263d] text-[#c4abe3]"><Icon className="h-5 w-5" /></div><h2 className="text-xl font-bold">{title}</h2><p className="mx-0 mt-2 text-sm text-[#c0b5cc]">{body}</p></article>)}</div></div></section>
    <section className="border-y border-[#d2caeb]/16 bg-[#211c2c] px-6 py-20 sm:px-8"><div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2"><div><p className="mb-3 text-sm font-bold uppercase tracking-[.16em] text-[#c4abe3]">Honest boundary</p><h2 className="text-3xl font-medium">Architecture is not certification.</h2></div><div><p className="mx-0 text-lg text-[#c0b5cc]">We do not claim HIPAA, SOC 2, GDPR, or another certification by default. During discovery, we identify the actual requirement, the systems in scope, the responsible parties, and the evidence needed to validate the final design.</p><Link href="/services/private-company-ai" className="mt-6 inline-flex font-semibold text-[#e1c7f2] hover:underline">Explore Private Company AI →</Link></div></div></section>
    <section className="bg-[#211c2c] px-6 py-16 text-white sm:px-8"><div className="mx-auto flex max-w-6xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between"><h2 className="max-w-2xl text-3xl font-medium text-white">Start with your sources, access rules, and risk boundaries.</h2><TrackedLink href="/book?focus=security" source="security:final" className="inline-flex min-h-12 items-center justify-center rounded-[2px] bg-[#574064] px-6 py-3 font-semibold text-[#faf9fc]">Book a Growth Systems Audit</TrackedLink></div></section>
  </main>;
}
