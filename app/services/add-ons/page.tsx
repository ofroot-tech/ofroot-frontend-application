// app/services/add-ons/page.tsx
import Link from 'next/link';

export const metadata = {
  title: 'Service Add‑ons | OfRoot',
  description: 'Add features, marketing campaigns, development capacity, or automation to your subscription.',
  alternates: { canonical: '/services/add-ons' },
};

const cards = [
  { href: '/subscribe?product=website-app-development', title: 'Add features', desc: 'Product sprints to ship new capabilities.', cta: 'Start subscription' },
  { href: '/subscribe?product=marketing-automation', title: 'Add marketing', desc: 'Landing pages, content, and campaigns.', cta: 'Start subscription' },
  { href: '/subscribe?product=development-automation', title: 'Add development', desc: 'Extra engineering capacity for your backlog.', cta: 'Start subscription' },
  { href: '/subscribe?product=ai-development-integrations', title: 'Add automation', desc: 'Workflow and AI assistants that save time.', cta: 'Start subscription' },
];

export default function AddOnsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 md:px-6 py-12">
      <header className="mb-10 text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900">Service add‑ons</h1>
        <p className="mt-3 text-lg text-gray-700 max-w-3xl mx-auto">Start with a subscription and add modules as you grow: features, marketing, development, and automation.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cards.map((c) => (
          <div key={c.title} className="rounded-xl border p-6 bg-white/80 backdrop-blur shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">{c.title}</h2>
            <p className="mt-1 text-gray-700 text-sm">{c.desc}</p>
            <div className="mt-3 flex items-center gap-3">
              <a href={c.href} className="inline-flex items-center bg-black text-white hover:bg-gray-900 font-semibold py-2 px-4 rounded-full">{c.cta}</a>
              <Link href="/services" className="underline text-gray-800">Explore services</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
