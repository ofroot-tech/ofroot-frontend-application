import PublicHero from '@/components/growth/PublicHero';
import publicStyles from '@/components/growth/PublicPage.module.css';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { insights } from '@/app/lib/insights-content';
import { growthMetadata } from '@/app/lib/growth-content';

export const metadata = growthMetadata('Insights on AI Discoverability and Growth Systems', 'Practical outlines on AI discoverability, automation, conversion systems, private AI, company knowledge, and revenue operations.', '/insights');

const categories = ['AI discoverability', 'Automation', 'Company knowledge', 'Conversion systems', 'Private AI', 'Revenue operations', 'Technical implementation'];

export default function InsightsPage() {
  return <main id="main-content" className={`${publicStyles.page} ${publicStyles.legacy} bg-[#17141f] text-[#faf9fc]`}><PublicHero eyebrow="Insights" title="Clear answers for technical growth decisions." description="Practical guides and decision frameworks for discoverability, conversion, automation, company knowledge, and private AI." breadcrumbs={[{label:'Home',href:'/'},{label:'Insights'}]}><div className="mt-8 flex flex-wrap gap-2">{categories.map(category => <span key={category} className={publicStyles.badge}>{category}</span>)}</div></PublicHero><section className="px-6 py-20 sm:px-8"><div className="mx-auto max-w-6xl"><div className="grid gap-5 lg:grid-cols-3">{insights.map(insight => <Link href={`/insights/${insight.slug}`} key={insight.slug} className="group flex min-h-[340px] flex-col rounded-[2px] border border-[#d2caeb]/16 bg-[#211c2c] p-7 shadow-[0_16px_50px_rgba(15,23,42,.05)]"><p className="mx-0 text-xs font-bold uppercase tracking-[.15em] text-[#c4abe3]">{insight.category}</p><h2 className="mt-8 text-balance text-2xl font-medium">{insight.title}</h2><p className="mx-0 mt-4 flex-1 text-sm text-[#c0b5cc]">{insight.description}</p><span className="mt-8 inline-flex items-center gap-2 font-semibold text-[#e1c7f2]">Read the guide<ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span></Link>)}</div><p className="mx-auto mt-10 text-center text-sm text-[#b4a3c5]">Existing published content remains available in the <Link href="/blog" className="font-semibold text-[#e1c7f2] hover:underline">OfRoot blog</Link>.</p></div></section></main>;
}
