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
  return <main id="main-content" className="bg-[#f7f6f2] text-slate-950">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    <section className="bg-[#071225] px-6 py-20 text-white sm:px-8 sm:py-28"><div className="mx-auto max-w-6xl"><p className="mb-5 text-sm font-bold uppercase tracking-[.18em] text-[#FFC46B]">Security</p><h1 className="max-w-4xl text-balance text-4xl font-black text-white sm:text-6xl">Control the knowledge. Control the access. Keep the evidence.</h1><p className="mx-0 mt-6 max-w-3xl text-lg text-slate-200">OfRoot designs company AI and automation systems around approved sources, explicit permissions, visible system behavior, and human control for sensitive actions.</p><p className="mx-0 mt-8 max-w-3xl border-l-2 border-[#37FFE0] pl-4 text-sm text-slate-300">Architected to support organization-specific privacy and security requirements. Specific controls depend on the selected architecture and customer environment.</p></div></section>
    <section className="px-6 py-20 sm:px-8"><div className="mx-auto max-w-6xl"><div className="grid gap-4 md:grid-cols-2">{safeguards.map(([title, body, Icon]) => <article key={title as string} className="rounded-2xl border border-slate-200 bg-white p-6"><div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#FFF1DF] text-[#A94F00]"><Icon className="h-5 w-5" /></div><h2 className="text-xl font-bold">{title}</h2><p className="mx-0 mt-2 text-sm text-slate-600">{body}</p></article>)}</div></div></section>
    <section className="border-y border-slate-200 bg-white px-6 py-20 sm:px-8"><div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2"><div><p className="mb-3 text-sm font-bold uppercase tracking-[.16em] text-[#B55B00]">Honest boundary</p><h2 className="text-3xl font-black">Architecture is not certification.</h2></div><div><p className="mx-0 text-lg text-slate-600">We do not claim HIPAA, SOC 2, GDPR, or another certification by default. During discovery, we identify the actual requirement, the systems in scope, the responsible parties, and the evidence needed to validate the final design.</p><Link href="/services/private-company-ai" className="mt-6 inline-flex font-semibold text-[#8F4700] hover:underline">Explore Private Company AI →</Link></div></div></section>
    <section className="bg-[#071225] px-6 py-16 text-white sm:px-8"><div className="mx-auto flex max-w-6xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between"><h2 className="max-w-2xl text-3xl font-black text-white">Start with your sources, access rules, and risk boundaries.</h2><TrackedLink href="/book?focus=security" source="security:final" className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#FF9312] px-6 py-3 font-semibold text-slate-950">Book a Growth Systems Audit</TrackedLink></div></section>
  </main>;
}
