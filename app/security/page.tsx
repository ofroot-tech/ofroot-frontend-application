import PublicHero from '@/components/growth/PublicHero';
import publicStyles from '@/components/growth/PublicPage.module.css';
import Link from 'next/link';
import { LockKeyhole, FileCheck2, ShieldCheck, UserCheck } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { growthMetadata, SITE_URL } from '@/app/lib/growth-content';
import { TrackedLink } from '@/components/growth/Analytics';
import { SECURITY_GUIDE, SECURITY_SERVICE_PATH } from '@/app/lib/application-security-content';

export const metadata = growthMetadata('Our Security Approach', 'Build access controls, data protection and human review into your applications, integrations and AI tools with OfRoot.', '/security');

const safeguards: Array<[string, string, LucideIcon]> = [
  ['Choose what your AI can use', 'Connect the documents and records you approve for a specific task.', LockKeyhole],
  ['Keep access tied to people’s roles', 'Build checks around who should be able to view information or take an action.', UserCheck],
  ['Trace answers to their sources', 'Help people check important AI answers against the documents behind them.', FileCheck2],
  ['Separate customer workspaces', 'Design clear boundaries between customers, teams and the information they use.', ShieldCheck],
  ['Protect data in transit and storage', 'Choose infrastructure and encryption settings that fit the information your application handles.', LockKeyhole],
  ['Review important activity', 'Keep useful records of access and significant actions so your team can investigate problems.', FileCheck2],
  ['Keep people in control', 'Require human review for sensitive actions such as sharing information or changing important records.', UserCheck],
  ['Choose the right hosting setup', 'Compare hosting and AI providers against your data, privacy and operating needs.', ShieldCheck],
];

export default function SecurityPage() {
  const schema = { '@context': 'https://schema.org', '@type': 'WebPage', name: 'OfRoot Security Approach', url: `${SITE_URL}/security`, description: 'How OfRoot helps clients build access controls, data protection and human review into software.' };
  return <main id="main-content" className={`${publicStyles.page} ${publicStyles.legacy} bg-[#17141f] text-[#faf9fc]`}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
        <PublicHero eyebrow="Our security approach" title="Keep your data in the right hands." description="Your software should give people the access they need and make sensitive work easy to review. We help you build those controls into your applications, integrations and AI tools." breadcrumbs={[{label:'Home',href:'/'},{label:'Security'}]} primary={{href:`${SECURITY_SERVICE_PATH}#security-inquiry`,label:'Discuss your security needs',source:'security:hero'}} secondary={{href:SECURITY_GUIDE.href,label:'Read the security guide',source:'security:guide'}} />
    <section className="px-6 py-20 sm:px-8"><div className="mx-auto max-w-6xl"><div className="grid gap-4 md:grid-cols-2">{safeguards.map(([title, body, Icon]) => <article key={title as string} className="rounded-[2px] border border-[#d2caeb]/16 bg-[#211c2c] p-6"><div className="mb-4 flex h-10 w-10 items-center justify-center rounded-[2px] bg-[#30263d] text-[#c4abe3]"><Icon className="h-5 w-5" aria-hidden="true" /></div><h2 className="text-xl font-bold">{title}</h2><p className="mx-0 mt-2 text-sm text-[#c0b5cc]">{body}</p></article>)}</div></div></section>
    <section className="border-y border-[#d2caeb]/16 bg-[#211c2c] px-6 py-20 sm:px-8"><div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2"><div><h2 className="text-3xl font-medium">Planning for a customer audit or security requirement?</h2></div><div><p className="mx-0 text-lg text-[#c0b5cc]">Bring the requirements your customers, contracts or industry place on your software. We can help identify the technical work and supporting evidence your team needs. A software review or engineering engagement does not provide a compliance certification.</p><Link href={SECURITY_SERVICE_PATH} className="mt-6 inline-flex min-h-11 items-center font-semibold text-[#e1c7f2] hover:underline">Explore application security services →</Link></div></div></section>
    <section className="px-6 py-16 sm:px-8"><div className="mx-auto max-w-6xl"><h2 className="text-3xl font-medium">Need an application assessment?</h2><p className="mx-0 mt-4 max-w-3xl text-[#c0b5cc]">Explore security reviews, formal penetration testing with approved specialists, and engineering help to resolve and retest findings.</p><Link href="/services/application-security" className="mt-6 inline-flex min-h-11 items-center font-semibold text-[#e1c7f2] underline underline-offset-4">Explore application security and penetration testing →</Link></div></section>
    <section className="border-t border-[#d2caeb]/16 px-6 py-16 sm:px-8" aria-labelledby="security-repository-check">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2">
        <div><p className="font-mono text-xs uppercase tracking-widest text-[#c4abe3]">Free open-source tool</p><h2 id="security-repository-check" className="mt-4 text-3xl font-medium">Review repository findings locally.</h2></div>
        <div>
          <p className="mx-0 text-lg text-[#c0b5cc]">OfRoot Repository Check flags selected credential and code patterns, with optional checks for possible sensitive health data. Scans stay in your environment, with no OfRoot account or uploads. Default reports omit matched values, source snippets and file paths.</p>
          <p className="mx-0 mt-4 text-sm text-[#c0b5cc]">You decide what needs action. The scanner reports findings for review without blocking commits or changing code. It reads the Git snapshot you stage, leaving unstaged edits, untracked files and history outside its scope. Its limited checks can miss issues and do not certify security or HIPAA compliance.</p>
          <a href="https://github.com/ofroot-tech/ofroot-repository-check" className="mt-6 inline-flex min-h-11 items-center font-semibold text-[#e1c7f2] underline underline-offset-4">Get OfRoot Repository Check on GitHub →</a>
        </div>
      </div>
    </section>
    <section className="bg-[#211c2c] px-6 py-16 text-white sm:px-8"><div className="mx-auto flex max-w-6xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between"><h2 className="max-w-2xl text-3xl font-medium text-white">Tell us what you need to protect.</h2><TrackedLink href={`${SECURITY_SERVICE_PATH}#security-inquiry`} source="security:final" className="inline-flex min-h-12 items-center justify-center rounded-[2px] bg-[#574064] px-6 py-3 font-semibold text-[#faf9fc]">Discuss your security needs</TrackedLink></div></section>
  </main>;
}
