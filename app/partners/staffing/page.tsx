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
const description = 'Discuss founder-led full-stack engineering, integrations and technical leadership for your client engagements. Explore embedded engineering or scoped managed delivery.';

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
  { title: 'Staffing & recruiting firms', body: 'Discuss a named senior engineer for a client role, with the working relationship and contracting terms agreed before placement.' },
  { title: 'Talent acquisition partners', body: 'Bring the technical requirements, team context and hiring constraints. We review fit, timing and the appropriate engagement structure.' },
  { title: 'Delivery consultancies', body: 'Scope an engineering workstream with defined ownership, review points and the client permissions needed for delivery.' },
];

// TODO(founder approval): Confirm the advertised stack against the approved bio
// and current expertise before publication; do not add tenure or proficiency claims.
const capabilities = [
  { title: 'Application engineering', items: 'Laravel / PHP · React / Next.js · Vue · Node.js / TypeScript', body: 'Full-stack development and technical ownership within an existing application or a defined new workstream.' },
  { title: 'Connected systems', items: 'SQL · APIs · Cloud / AWS · Internal tools', body: 'Integrations, data workflows and operational software, with access and infrastructure requirements agreed in scope.' },
  { title: 'Modernization & practical AI', items: 'Legacy applications · Workflow tooling · AI-assisted internal systems', body: 'Improve an existing system or assess a bounded AI use case, with human review and explicit data permissions.' },
];

const engagementProcess = [
  { title: 'Share the need', body: 'Describe the role or workstream, client context and target timing.' },
  { title: 'Check the fit', body: 'Review the technical requirements, availability and engagement constraints.' },
  { title: 'Clarify the work', body: 'Discuss responsibilities, expected outcomes and open questions.' },
  { title: 'Agree the model', body: 'Confirm personal delivery or managed scope, access rules and any contractor permissions.' },
  { title: 'Put it in writing', body: 'Agree the contract, scope, commercial terms and acceptance criteria.' },
  { title: 'Start with clarity', body: 'Confirm access, communication, review points and the handoff plan at kickoff.' },
];

