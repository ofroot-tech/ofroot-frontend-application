import Link from 'next/link';
import { ArrowRight, ClipboardCheck, ClipboardList, Gauge, MessageSquareText, ShieldCheck, Truck } from 'lucide-react';
import { HOUSTON_AC_OFFER as offer } from '@/app/lib/houston-rental-ac';
import { growthMetadata, SITE_URL } from '@/app/lib/growth-content';
import { TrackedLink, TrackedPageView } from '@/components/growth/Analytics';
import publicStyles from '@/components/growth/PublicPage.module.css';
import JsonLd from '@/components/seo/JsonLd';
import WorkflowReviewForm from './WorkflowReviewForm';
import styles from './Sprint.module.css';

const title = 'Houston Rental Property HVAC Maintenance Workflow | OfRoot';
const description = 'Connect rental A/C requests, approvals, dispatch, tenant updates, and repair records. Book a 20-minute workflow review with OfRoot in Houston.';
export const metadata = { ...growthMetadata(title, description, offer.path), title: { absolute: title } };

const steps = [
  { name: 'Tenant request', detail: 'Capture the unit, problem, and callback details.', Icon: MessageSquareText },
  { name: 'Urgency triage', detail: 'Flag urgent or unclear cases for your on-call team.', Icon: ClipboardList },
  { name: 'Owner approval', detail: 'Record the owner or manager’s decision and approved scope.', Icon: ShieldCheck },
  { name: 'Contractor dispatch', detail: 'Send the work order and share scheduling updates.', Icon: Truck },
  { name: 'Repair evidence', detail: 'Attach technician notes, proof of work, and the completion time.', Icon: ClipboardCheck },
  { name: 'Owner reporting', detail: 'See open jobs, approval delays, and complete repair records.', Icon: Gauge },
];

const faqs = [
  ['Can we keep our current software?', 'Yes. We start with the tools you use and check which work orders, approvals, and status updates can be shared. If a direct connection isn’t feasible, we agree on how your team will hand off the work.'],
  ['How do tenants hear back?', 'Use an agreed channel for acknowledgments, scheduling, and repair updates. Your team approves the messages and handles exceptions.'],
  ['What happens during an emergency or after hours?', 'Your escalation rules route urgent or unclear requests to a designated person and backup. Your team decides the response and keeps its existing emergency procedures.'],
  ['How long does setup take?', 'We confirm the schedule after discovery, once we know the pilot scope, software access, and who needs to approve the workflow.'],
  ['Who owns the records?', 'We agree on ownership, who can view and export records, and how long records are kept before the pilot starts.'],
  ['Do repair records establish legal compliance?', 'The records show what happened and when. Legal compliance depends on the property, the actual work, and the rules that apply.'],
] as const;

