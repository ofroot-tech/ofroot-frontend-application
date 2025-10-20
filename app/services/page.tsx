// app/services/page.tsx
import Link from 'next/link';

export const metadata = {
  title: 'Services | OfRoot',
  description: 'Explore OfRoot services: development automation, marketing automation, and AI audits.',
};

const cards = [
  {
    href: '/services/development-automation',
    title: 'Development Automation',
    desc: 'Ship faster with pipelines, scaffolds, and integrations. Reduce toil and regressions.',
  },
  {
    href: '/services/website-app-development',
    title: 'Website & App Development',
    desc: 'Full‑stack product engineering: MVPs, SaaS, mobile, and migrations.',
  },
  {
    href: '/services/marketing-automation',
    title: 'Marketing Automation',
    desc: 'Capture demand with landing pages, follow‑ups, and measurement. Less manual, more ROI.',
  },
  {
    href: '/services/ai-development-integrations',
    title: 'AI Development & Integrations',
    desc: 'Assistants, retrieval, and orchestration that measurably improve speed and quality.',
  },
  {
    href: '/services/ai-audit',
    title: 'AI Website & Ads Audit',
    desc: 'A free audit for quick wins across your site and ad accounts — in 48 hours.',
  },
  {
    href: '/services/add-ons',
    title: 'Add‑ons',
    desc: 'Add features, marketing, development, or automation to your plan as you grow.',
  },
];

export default function ServicesIndexPage() {
  return (
    <div>
      <header className="mb-10 text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900">Services</h1>
        <p className="mt-3 text-lg text-gray-700 max-w-3xl mx-auto">Outcome‑oriented engagements for shipping product, automating operations, and integrating AI.</p>
        <p className="mt-2 text-sm text-gray-600">Add modules anytime as you grow — <a href="/services/add-ons" className="underline">see add‑ons</a>.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((c) => (
          <Link key={c.href} href={c.href} className="rounded-xl border p-6 bg-white/80 backdrop-blur shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#20b2aa]">
            <h2 className="text-xl font-semibold text-gray-900">{c.title}</h2>
            <p className="mt-1 text-gray-700 text-sm">{c.desc}</p>
            <span className="mt-3 inline-block underline text-gray-800 text-sm">Explore →</span>
          </Link>
        ))}
      </div>

      <div className="mt-8 text-center">
        <a href="/case-studies" className="underline text-gray-800">See case studies</a>
      </div>
    </div>
  );
}
