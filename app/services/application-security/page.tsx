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
export const metadata = growthMetadata('Application Security & Penetration Testing', 'Find security gaps in your web applications and APIs. Get a security review, specialist penetration testing and hands-on help with fixes.', SECURITY_SERVICE_PATH);

const engagements = [
  { title: 'Application security review', body: 'Understand where your application needs attention. We review your code, user permissions, integrations and dependencies, then explain the risks and practical improvements.' },
  { title: 'Penetration testing', body: 'See how weaknesses could be exploited. A security specialist tests realistic attack paths in your application and explains what the findings mean for your business.' },
  { title: 'Security fixes and retesting', body: 'Get help putting findings right. OfRoot can implement fixes, check that reported issues are resolved, and test that your customers can still use the application as intended.' },
];
const coverage = [
  ['Customer accounts and data', 'Review sign-in, account recovery and the rules that determine who can see or change a customer’s information.'],
  ['APIs and connected services', 'Check how your application handles requests, uploads and integrations, including the business rules behind important actions.'],
  ['The software behind your app', 'Review dependencies, sensitive credentials and hosting settings that can expose an otherwise well-built application.'],
];
const questions = [
  { question: 'Who performs the penetration test?', answer: 'OfRoot arranges testing with a security specialist agreed with you. Your proposal confirms who will perform the work, their availability, what they will test and how your information will be handled. OfRoot manages the engagement and can provide the engineering work needed to address findings.' },
  { question: 'Can you test our live application?', answer: 'Yes, when it is appropriate and the system owner gives written permission. We agree the testing window, permitted methods, safeguards and a contact who can pause the test. We may recommend a representative test environment instead. Testing another company’s systems requires that owner’s permission.' },
  { question: 'What will we receive?', answer: 'A clear report of the findings, supporting evidence, likely impact and recommended fixes. It explains what was tested and any limits. You can also include engineering help and retesting, with a closing record of what has been resolved and what still needs attention.' },
  { question: 'Does a test guarantee that our application is secure?', answer: 'No assessment can find every vulnerability. A test examines an agreed part of your application at a point in time. New code and newly discovered issues can change the picture. Testing does not provide a compliance certification.' },
  { question: 'What will it cost?', answer: 'The proposal depends on your applications, user roles, environments and testing needs. We will discuss those with you and confirm the work, specialist availability and price before you commit. Fixes and retesting can be included or priced separately.' },
];

