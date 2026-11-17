import Link from 'next/link';
import { ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import { growthMetadata, SITE_URL } from '@/app/lib/growth-content';
import { SECURITY_GUIDE, SECURITY_NEWS, SECURITY_SERVICE_PATH } from '@/app/lib/application-security-content';
import PublicHero from '@/components/growth/PublicHero';
import { PageView, TrackedLink } from '@/components/growth/Analytics';
import PartnerInquiryForm from '@/components/partners/PartnerInquiryForm';
import JsonLd from '@/components/seo/JsonLd';
import styles from '@/components/growth/PublicPage.module.css';

export const dynamic = 'force-dynamic';
export const metadata = growthMetadata('Application Security & Penetration Testing', 'Application security reviews, formal penetration testing with approved specialists, and engineering remediation for web applications and APIs.', SECURITY_SERVICE_PATH);

const engagements = [
  { title: 'Application security review', body: 'Examine code, architecture and configuration across authentication, permissions, APIs, dependencies and sensitive data. Define the checks around your application and its risks.' },
  { title: 'Formal penetration testing', body: 'Investigate attack paths with a client-approved security specialist. We agree the tester, availability, targets, methods and written authorization before testing begins.' },
  { title: 'Remediation and retesting', body: 'Turn findings into engineering changes. Reproduce the issue safely, implement the fix, check the intended workflow and retest the affected behavior.' },
];
const coverage = [
  ['Accounts and permissions', 'Sign-in, sessions, account recovery, role checks and separation between customers or tenants.'],
  ['APIs and application behavior', 'Input handling, uploads, webhooks, integrations and business rules that automated scans can miss.'],
  ['Dependencies and deployment', 'Exposed secrets, dependency advisories, environment settings, logging and release safeguards.'],
];
const questions = [
  { question: 'Who performs the penetration test?', answer: 'OfRoot coordinates a security specialist approved for your engagement. We confirm their suitability, availability, confidentiality terms and access with you before committing the work. OfRoot remains responsible for coordination, engineering remediation and client communication.' },
  { question: 'Can you test production?', answer: 'Only with explicit written authorization and agreed safeguards. The scope names the systems, user roles, permitted methods, testing window, monitoring, stop conditions and escalation contact. Third-party systems require their owner’s permission. A representative test environment is preferred where it can answer the testing question.' },
  { question: 'What do we receive?', answer: 'A report of the agreed checks, findings and limits, with supporting evidence, affected components, priorities and recommended fixes. Remediation and retesting can be scoped with the assessment. The handoff records resolved, deferred and open findings.' },
  { question: 'Does a test certify that our application is secure?', answer: 'A test covers a defined scope at a point in time. It cannot guarantee that all vulnerabilities have been found or confer a compliance certification. We agree the applicable standards and evidence requirements with you before work begins.' },
  { question: 'How is the engagement priced?', answer: 'Scope, application size, roles, environments, testing depth and retesting needs determine the proposal. Tester availability and commercial terms are confirmed before commitment. Start by describing the application and the question you need answered.' },
];

export default function ApplicationSecurityPage() {
  const enabled = process.env.PARTNER_INQUIRY_ENABLED === 'true' && Boolean(process.env.PARTNER_INQUIRY_DATABASE_URL) && (process.env.PARTNER_INQUIRY_HASH_SECRET?.length ?? 0) >= 32;
  return <main id="main-content" className={styles.page}>
    <PageView kind="service" name="application_security" />
    <JsonLd data={{ '@context': 'https://schema.org', '@type': 'Service', name: 'Application Security & Penetration Testing', description: 'Scoped security reviews, specialist-led penetration testing, remediation and retesting for web applications and APIs.', url: `${SITE_URL}${SECURITY_SERVICE_PATH}`, provider: { '@type': 'Organization', name: 'OfRoot Technology', url: SITE_URL } }} />
    <PublicHero eyebrow="Application Security & Penetration Testing" title="Find the risk. Fix what matters." description="Review your web application or API, test realistic attack paths, and turn findings into verified engineering fixes. OfRoot leads the engagement and coordinates formal penetration testing with approved security specialists."
      breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Services', href: '/services' }, { label: 'Application security' }]}
      primary={{ href: '#security-inquiry', label: 'Discuss a security engagement', source: 'application-security:hero' }}
      secondary={{ href: SECURITY_GUIDE.href, label: 'Read the security guide', source: 'application-security:guide' }} />
    <div className={styles.shell}>
      <section className={styles.section} aria-labelledby="security-engagements"><div className={styles.sectionHeader}><div><p className={styles.eyebrow}>Choose the question</p><h2 id="security-engagements" className={styles.sectionTitle}>From assessment to a checked fix.</h2></div><p>Start with one application, an upcoming release or a set of findings. We agree on the scope, responsible people and evidence needed to close the work.</p></div><div className={styles.grid}>{engagements.map(item => <article className={styles.card} key={item.title}><ShieldCheck className={styles.icon} aria-hidden="true" /><h3>{item.title}</h3><p>{item.body}</p></article>)}</div></section>
      <section className={styles.section} aria-labelledby="security-coverage"><div className={styles.split}><h2 id="security-coverage" className={styles.sectionTitle}>Review where access, data and trust meet.</h2><p>The exact coverage follows your architecture and business risks. For AI features, we can also review knowledge access, tool permissions and human approval boundaries.</p></div><div className={styles.grid}>{coverage.map(([title, body]) => <article className={styles.card} key={title}><CheckCircle2 className={styles.icon} aria-hidden="true" /><h3>{title}</h3><p>{body}</p></article>)}</div></section>
      <section className={styles.section} aria-labelledby="security-process"><div className={styles.split}><h2 id="security-process" className={styles.sectionTitle}>Clear permission. Useful evidence. Accountable follow-through.</h2><p>Written authorization comes before active testing. The agreed scope defines allowed methods and data access, the testing window, stop conditions and reporting. Findings become a prioritized plan; fixes and retesting have named owners.</p></div><ol className={styles.flow} aria-label="Security engagement process">{['Agree the scope and specialist', 'Authorize the review and tests', 'Review findings and priorities', 'Fix, retest and hand off'].map((step, index) => <li key={step}><span>{String(index + 1).padStart(2, '0')}</span>{step}</li>)}</ol></section>
      <section className={styles.section} aria-labelledby="security-reading"><div className={styles.split}><h2 id="security-reading" className={styles.sectionTitle}>Understand the work. Follow what changes.</h2><p>Our guide explains how a review and penetration test fit together. Signal connects recent security developments to the questions application owners should ask.</p></div><div className={styles.columns}><article className={styles.card}><p className={styles.eyebrow}>From the blog</p><h3>{SECURITY_GUIDE.title}</h3><p>{SECURITY_GUIDE.description}</p><Link className={styles.textLink} href={SECURITY_GUIDE.href}>Read the guide <ArrowRight aria-hidden="true" /></Link></article><article className={styles.card}><p className={styles.eyebrow}>Signal / November 17, 2026</p><h3>{SECURITY_NEWS.title}</h3><p>Short summaries of recent CISA, Next.js and PHP records, with source dates and practical checks.</p><Link className={styles.textLink} href={SECURITY_NEWS.href}>Read the security briefing <ArrowRight aria-hidden="true" /></Link><Link className={styles.textLink} href="/news/briefs?topic=cybersecurity">Browse current security briefs <ArrowRight aria-hidden="true" /></Link></article></div></section>
      <section className={styles.section} aria-labelledby="security-questions"><h2 id="security-questions" className={styles.sectionTitle}>Before we begin.</h2><div className="mt-8 space-y-4">{questions.map(item => <details key={item.question} className={styles.card}><summary className="cursor-pointer py-2 text-lg font-semibold">{item.question}</summary><p className="mt-4">{item.answer}</p></details>)}</div></section>
      <section id="security-inquiry" className={`${styles.section} scroll-mt-24`} aria-labelledby="security-inquiry-heading"><div className={styles.split}><div><p className={styles.eyebrow}>Start with your application</p><h2 id="security-inquiry-heading" className={styles.sectionTitle}>What do you need to understand or fix?</h2><p className={styles.note}>Describe the application, the kind of assessment you need and your timeframe. Leave out credentials, exploit details and sensitive customer data. We agree on a secure way to share technical evidence after reviewing the request.</p><TrackedLink href={SECURITY_GUIDE.href} source="application-security:intake-guide" className={styles.textLink}>See what a useful scope includes <ArrowRight aria-hidden="true" /></TrackedLink></div><PartnerInquiryForm enabled={enabled} intent="security" /></div></section>
    </div>
  </main>;
}
