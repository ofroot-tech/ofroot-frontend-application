import Image from 'next/image';
import Link from 'next/link';

const columns = [
  { title: 'Services', links: [['AI Discoverability', '/services/ai-discoverability'], ['Automation Systems', '/services/automation-systems'], ['Private Company AI', '/services/private-company-ai']] },
  { title: 'Solutions', links: [['Generate Demand', '/solutions/generate-demand'], ['Convert More Leads', '/solutions/convert-more-leads'], ['Unlock Company Knowledge', '/solutions/unlock-company-knowledge']] },
  { title: 'Company', links: [['Results', '/results'], ['Insights', '/insights'], ['Security', '/security'], ['Book an Audit', '/book']] },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#050d1b] px-6 py-14 text-white sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.5fr]">
          <div>
            <Link href="/" aria-label="OfRoot home" className="inline-flex items-center gap-3">
              <Image src="/ofroot-logo.png" alt="" width={42} height={42} className="rounded-full" />
              <span className="text-2xl font-black">Of<span className="text-[#FF9312]">Root</span></span>
            </Link>
            <p className="mx-0 mt-5 max-w-sm text-sm text-slate-400">AI-powered growth and operations systems for companies that need more visibility, faster execution, and less manual work.</p>
            <a href="mailto:communications@ofroot.technology" className="mt-6 inline-block text-sm font-semibold text-slate-200 hover:text-white">communications@ofroot.technology</a>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {columns.map(column => (
              <div key={column.title}>
                <h2 className="!text-xs font-bold uppercase tracking-[.15em] text-[#FFC46B]">{column.title}</h2>
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
