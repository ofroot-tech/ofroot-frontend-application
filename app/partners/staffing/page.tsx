import type { Metadata } from 'next';
import { ArrowRight } from 'lucide-react';
import { CANONICAL_SITE_URL } from '@/app/config/site';
import JsonLd from '@/components/seo/JsonLd';
import PartnerInquiryForm from '@/components/partners/PartnerInquiryForm';
import { PartnerPageView, PartnerTrackedLink } from '@/components/partners/PartnerAnalytics';
import styles from '@/components/partners/PartnerPage.module.css';

export const dynamic = 'force-dynamic';

const path = '/partners/staffing';
const title = 'Senior Engineering for Staffing & Talent Partners';
const description = 'Founder-led full-stack engineering and technical leadership for staffing firms, talent partners and consultancies. Embedded roles or managed project delivery.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${CANONICAL_SITE_URL}${path}` },
  openGraph: {
    title,
    description,
    url: `${CANONICAL_SITE_URL}${path}`,
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title, description },
};

const partners = [
  { title: 'Staffing & recruiting firms', body: 'Bring full-stack engineering and technical leadership to your client’s team, with a direct line to the person doing the work.' },
  { title: 'Talent acquisition partners', body: 'Find support for a technical role. Share the skills, responsibilities and team context so we can discuss the right fit.' },
  { title: 'Delivery consultancies', body: 'Get help with a defined project or part of a larger delivery, with clear responsibilities and technical oversight.' },
];

// TODO(founder approval): Confirm the advertised stack against the approved bio
// and current expertise before publication; do not add tenure or proficiency claims.
const capabilities = [
  { title: 'Application engineering', items: 'Laravel / PHP · React / Next.js · Vue · Node.js / TypeScript', body: 'Build and improve web applications, from individual features to ongoing development and technical leadership.' },
  { title: 'Connected systems', items: 'SQL · APIs · Cloud / AWS · Internal tools', body: 'Connect applications, data and business tools so information moves reliably between the systems your client uses.' },
  { title: 'Modernization & practical AI', items: 'Legacy applications · Workflow tooling · AI-assisted internal systems', body: 'Update existing software, improve recurring workflows or explore a focused AI use case with appropriate human review.' },
];

const engagementProcess = [
  { title: 'Tell us what you need', body: 'Share the role or project, the team it supports and your preferred start date.' },
  { title: 'Discuss the fit', body: 'Talk through the technical requirements, relevant experience and current availability.' },
  { title: 'Choose how we work', body: 'Decide whether an embedded engineer or a project led by OfRoot best fits the work.' },
  { title: 'Make a plan', body: 'Set the responsibilities, milestones, communication and access requirements together.' },
  { title: 'Agree the terms', body: 'Put the scope, pricing, deliverables and working arrangement in writing.' },
  { title: 'Get started', body: 'Make introductions, set up access and agree the first priorities at kickoff.' },
];

const questions = [
  { question: 'Do you work through W-2, 1099 or vendor agreements?', answer: 'Share your agency’s contracting requirements. We’ll review whether the arrangement fits the role, work location and client terms before moving forward.' },
  { question: 'Is an engineer available immediately, and can the work be remote?', answer: 'Tell us your preferred start date, location requirements and timezone overlap. We’ll confirm current availability and working arrangements during the first conversation.' },
  { question: 'Will the work be subcontracted?', answer: 'Embedded work is delivered personally by Dimitri. For managed projects, any additional developers and their access are agreed with you and your client before kickoff.' },
  { question: 'Can you meet geographic or data-access restrictions?', answer: 'Tell us where work must take place and how client data may be accessed. We’ll review those requirements before proposing contributors or requesting access to your systems.' },
  { question: 'How are confidentiality, IP and security handled?', answer: 'We agree confidentiality, ownership of the work, approved tools and security requirements in the engagement contract before work begins.' },
  { question: 'What are the rates and typical timelines?', answer: 'Share the role or project, expected hours and target dates. We’ll discuss pricing and timing for your engagement, including what’s included and how changes to the scope are handled.' },
  { question: 'Can we review relevant engineering work?', answer: 'Ask about experience relevant to your stack and project. We can discuss technical approaches and share examples where client confidentiality allows.' },
];

