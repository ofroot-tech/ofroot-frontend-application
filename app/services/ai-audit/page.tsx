import type { Metadata } from 'next';
import AiAudit from '@/components/AiAudit';
import JsonLd from '@/components/seo/JsonLd';
import { SITE } from '@/app/config/site';
import styles from '@/components/growth/PublicPage.module.css';

export const metadata: Metadata = {
  title: 'Free AI Website Readiness Scanner',
  description: 'Scan your public website for technical signals that help AI agents find, read, and use it. Get an Ora-powered score, evidence, and prioritized fixes.',
  alternates: { canonical: '/services/ai-audit' },
  openGraph: { title: 'Free AI Website Readiness Scanner | OfRoot', description: 'Run a technical website scan, see the evidence, and identify the next fixes.', url: '/services/ai-audit' },
};

export default function AiAuditPage() {
  return (
    <>
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'OfRoot AI Website Readiness Scanner',
        url: `${SITE.url}/services/ai-audit`,
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        isAccessibleForFree: true,
        description: 'A technical website scanner powered by Ora that evaluates whether AI agents can find, read, and use a public website.',
      }} />
      <AiAudit />
      <aside className={`${styles.page} ${styles.legacy}`} aria-labelledby="ai-audit-repository-check">
        <div className={styles.shell}>
          <section className={styles.section}>
            <div className={styles.split}>
              <div><p className={styles.eyebrow}>A separate check for your code</p><h2 id="ai-audit-repository-check" className={styles.sectionTitle}>Review repository findings locally.</h2></div>
              <div className={styles.card}>
                <h3>OfRoot Repository Check</h3>
                <p>Use our free, open-source tool to review selected credential and code patterns, with optional checks for possible sensitive health data. It runs in your environment with no OfRoot account or uploads. Default reports omit matched values, source snippets and file paths.</p>
                <p>The Ora-powered scan above measures your public website’s AI readiness. Repository findings have their own report and do not affect that score.</p>
                <a className={styles.textLink} href="https://github.com/ofroot-tech/ofroot-repository-check">Get the scanner and setup instructions on GitHub →</a>
                <p className={styles.note}>Findings need human review; the tool does not block commits or edit code. It checks the Git snapshot you stage, excluding unstaged edits, untracked files and history. These limited checks can miss issues and do not certify security or HIPAA compliance.</p>
              </div>
            </div>
          </section>
        </div>
      </aside>
    </>
  );
}