const questions = [
  { question: 'Do you work through W-2, 1099 or vendor agreements?', answer: 'The appropriate arrangement depends on the agency, client, jurisdiction and engagement. Share your requirements so eligibility and terms can be reviewed. No contracting model is assumed or universally available.' },
  { question: 'Is an engineer available immediately, and can the work be remote?', answer: 'Availability, start dates, timezone overlap and remote-working requirements are confirmed for each engagement. This page is an invitation to check fit, not a promise of current capacity or geographic eligibility.' },
  { question: 'Will the work be subcontracted?', answer: 'An embedded engagement is delivered personally by the named founder under the agreed contract. A managed engagement may include vetted contractors only after availability, terms and required agency and customer permissions are confirmed. Substitution is never implied.' },
  { question: 'Can you meet geographic or data-access restrictions?', answer: 'Share required work locations, hosting regions and restrictions before providing access. Proposed contributors, AI tools and data transfers must be compatible with the client contract. We do not assume offshore access or an exception to your policies.' },
  { question: 'How are confidentiality, IP and security handled?', answer: 'Confidentiality, intellectual property ownership, access controls, approved tools and security requirements are agreed in writing before work begins. Do not include credentials, production data or confidential customer material in an initial inquiry.' },
  { question: 'What are the rates and typical timelines?', answer: 'Rates and timing depend on the role, scope, capacity, review needs and contract structure. Request engagement options for your situation. A retainer or managed scope needs clear included capacity, exclusions and change-request rules before commitment.' },
  { question: 'Can we review relevant engineering work?', answer: 'We can discuss relevant responsibilities and technical approaches during a fit check. Project narratives, redacted examples or references are shared only where permission and confidentiality allow. No client endorsement or outcome is implied by this page.' },
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
              <p className={styles.intro}>Partner with OfRoot Technology for experienced full-stack engineering, integrations and technical leadership. Choose an embedded senior engineer or a scoped, founder-led delivery engagement.</p>
              <div className={styles.actions}>
                <PartnerTrackedLink href="#partnership-inquiry" placement="partner_hero" className={styles.primary}>Discuss an Engineering Partnership<ArrowRight aria-hidden="true" /></PartnerTrackedLink>
                <PartnerTrackedLink href="#partnership-inquiry" placement="partner_availability" className={styles.secondary}>Request Capabilities &amp; Availability<ArrowRight aria-hidden="true" /></PartnerTrackedLink>
              </div>
            </div>
            <aside className={styles.heroNote} aria-label="Engagement principles">
              <p className={styles.eyebrow}>A clear working relationship</p>
              <p>One founder accountable.<br />Two distinct delivery models.<br />Terms agreed before kickoff.</p>
              <span>Availability and fit confirmed per engagement.</span>
            </aside>
          </div>
        </div>
      </section>

      <section className={`${styles.shell} ${styles.section}`} aria-labelledby="partner-types-heading">
        <div className={styles.sectionHeader}>
          <div><p className={styles.eyebrow}>Your client. A clear partnership.</p><h2 id="partner-types-heading">Built to work with<br />your engagement model.</h2></div>
          <p>A placement and a managed workstream need different agreements. Start with the relationship your client actually needs.</p>
        </div>
        <div className={styles.partnerList}>{partners.map(partner => <article key={partner.title}><h3>{partner.title}</h3><p>{partner.body}</p></article>)}</div>
      </section>

      <section className={styles.modelsSection} aria-labelledby="models-heading">
        <div className={styles.shell}>
          <div className={styles.sectionHeader}>
            <div><p className={styles.eyebrow}>Choose the responsibility</p><h2 id="models-heading">An engineer in your team.<br />Or ownership of a scope.</h2></div>
            <p>The delivery model is explicit from the start. Managed delivery does not imply an interchangeable resource for an embedded role.</p>
          </div>
          <div className={styles.models}>
            <article className={styles.model}>
              <p className={styles.modelLabel}>Personally delivered</p>
              <h3>Embedded Senior Engineer</h3>
              <p className={styles.modelSummary}>A named founder working within your client’s engineering team.</p>
              <dl><div><dt>Working relationship</dt><dd>Embedded development and technical leadership within agreed team responsibilities.</dd></div><div><dt>Delivery owner</dt><dd>The named founder personally delivers the contracted work.</dd></div><div><dt>Commercial structure</dt><dd>Hourly, weekly or monthly terms, subject to the contract and confirmed capacity.</dd></div><div><dt>Before work begins</dt><dd>Role, availability, reporting line and access approved. No implied substitution or subcontracting.</dd></div></dl>
              <PartnerTrackedLink href="#partnership-inquiry" placement="partner_embedded" className={styles.textLink}>Discuss an embedded role<ArrowRight aria-hidden="true" /></PartnerTrackedLink>
            </article>
            <article className={styles.model}>
              <p className={styles.modelLabel}>Scoped &amp; founder-led</p>
              <h3>Managed Engineering Delivery</h3>
              <p className={styles.modelSummary}>A defined workstream with founder-led architecture, oversight and quality review.</p>
              <dl><div><dt>Working relationship</dt><dd>Ownership of agreed deliverables, milestones and acceptance criteria.</dd></div><div><dt>Delivery owner</dt><dd>The founder leads scope and review; authorized, vetted contractors may contribute.</dd></div><div><dt>Commercial structure</dt><dd>A defined milestone or scoped retainer with capacity and change rules agreed in writing.</dd></div><div><dt>Before work begins</dt><dd>Contributor availability, contracts, data access and required customer permissions confirmed.</dd></div></dl>
              <PartnerTrackedLink href="#partnership-inquiry" placement="partner_managed" className={styles.textLink}>Discuss a managed workstream<ArrowRight aria-hidden="true" /></PartnerTrackedLink>
            </article>
          </div>
        </div>
      </section>

      <section className={`${styles.shell} ${styles.section}`} aria-labelledby="capabilities-heading">
        <div className={styles.sectionHeader}><div><p className={styles.eyebrow}>Start with the technical need</p><h2 id="capabilities-heading">From application work<br />to connected systems.</h2></div><p>Share your stack and the work to be done. Technical fit, responsibilities and any specialist needs are checked before an engagement is agreed.</p></div>
        <div className={styles.capabilities}>{capabilities.map(capability => <article key={capability.title}><h3>{capability.title}</h3><div><p className={styles.stack}>{capability.items}</p><p>{capability.body}</p></div></article>)}</div>
      </section>

      <section className={styles.accountability} aria-labelledby="accountability-heading">
        <div className={`${styles.shell} ${styles.accountabilityInner}`}>
          <div><p className={styles.eyebrow}>Founder accountability</p><h2 id="accountability-heading">Know who owns<br />the work.</h2></div>
          <div><p>Work directly with Dimitri on technical fit, responsibilities and delivery expectations. In an embedded engagement, the named engineer delivers the work personally. In managed delivery, the founder owns architecture, quality review and the customer relationship.</p><p>Relevant technical approaches and project examples can be discussed during a fit check, where confidentiality and permissions allow.</p><p className={styles.evidenceNote}>Ask for capabilities and availability for your specific engagement.</p>
            {/* TODO(founder approval): Add approved biography and permitted project evidence. Do not substitute invented proof. */}
          </div>
        </div>
      </section>

      <section className={`${styles.shell} ${styles.section}`} aria-labelledby="process-heading">
        <div className={styles.sectionHeader}><div><p className={styles.eyebrow}>From inquiry to kickoff</p><h2 id="process-heading">Agree the relationship.<br />Then begin the work.</h2></div><p>An inquiry starts a fit check. It does not reserve capacity, accept a contract or authorize access to a client system.</p></div>
        <ol className={styles.process}>{engagementProcess.map((step, index) => <li key={step.title}><span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span><div><h3>{step.title}</h3><p>{step.body}</p></div></li>)}</ol>
      </section>

      <section className={`${styles.shell} ${styles.faq}`} aria-labelledby="faq-heading">
        <div><p className={styles.eyebrow}>Before we start</p><h2 id="faq-heading">The terms matter.</h2><p className={styles.faqIntro}>Bring your agency and client requirements early. Eligibility, permissions and commercial commitments are reviewed for each engagement.</p></div>
        <div className={styles.faqList}>{questions.map(item => <details key={item.question}><summary>{item.question}</summary><p>{item.answer}</p></details>)}</div>
      </section>

      <section id="partnership-inquiry" className={styles.inquiry} aria-labelledby="inquiry-heading">
        <div className={`${styles.shell} ${styles.inquiryGrid}`}>
          <div className={styles.inquiryIntro}><p className={styles.eyebrow}>Start a fit check</p><h2 id="inquiry-heading">Tell us about<br />the engagement.</h2><p>Share the role or workstream, your contracting requirements and target timing. We’ll review the fit before discussing next steps.</p><p className={styles.evidenceNote}>Please leave out credentials, confidential client material and sensitive customer information.</p></div>
          <PartnerInquiryForm enabled={process.env.PARTNER_INQUIRY_ENABLED === 'true' && Boolean(process.env.PARTNER_INQUIRY_DATABASE_URL) && (process.env.PARTNER_INQUIRY_HASH_SECRET?.length ?? 0) >= 32} />
        </div>
      </section>
    </main>
  );
}
