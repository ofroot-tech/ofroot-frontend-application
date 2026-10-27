import publicStyles from '@/components/growth/PublicPage.module.css';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Editorial and Research Standards', description: 'OfRoot standards for authorship, evidence, sourcing, AI assistance, corrections, updates, original research, and commercial transparency.', alternates: { canonical: '/about/editorial-standards' } };

const standards = [
  ['Useful before promotional', 'Each resource should answer a real buyer or operator question directly, explain boundaries, and give the reader a practical next step.'],
  ['Primary evidence first', 'Platform behavior, standards, security guidance, and regulations should link to primary documentation when practical. We distinguish cited facts, implementation judgment, and commercial claims.'],
  ['No invented proof', 'We do not present simulated examples, internal estimates, or unverified customer outcomes as independent evidence. Anonymized work is labeled when publication permission is not recorded.'],
  ['Transparent authorship', 'Articles use the OfRoot Technology Editorial Team byline unless a named contributor has reviewed and approved the work under their own public profile.'],
  ['Responsible AI assistance', 'AI tools may support outlining, editing, analysis, or code implementation. OfRoot remains responsible for source selection, factual review, claims, privacy, and the published result.'],
  ['Substantive updates', 'Displayed update dates change only when the advice, evidence, structure, or implementation changes materially—not for cosmetic edits.'],
  ['Corrections', 'Material factual errors are corrected promptly. Readers can report a concern to communications@ofroot.technology with the page and disputed statement.'],
  ['Research integrity', 'Original research must disclose the question, method, sample, inclusion rules, limitations, and analysis date. We will not publish benchmark claims before eligible data exists.'],
  ['Commercial transparency', 'Our resources may link to relevant OfRoot services. Those links do not change the evidence standard, and no ranking, citation, security, or implementation outcome is guaranteed.'],
];

export default function EditorialStandardsPage() {
  return <main id="main-content" className={`${publicStyles.page} ${publicStyles.legacy} bg-[#17141f] text-[#faf9fc]`}><article className="mx-auto max-w-4xl px-6 py-16 sm:px-8"><p className="text-sm font-bold uppercase tracking-[.16em] text-[#c4abe3]">Effective September 9, 2026</p><h1 className="mt-4 text-balance text-4xl font-medium sm:text-6xl">Editorial and Research Standards</h1><p className="mt-6 text-xl leading-8 text-[#c0b5cc]">These standards govern OfRoot’s public insights, guides, assessment methods, case-study records, and research. They are designed to make useful claims easy to trace and promotional claims easy to recognize.</p><div className="mt-12 space-y-4">{standards.map(([title, body], index) => <section key={title} className="grid gap-3 rounded-[2px] border border-[#d2caeb]/16 bg-[#211c2c] p-6 sm:grid-cols-[44px_1fr]"><span className="text-sm font-medium text-[#c4abe3]">{String(index + 1).padStart(2, '0')}</span><div><h2 className="text-xl font-medium">{title}</h2><p className="mt-2 leading-7 text-[#c0b5cc]">{body}</p></div></section>)}</div><p className="mt-10 text-sm text-[#b4a3c5]">Published by the <Link href="/authors/ofroot-technology" className="font-bold underline">OfRoot Technology Editorial Team</Link>. Questions and correction requests: <a href="mailto:communications@ofroot.technology" className="font-bold underline">communications@ofroot.technology</a>.</p></article></main>;
}