export default function StaffingPartnersPage() {
  return (
    <main id="main-content" className={styles.page}>
      <PartnerPageView />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: 'Engineering partnership',
        serviceType: ['Embedded engineering', 'Managed engineering delivery'],
        description,
        url: `${CANONICAL_SITE_URL}${path}`,
        provider: { '@type': 'Organization', name: 'OfRoot Technology', url: CANONICAL_SITE_URL },
      }} />

      <section className={styles.hero} aria-labelledby="partner-heading">
        <div className={styles.shell}>
          <p className={styles.eyebrow}>For staffing, talent &amp; consulting partners</p>
          <h1 id="partner-heading">Senior Engineering Expertise for Your Client Engagements</h1>
          <div className={styles.heroDetail}>
            <div>
              <p className={styles.intro}>Bring full-stack engineering, integrations and technical leadership to your next client engagement. Work directly with an embedded senior engineer or put a defined project in OfRoot’s hands.</p>
              <div className={styles.actions}>
                <PartnerTrackedLink href="#partnership-inquiry" placement="partner_hero" className={styles.primary}>Discuss an Engineering Partnership<ArrowRight aria-hidden="true" /></PartnerTrackedLink>
                <PartnerTrackedLink href="#partnership-inquiry" placement="partner_availability" className={styles.secondary}>Request Capabilities &amp; Availability<ArrowRight aria-hidden="true" /></PartnerTrackedLink>
              </div>
            </div>
            <aside className={styles.heroNote} aria-label="Engagement principles">
              <p className={styles.eyebrow}>Working with OfRoot</p>
              <p>A direct line to your engineer.<br />Clear responsibilities.<br />A scope agreed together.</p>
              <span>Let’s talk through your requirements and timing.</span>
            </aside>
          </div>
        </div>
      </section>

      <section className={`${styles.shell} ${styles.section}`} aria-labelledby="partner-types-heading">
        <div className={styles.sectionHeader}>
          <div><p className={styles.eyebrow}>For your next engagement</p><h2 id="partner-types-heading">Engineering support<br />for your client’s work.</h2></div>
          <p>Whether you’re filling a technical role or delivering a project, we’ll help you choose a practical way to work together.</p>
        </div>
        <div className={styles.partnerList}>{partners.map(partner => <article key={partner.title}><h3>{partner.title}</h3><p>{partner.body}</p></article>)}</div>
      </section>

      <section className={styles.modelsSection} aria-labelledby="models-heading">
        <div className={styles.shell}>
          <div className={styles.sectionHeader}>
            <div><p className={styles.eyebrow}>Two ways to work together</p><h2 id="models-heading">An engineer on your team.<br />Or a project in our hands.</h2></div>
            <p>Choose hands-on support within your client’s team or a defined project led by OfRoot.</p>
          </div>
          <div className={styles.models}>
            <article className={styles.model}>
              <p className={styles.modelLabel}>Part of your team</p>
              <h3>Embedded Senior Engineer</h3>
              <p className={styles.modelSummary}>Work directly with Dimitri on development and technical leadership within your client’s team.</p>
              <dl><div><dt>Best for</dt><dd>Ongoing development, hands-on technical leadership or support for an existing application.</dd></div><div><dt>Who you’ll work with</dt><dd>Dimitri joins your team and personally delivers the agreed engineering work.</dd></div><div><dt>Engagement options</dt><dd>Hourly, weekly or monthly, based on the role and your contract requirements.</dd></div><div><dt>Getting started</dt><dd>We confirm the role, availability, reporting line and access requirements with you.</dd></div></dl>
              <PartnerTrackedLink href="#partnership-inquiry" placement="partner_embedded" className={styles.textLink}>Discuss an embedded role<ArrowRight aria-hidden="true" /></PartnerTrackedLink>
            </article>
            <article className={styles.model}>
              <p className={styles.modelLabel}>A project led by OfRoot</p>
              <h3>Managed Engineering Delivery</h3>
              <p className={styles.modelSummary}>Put a defined project in OfRoot’s hands, with founder-led planning, architecture and quality review.</p>
              <dl><div><dt>Best for</dt><dd>A feature, integration or modernization project with clear deliverables.</dd></div><div><dt>How it’s led</dt><dd>Dimitri leads the work. Any additional engineers are agreed with you before kickoff.</dd></div><div><dt>Engagement options</dt><dd>Milestones or a scoped monthly retainer, with agreed deliverables and change rules.</dd></div><div><dt>Getting started</dt><dd>We agree the scope, milestones, contributors and access requirements together.</dd></div></dl>
              <PartnerTrackedLink href="#partnership-inquiry" placement="partner_managed" className={styles.textLink}>Discuss a managed workstream<ArrowRight aria-hidden="true" /></PartnerTrackedLink>
            </article>
          </div>
        </div>
      </section>

      <section className={`${styles.shell} ${styles.section}`} aria-labelledby="capabilities-heading">
        <div className={styles.sectionHeader}><div><p className={styles.eyebrow}>Hands-on engineering</p><h2 id="capabilities-heading">From application work<br />to connected systems.</h2></div><p>Bring your stack and the problem you need to solve. We’ll talk through the approach and the skills your project needs.</p></div>
        <div className={styles.capabilities}>{capabilities.map(capability => <article key={capability.title}><h3>{capability.title}</h3><div><p className={styles.stack}>{capability.items}</p><p>{capability.body}</p></div></article>)}</div>
      </section>

      <section className={styles.accountability} aria-labelledby="accountability-heading">
        <div className={`${styles.shell} ${styles.accountabilityInner}`}>
          <div><p className={styles.eyebrow}>Work directly with Dimitri</p><h2 id="accountability-heading">A direct line to<br />the person responsible.</h2></div>
          <div><p>Dimitri is your main contact for technical decisions, progress and delivery. For embedded roles, he works within your team. For managed projects, he leads the work from scope through review and handoff.</p><p>Bring a technical brief, or start with the problem you need to solve. We’ll discuss relevant experience and the work your client needs.</p><p className={styles.evidenceNote}>Ask about availability for your next engagement.</p>
            {/* TODO(founder approval): Add approved biography and permitted project evidence. Do not substitute invented proof. */}
          </div>
        </div>
      </section>

      <section className={`${styles.shell} ${styles.section}`} aria-labelledby="process-heading">
        <div className={styles.sectionHeader}><div><p className={styles.eyebrow}>From conversation to kickoff</p><h2 id="process-heading">Start with your needs.<br />Build a plan together.</h2></div><p>Tell us what your client needs. We’ll confirm fit and agree the scope together.</p></div>
        <ol className={styles.process}>{engagementProcess.map((step, index) => <li key={step.title}><span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span><div><h3>{step.title}</h3><p>{step.body}</p></div></li>)}</ol>
      </section>

      <section className={`${styles.shell} ${styles.faq}`} aria-labelledby="faq-heading">
        <div><p className={styles.eyebrow}>Before we start</p><h2 id="faq-heading">A few practical answers.</h2><p className={styles.faqIntro}>Have a question about the role, contract or way of working? Start here, or include it with your inquiry.</p></div>
        <div className={styles.faqList}>{questions.map(item => <details key={item.question}><summary>{item.question}</summary><p>{item.answer}</p></details>)}</div>
      </section>

      <section id="partnership-inquiry" className={styles.inquiry} aria-labelledby="inquiry-heading">
        <div className={`${styles.shell} ${styles.inquiryGrid}`}>
          <div className={styles.inquiryIntro}><p className={styles.eyebrow}>Let’s talk</p><h2 id="inquiry-heading">What does your<br />client need?</h2><p>Tell us about the role or project and your preferred start date. We’ll review your requirements and recommend a next step.</p><p className={styles.evidenceNote}>A short overview is enough to start the conversation.</p></div>
          <PartnerInquiryForm enabled={process.env.PARTNER_INQUIRY_ENABLED === 'true' && Boolean(process.env.PARTNER_INQUIRY_DATABASE_URL) && (process.env.PARTNER_INQUIRY_HASH_SECRET?.length ?? 0) >= 32} />
        </div>
      </section>
    </main>
  );
}