export default function ApplicationSecurityPage() {
  const enabled = process.env.PARTNER_INQUIRY_ENABLED === 'true' && Boolean(process.env.PARTNER_INQUIRY_DATABASE_URL) && (process.env.PARTNER_INQUIRY_HASH_SECRET?.length ?? 0) >= 32;
  return <main id="main-content" className={styles.page}>
    <PageView kind="service" name="application_security" />
    <JsonLd data={{ '@context': 'https://schema.org', '@type': 'Service', name: 'Application Security & Penetration Testing', description: 'Security reviews, specialist penetration testing and hands-on fixes for web applications and APIs.', url: `${SITE_URL}${SECURITY_SERVICE_PATH}`, provider: { '@type': 'Organization', name: 'OfRoot Technology', url: SITE_URL } }} />
    <PublicHero eyebrow="Application Security & Penetration Testing" title="Find security gaps. Get them fixed." description="Security reviews, specialist penetration testing and hands-on fixes for the web applications and APIs your business relies on. Understand what needs attention and get help putting it right."
      breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Services', href: '/services' }, { label: 'Application security' }]}
      primary={{ href: '#security-inquiry', label: 'Discuss your security needs', source: 'application-security:hero' }}
      secondary={{ href: SECURITY_GUIDE.href, label: 'Read the security guide', source: 'application-security:guide' }} />
    <div className={styles.shell}>
      <section className={styles.section} aria-labelledby="security-engagements"><div className={styles.sectionHeader}><div><h2 id="security-engagements" className={styles.sectionTitle}>Security help for your next step.</h2></div><p>Preparing to launch, reviewing an established product or working through security findings? Choose the help you need, from an initial assessment to fixing and retesting issues.</p></div><div className={styles.grid}>{engagements.map(item => <article className={styles.card} key={item.title}><ShieldCheck className={styles.icon} aria-hidden="true" /><h3>{item.title}</h3><p>{item.body}</p></article>)}</div></section>
      <section className={styles.section} aria-labelledby="security-coverage"><div className={styles.split}><h2 id="security-coverage" className={styles.sectionTitle}>Know what you’re protecting.</h2><p>We focus on the parts of your application that handle access, customer data and important business actions. For AI features, that includes the information an assistant can use and the actions it can take.</p></div><div className={styles.grid}>{coverage.map(([title, body]) => <article className={styles.card} key={title}><CheckCircle2 className={styles.icon} aria-hidden="true" /><h3>{title}</h3><p>{body}</p></article>)}</div></section>
      <section className={styles.section} aria-labelledby="security-process"><div className={styles.split}><h2 id="security-process" className={styles.sectionTitle}>Leave with answers and a plan.</h2><p>Understand the findings, their likely impact and what to do about them. Your report gives your team practical recommendations. If you need help making the changes, OfRoot can take the work through implementation and retesting.</p></div><ol className={styles.flow} aria-label="How to work with OfRoot">{['Tell us about your application', 'Choose your assessment', 'Review your findings', 'Fix and retest'].map((step, index) => <li key={step}><span>{String(index + 1).padStart(2, '0')}</span>{step}</li>)}</ol></section>
      <section className={styles.section} aria-labelledby="security-reading"><div className={styles.split}><h2 id="security-reading" className={styles.sectionTitle}>Make sense of application security.</h2><p>Learn what to expect from a review or penetration test, and follow security developments that could affect the software you use.</p></div><div className={styles.columns}><article className={styles.card}><p className={styles.eyebrow}>From the blog</p><h3>{SECURITY_GUIDE.title}</h3><p>{SECURITY_GUIDE.description}</p><Link className={styles.textLink} href={SECURITY_GUIDE.href}>Read the guide <ArrowRight aria-hidden="true" /></Link></article><article className={styles.card}><p className={styles.eyebrow}>Signal / November 17, 2026</p><h3>{SECURITY_NEWS.title}</h3><p>What recent CISA, Next.js and PHP security updates mean for application owners, with links to the original sources.</p><Link className={styles.textLink} href={SECURITY_NEWS.href}>Read the security briefing <ArrowRight aria-hidden="true" /></Link><Link className={styles.textLink} href="/news/briefs?topic=cybersecurity">Browse current security briefs <ArrowRight aria-hidden="true" /></Link></article></div></section>
      <section className={styles.section} aria-labelledby="security-questions"><h2 id="security-questions" className={styles.sectionTitle}>Your questions, answered.</h2><div className="mt-8 space-y-4">{questions.map(item => <details key={item.question} className={styles.card}><summary className="cursor-pointer py-2 text-lg font-semibold">{item.question}</summary><p className="mt-4">{item.answer}</p></details>)}</div></section>
      <section id="security-inquiry" className={`${styles.section} scroll-mt-24`} aria-labelledby="security-inquiry-heading"><div className={styles.split}><div><h2 id="security-inquiry-heading" className={styles.sectionTitle}>Tell us about your application.</h2><p className={styles.note}>What does your application do, what concerns you and when do you need help? A short overview is enough to start. Please leave out passwords, exploit details and sensitive customer information.</p><TrackedLink href={SECURITY_GUIDE.href} source="application-security:intake-guide" className={styles.textLink}>Learn what a security review includes <ArrowRight aria-hidden="true" /></TrackedLink></div><PartnerInquiryForm enabled={enabled} intent="security" /></div></section>
    </div>
  </main>;
}
