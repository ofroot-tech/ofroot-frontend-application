'use client';

import { usePathname } from 'next/navigation';
import SiteBrand from '@/components/brand/SiteBrand';
import styles from './PublicChrome.module.css';
import Link from 'next/link';

const columns = [
  { title: 'Services', links: [['Websites & Growth', '/services/ai-discoverability'], ['Integrations & Tools', '/services/automation-systems'], ['AI & Deployment', '/services/private-company-ai']] },
  { title: 'Solutions', links: [['Generate Demand', '/solutions/generate-demand'], ['Convert More Leads', '/solutions/convert-more-leads'], ['Unlock Company Knowledge', '/solutions/unlock-company-knowledge']] },
  { title: 'Company', links: [['Website Readiness Scanner', '/services/ai-audit'], ['Business AI Assessment', '/ai-agent-readiness-assessment'], ['Capabilities', '/results'], ['Insights', '/insights'], ['Editorial Standards', '/about/editorial-standards'], ['Discuss your project', '/book'], ['Pricing', '/pricing'], ['Security', '/security']] },
];

export default function Footer() {
  const pathname = usePathname();
  if (pathname === '/') return (
    <footer className={styles.homeFooter}><div className={styles.footerShell}>
      <div className={styles.footerIdentity}><SiteBrand compact /><span className={styles.copyright}>© {new Date().getFullYear()} OfRoot</span></div>
      <span className={styles.footerLine}>Software, automation &amp; practical AI.</span>
      <div className={styles.footerLinks}><Link href="/book?source=footer">Discuss your project</Link><Link href="/legal/privacy">Privacy</Link><Link href="/legal/terms">Terms</Link></div>
    </div></footer>
  );
  return (
    <footer className={`${styles.homeFooter} ${styles.publicFooter}`}>
      <div className={styles.publicFooterShell}>
        <div className="grid gap-12 lg:grid-cols-[1fr_1.5fr]">
          <div>
            <SiteBrand />
            <p className="mx-0 mt-5 max-w-sm text-sm text-slate-400">Workflow automation, connected software, and practical AI. Hands-on design and engineering for growing businesses.</p>
            <a href="mailto:communications@ofroot.technology" className="mt-6 inline-block text-sm font-semibold text-slate-200 hover:text-white">communications@ofroot.technology</a>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {columns.map(column => (
              <div key={column.title}>
                <h2 className="!text-xs font-bold uppercase tracking-[.15em] text-[#c3afe1]">{column.title}</h2>
                <ul className="mt-4 space-y-3">{column.links.map(([label, href]) => <li key={href}><Link href={href} className="text-sm text-slate-300 hover:text-white">{label}</Link></li>)}</ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p className="mx-0">© {new Date().getFullYear()} OfRoot. All rights reserved.</p>
          <div className="flex gap-5"><Link href="/legal/privacy">Privacy</Link><Link href="/legal/terms">Terms</Link><a href="https://www.linkedin.com/company/ofroot" target="_blank" rel="noopener noreferrer">LinkedIn</a></div>
        </div>
      </div>
    </footer>
  );
}
