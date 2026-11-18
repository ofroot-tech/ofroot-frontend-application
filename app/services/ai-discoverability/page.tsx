import GrowthPage from '@/components/growth/GrowthPage';
import { growthMetadata, growthPages } from '@/app/lib/growth-content';
import styles from '@/components/growth/PublicPage.module.css';
const content = growthPages.aiDiscoverability;
export const metadata = growthMetadata('Marketing Websites, SEO, AEO, GEO & Ads', content.description, content.path);
export default function Page() {
  return <>
    <GrowthPage content={content} kind="service" />
    <aside className={styles.page} aria-labelledby="discoverability-repository-check">
      <div className={styles.shell}><section className={styles.section}>
        <div className={styles.split}>
          <div><p className={styles.eyebrow}>Free open-source tool</p><h2 id="discoverability-repository-check" className={styles.sectionTitle}>Bring a security check into your development workflow.</h2></div>
          <div className={styles.card}>
            <h3>OfRoot Repository Check</h3>
            <p>Review selected credential and code patterns in your own environment, with optional checks for possible sensitive health data. No OfRoot account or uploads are required. Default reports omit matched values, source snippets and file paths.</p>
            <p>Public website discoverability and private repository security have separate results. Repository findings do not change your AI readiness score or become public discovery metadata.</p>
            <a className={styles.textLink} href="https://github.com/ofroot-tech/ofroot-repository-check">Get the scanner and setup instructions on GitHub →</a>
            <p className={styles.note}>Reports need human review. Checks read your staged Git snapshot, excluding unstaged edits, untracked files and history. The tool does not block commits, edit code or certify security or HIPAA compliance.</p>
          </div>
        </div>
      </section></div>
    </aside>
  </>;
}