export default function HoustonRentalAcSprintPage() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: offer.name,
    description,
    url: `${SITE_URL}${offer.path}`,
    provider: { '@type': 'Organization', name: 'OfRoot Technology', url: SITE_URL },
    areaServed: 'Greater Houston, Texas',
  };

  return (
    <main id="main-content" className={publicStyles.page}>
      <JsonLd data={schema} />
      <TrackedPageView event={offer.events.view} label={offer.id} />

      <header className={publicStyles.hero}>
        <div className={`${publicStyles.shell} ${publicStyles.heroInner}`}>
          <nav aria-label="Breadcrumb" className={publicStyles.breadcrumb}>
            <Link href="/">Home</Link>
            <span aria-hidden="true">/</span>
            <Link href="/solutions/home-services-automation">Home services</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">Houston Rental A/C Sprint</span>
          </nav>
          <p className={publicStyles.eyebrow}>{offer.name}</p>
          <h1 className={publicStyles.title}>Get rental A/C requests from intake to documented completion</h1>
          <p className={publicStyles.description}>Give your team one place to see what was reported, who needs to approve the work, who’s on the job, and what evidence closes it. OfRoot builds a fixed-scope pilot for Houston-area property managers and the HVAC contractors they work with.</p>
          <div className={publicStyles.actions}>
            <TrackedLink href={`#${offer.bookingId}`} event={offer.events.cta} source="houston_ac_hero" className={publicStyles.primary}>
              {offer.cta}<ArrowRight aria-hidden="true" />
            </TrackedLink>
          </div>
          <p className={publicStyles.note}>Tell us where jobs get stuck. We’ll review your request and email you about a time to talk.</p>
        </div>
      </header>

      <section className={publicStyles.section} aria-labelledby="workflow-heading">
        <div className={publicStyles.shell}>
          <h2 id="workflow-heading" className={publicStyles.sectionTitle}>How a request moves</h2>
          <ol className={`${publicStyles.flow} ${styles.workflow}`} role="list">
            {steps.map(({ name, detail, Icon }) => (
              <li key={name}>
                <Icon aria-hidden="true" />
                <div><strong>{name}</strong><p>{detail}</p></div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className={publicStyles.section} aria-labelledby="teams-heading">
        <div className={publicStyles.shell}>
          <h2 id="teams-heading" className={publicStyles.sectionTitle}>What each team gets</h2>
          <div className={`${publicStyles.columns} ${styles.audiences}`}>
            <div className={publicStyles.card}>
              <h3>For HVAC contractors</h3>
              <p>Send one approval request with the estimate, unit, and access notes. Dispatch from an approved work order and send back technician notes and repair evidence together.</p>
            </div>
            <div className={publicStyles.card}>
              <h3>For property managers</h3>
              <p>See which requests need attention, which are waiting for approval, and which have been dispatched. Give tenants updates and owners a record of what happened and when.</p>
            </div>
          </div>
        </div>
      </section>

      <section className={publicStyles.section} aria-labelledby="pilot-heading">
        <div className={`${publicStyles.shell} ${publicStyles.split}`}>
          <div>
            <p className={publicStyles.eyebrow}>Fixed-scope pilot</p>
            <h2 id="pilot-heading" className={publicStyles.sectionTitle}>Start with one workflow</h2>
            <p className={publicStyles.note}>OfRoot provides ongoing monitoring and support. We set the final price after discovery and agree on what support covers.</p>
          </div>
          <div className={styles.pilot}>
            <div>
              <h3>An illustrative A/C repair</h3>
              <p>A tenant reports that their A/C stopped cooling. The workflow captures the unit and callback details, flags the request for the on-call manager, and records the approved work before dispatch. The technician’s notes and completion time return to the same job record. An owner dashboard shows what’s open, overdue, and complete.</p>
            </div>
            <div>
              <h3>Connect the tools you already use</h3>
              <p>We check whether your property-management or field-service software can share work orders and status. Where a connection is feasible, we agree on what moves between systems and where your team keeps the official record.</p>
            </div>
            <div>
              <h3>Keep decisions with your team</h3>
              <p>Your team owns urgency overrides, spending approvals, dispatch exceptions, and repair sign-off. We agree on who takes over when a case needs human attention.</p>
            </div>
            <div>
              <h3>Measure what changes</h3>
              <p>We agree on a baseline for time to first response, time waiting for approval, and the share of closed jobs with complete records. We review the same measures during the pilot before discussing a wider rollout.</p>
            </div>
          </div>
        </div>
      </section>

      <section id={offer.bookingId} className={publicStyles.section} aria-labelledby="review-heading">
        <div className={`${publicStyles.shell} ${publicStyles.split}`}>
          <div>
            <h2 id="review-heading" className={publicStyles.sectionTitle} tabIndex={-1}>{offer.cta}</h2>
            <p className={styles.reviewCopy}>Share a few details about your Houston-area operation. We’ll use them to focus the call on the handoff you most want to fix.</p>
          </div>
          <WorkflowReviewForm />
        </div>
      </section>

      <section className={publicStyles.section} aria-labelledby="faq-heading">
        <div className={publicStyles.shell}>
          <h2 id="faq-heading" className={publicStyles.sectionTitle}>Frequently asked questions</h2>
          <div className={publicStyles.faq}>
            {faqs.map(([question, answer]) => (
              <details key={question}>
                <summary>{question}</summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className={publicStyles.section} aria-labelledby="guides-heading">
        <div className={`${publicStyles.shell} ${publicStyles.split}`}>
          <div>
            <h2 id="guides-heading" className={publicStyles.sectionTitle}>Houston rental market context</h2>
            <p className={styles.context}>The Houston Association of Realtors reported 3,850 single-family leases across Greater Houston in October 2026, up 3.5% from a year earlier. Houston City Council adopted a separate A/C ordinance for properties within Houston city limits.</p>
            <div className={publicStyles.footerLinks}>
              <a href="https://www.har.com/content/department/newsroom?pid=2256">HAR’s November 18 rental update</a>
              <a href="https://cohips.houstontx.gov/citysec/agenda/2026/20260818.pdf">Houston City Council minutes, item 44</a>
            </div>
          </div>
          <ul className={`${publicStyles.list} ${styles.guides}`}>
            <li><Link className={publicStyles.textLink} href="/solutions/home-services-automation">Explore OfRoot’s home-services workflows<ArrowRight aria-hidden="true" /></Link></li>
            <li><Link href="/services/automation-systems" className={publicStyles.textLink}>Explore OfRoot’s workflow automation services<ArrowRight aria-hidden="true" /></Link></li>
          </ul>
        </div>
      </section>
    </main>
  );
}
