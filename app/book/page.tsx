import Link from 'next/link';
import GrowthAuditForm from '@/components/growth/GrowthAuditForm';
import { growthMetadata, SITE_URL } from '@/app/lib/growth-content';
import publicStyles from '@/components/growth/PublicPage.module.css';
import styles from '@/components/growth/GrowthAuditForm.module.css';

export const metadata = growthMetadata('Discuss Your Project', 'Tell OfRoot about your website, integrations, internal tools, AI system, or reporting needs.', '/book');

export default function BookPage() {
  const schema = { '@context': 'https://schema.org', '@type': 'Service', name: 'Growth Systems Audit', provider: { '@type': 'Organization', name: 'OfRoot', url: SITE_URL }, areaServed: 'US', description: 'A focused review of discoverability, lead conversion, automation, internal knowledge, private AI, and reporting opportunities.' };
  const steps = [
    ['1. Send the request', 'Share four required answers so we can understand the business and the bottleneck.'],
    ['2. We review the context', 'We review your goal and whether we can help before asking you to schedule time.'],
    ['3. Continue by email', 'We reply with the recommended next step and scheduling details when there is a useful fit.'],
  ];

  return (
    <main id="main-content" className={publicStyles.page}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <div className={`${publicStyles.shell} ${styles.bookingShell}`}>
        <nav aria-label="Breadcrumb" className={`${publicStyles.breadcrumb} ${styles.bookingBreadcrumb}`}>
          <Link href="/">Home</Link> <span aria-hidden="true">/</span> <span aria-current="page">Discuss your project</span>
        </nav>
        <div className={styles.bookingLayout}>
          <div>
            <p className={publicStyles.eyebrow}>Start a conversation</p>
            <h1 className={`${publicStyles.title} ${styles.bookingTitle}`}>What should work better?</h1>
            <p className={`${publicStyles.description} ${styles.bookingDescription}`}>Tell us about your website, the tools your team uses, or an AI idea you want to make practical. We review your goal and recommend a useful next step.</p>
            <div className={styles.nextStepNote}>
              <p>This form starts a project conversation.</p>
              <p>No payment is collected here. We review the context first, then reply by email with the most useful next step.</p>
            </div>
            <ol className={styles.nextSteps}>
              {steps.map(([title, body]) => (
                <li key={title}>
                  <h2>{title}</h2>
                  <p>{body}</p>
                </li>
              ))}
            </ol>

          </div>
          <GrowthAuditForm />
        </div>
      </div>
    </main>
  );
}
