import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { TrackedLink } from '@/components/growth/Analytics';
import HomeHero from '@/components/growth/HomeHero';
import styles from '@/components/growth/ApprovedHome.module.css';
import { SITE_URL } from '@/app/lib/growth-content';

const description = 'OfRoot helps growing businesses connect their tools, automate repetitive work, and set up useful AI. Work with one hands-on software and engineering partner.';
const title = 'Workflow Automation, Integrations & Practical AI';
export const metadata: Metadata = {
  title, description, alternates: { canonical: '/' },
  openGraph: { title: `OFROOT — ${title}`, description, url: SITE_URL, type: 'website', images: [{ url: `${SITE_URL}/opengraph-image`, width: 1200, height: 630, alt: 'OFROOT — Less manual work. More time to grow.' }] },
  twitter: { card: 'summary_large_image', title: `OFROOT — ${title}`, description, images: [`${SITE_URL}/opengraph-image`] },
};

const services = [
  { tag: 'Connect your tools', title: <>Stop moving data<br />by hand.</>, body: 'Connect your CRM, forms, reporting, and internal tools so your team spends less time copying records and chasing updates.', label: 'Discuss integrations and automation', href: '/services/automation-systems' },
  { tag: 'Put AI to work', title: <>Make AI useful<br />to your team.</>, body: 'Build AI around a specific task. Get help with setup, software integrations, approved company knowledge, and getting your team started.', label: 'Discuss AI setup and integrations', href: '/services/private-company-ai' },
  { tag: 'Improve your website', title: <>Give customers a<br />clear next step.</>, body: 'Build or improve your website so people understand your offer, trust your business, and know how to get in touch.', label: 'Discuss your website', href: '/services/ai-discoverability' },
];
const examples = [
  { type: 'Lead handoffs', title: <>Give every new inquiry<br />a clear next step.</>, body: 'Connect an inquiry form to your CRM, assign an owner, and flag anything that needs attention.', steps: ['Inquiry received', 'CRM updated', 'Owner notified'] },
  { type: 'Reporting', title: <>Spend less time<br />rebuilding the same report.</>, body: 'Bring records from different tools into one view, with clear sources and visible discrepancies.', steps: ['Sources connected', 'Records checked', 'Report ready'] },
  { type: 'Company knowledge', title: <>Help your team find<br />the answer and its source.</>, body: 'Set up AI to search approved documents and support a defined task, with access rules and human review where needed.', steps: ['Approved sources', 'Useful answers', 'Human review'] },
];
const questions = [
  { question: 'Do we have to replace the tools we use?', answer: 'We start by reviewing what you already have. Where practical, we connect and improve those tools. Any proposed replacement comes with a clear reason before you commit.' },
  { question: 'Can we start with one problem?', answer: 'Yes. We can scope one priority workflow, website change, or internal tool. We agree on the result and how to check it before the build begins.' },
  { question: 'Do we need an AI project to work with you?', answer: 'No. The right first step may be a better report, a website improvement, or connecting two tools. We recommend AI when it fits a useful task.' },
  { question: 'How is the work priced?', answer: <>Scope, software access, complexity, and support needs shape the price. We agree on the deliverables and cost before implementation. <Link href="/pricing">Review current engagement options →</Link></> },
  { question: 'What happens when I get in touch?', answer: 'Tell us about your business, where work gets stuck, and the outcome you want. We review your request and reply by email with a recommended next step. We arrange a conversation when there is a useful fit.' },
];

export default function HomePage() {
  const schema = { '@context': 'https://schema.org', '@type': 'ProfessionalService', name: 'OfRoot', url: SITE_URL, description, logo: `${SITE_URL}/ofroot-monogram.svg`, serviceType: ['Workflow automation', 'Software integrations', 'AI setup and integration', 'Website design and development'], areaServed: 'US' };
  return (
    <main id="main-content" className={styles.page}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <HomeHero />
      <section id="services" className={`${styles.shell} ${styles.services}`} aria-labelledby="services-heading">
        <div className={styles.sectionHeader}><div><p className={styles.sectionLabel}>Built around the work</p><h2 id="services-heading">Fix what slows<br />your business down.</h2></div><p>Start with a task that costs time, creates rework, or holds back growth. We’ll help you choose a useful first fix.</p></div>
        <div className={styles.serviceList}>{services.map(service => <article className={styles.serviceRow} key={service.tag}><span className={styles.serviceTag}>{service.tag}</span><h3>{service.title}</h3><p>{service.body}</p><Link href={service.href} aria-label={service.label}><ArrowRight className={styles.arrow} aria-hidden="true" /></Link></article>)}</div>
      </section>
      <section id="examples" className={styles.examples} aria-labelledby="examples-heading"><div className={styles.shell}>
        <div className={styles.sectionHeader}><div><p className={styles.sectionLabel}>Illustrative project scopes</p><h2 id="examples-heading">Small changes.<br />A clearer way to work.</h2></div><p>A few examples of work we can scope around your business. Each starts with a real task and a result we can check.</p></div>
        <div className={styles.exampleList}>{examples.map(example => <article className={styles.exampleRow} key={example.type}><div><span className={styles.exampleType}>{example.type}</span><h3>{example.title}</h3><p>{example.body}</p></div><div className={styles.workflow} aria-label="Example workflow">{example.steps.map((step, index) => <span key={step}>{index > 0 && <b aria-hidden="true">→ </b>}{step}</span>)}</div></article>)}</div>
      </div></section>
      <section id="approach" className={styles.method} aria-labelledby="method-heading"><div className={`${styles.shell} ${styles.methodInner}`}><div><p className={styles.sectionLabel}>Founder-led engineering</p><h2 id="method-heading">One hands-on partner.<br />From first fix onward.</h2></div><div className={styles.methodContent}><p>Work directly with Dimitri, a full-stack developer and solutions architect with 11 years in technology. Start with a defined problem, review the work as it develops, and agree on handoff or ongoing support.</p><div className={styles.steps}>{[['01 / Define', 'Agree on the scope'], ['02 / Build', 'Review the work'], ['03 / Validate', 'Launch & hand off']].map(([stage, label]) => <div className={styles.step} key={stage}><span>{stage}</span><b>{label}</b></div>)}</div><Link href="/solutions/home-services-automation" className={styles.audienceLink}>Explore a home-services workflow →</Link></div></div></section>
      <section className={`${styles.shell} ${styles.faq}`} aria-labelledby="faq-heading"><div className={styles.faqIntro}><p className={styles.sectionLabel}>Before we start</p><h2 id="faq-heading">A few useful answers.</h2><p>You can bring one specific problem or ask for help finding the right place to start.</p></div><div className={styles.faqList}>{questions.map(item => <details key={item.question}><summary>{item.question}</summary><p>{item.answer}</p></details>)}</div></section>
      <section id="contact" className={`${styles.shell} ${styles.closing}`} aria-labelledby="contact-heading"><div><h2 id="contact-heading">Where does the work<br />get stuck?</h2><p className={styles.closingNote}>Share the problem and the outcome you want.<br />We’ll review the fit and recommend a practical next step.</p></div><TrackedLink href="/book?source=homepage-final" source="homepage:final" className={styles.primary}><span>Discuss your project</span><ArrowRight className={styles.arrow} aria-hidden="true" /></TrackedLink></section>
    </main>
  );
}
