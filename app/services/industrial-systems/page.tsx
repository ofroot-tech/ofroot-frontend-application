import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/seo/JsonLd';
import { PageView, TrackedLink } from '@/components/growth/Analytics';
import { SITE } from '@/app/config/site';

export const metadata: Metadata = {
  title: 'Industrial Software & AI Systems',
  description:
    'OfRoot Technology builds industrial software connecting field operations, physical assets, computer vision, AI, edge processing, and enterprise systems.',
  alternates: { canonical: '/services/industrial-systems' },
  openGraph: {
    title: 'Industrial Software & AI Systems | OfRoot Technology',
    description:
      'Software connecting field operations, physical assets, operational data, AI, and enterprise systems.',
    url: `${SITE.url}/services/industrial-systems`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Industrial Software & AI Systems | OfRoot Technology',
    description:
      'Software connecting field operations, physical assets, operational data, AI, and enterprise systems.',
  },
};

const capabilities = [
  {
    title: 'AI-Assisted Operations',
    body: 'Help operators search, understand, and act on operational information while preserving appropriate human oversight.',
  },
  {
    title: 'Computer Vision',
    body: 'Turn visual field information into structured signals using computer vision, OCR, identification workflows, and confidence-based processing.',
  },
  {
    title: 'Edge Processing',
    body: 'Process important information near the point of capture when latency, connectivity, privacy, or operational resilience matter.',
  },
  {
    title: 'Enterprise Integrations',
    body: 'Connect field workflows with APIs, collaboration platforms, asset systems, operational databases, and existing enterprise infrastructure.',
  },
  {
    title: 'Offline-Resilient Systems',
    body: 'Keep capturing information when connectivity is unreliable, then synchronize safely once connectivity returns.',
  },
  {
    title: 'Structured Asset Data',
    body: 'Transform field observations into searchable, traceable records that downstream systems can use.',
  },
];

const fieldInputs = ['Cameras', 'Field devices', 'Industrial assets', 'Sensors', 'Spatial data'];
const softwareLayer = ['Capture', 'Normalize', 'Verify', 'Integrate', 'Analyze'];
const operationalOutputs = ['Alerts', 'Asset records', 'Dashboards', 'AI assistance', 'Reports', 'Workflows'];
const caseStudyConcepts = [
  'Computer vision and OCR-assisted identification',
  'Edge processing',
  'Enterprise API integrations',
  'Human verification',
  'Offline-resilient capture',
  'Operational notifications',
  'Structured operational records',
  'AI-assisted information retrieval',
].sort((a, b) => a.localeCompare(b));
const futureCapabilities = [
  'Autonomous inspection',
  'Camera intelligence',
  'Digital twins',
  'Drones',
  'Edge AI',
  'Robotics',
  'Sensor fusion',
  'Spatial computing',
];

function FlowColumn({ eyebrow, title, items, emphasized = false }: { eyebrow: string; title: string; items: string[]; emphasized?: boolean }) {
  return (
    <div className={`relative rounded-2xl border p-5 sm:p-6 ${emphasized ? 'border-[#FF9312]/50 bg-[#111D31]' : 'border-white/15 bg-white/[0.04]'}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#FFC46B]">{eyebrow}</p>
      <h3 className="mt-2 text-xl font-bold text-white">{title}</h3>
      <ul className="mt-5 flex flex-wrap gap-2" aria-label={`${title} elements`}>
        {items.map((item) => (
          <li key={item} className="rounded-full border border-white/15 bg-white/[0.06] px-3 py-1.5 text-sm text-slate-200">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function IndustrialSystemsPage() {
  return (
    <div className="growth-page-full-bleed w-full bg-white text-slate-900">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Service',
          name: 'Industrial Systems',
          description: metadata.description,
          url: `${SITE.url}/services/industrial-systems`,
          provider: { '@type': 'Organization', name: SITE.name, url: SITE.url },
          areaServed: 'Worldwide',
          serviceType: 'Industrial software engineering',
        }}
      />
      <PageView kind="service" name="industrial_systems" />

      <header className="relative overflow-hidden bg-[#071225] px-6 pb-20 pt-24 text-white sm:px-8 sm:pb-24 sm:pt-28">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute -left-28 top-0 h-96 w-96 rounded-full bg-[#FF9312]/18 blur-3xl" />
          <div className="absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-[#37FFE0]/8 blur-3xl" />
          <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.5)_1px,transparent_1px)] [background-size:48px_48px]" />
        </div>
        <div className="relative mx-auto max-w-6xl">
          <p className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#FFC46B]">
            Industrial Systems
          </p>
          <h1 className="mt-6 max-w-5xl text-4xl font-black leading-[1.02] text-white sm:text-6xl lg:text-7xl">
            Software for the physical world.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-slate-200 sm:text-xl">
            OfRoot builds software that connects field operations, physical assets, operational data, AI, and enterprise systems.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <TrackedLink href="/book?source=industrial-systems-hero" source="industrial-systems:hero" className="inline-flex min-h-12 items-center justify-center rounded-md bg-[#FF9312] px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-[#FFB14A] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FFC46B]">
              Talk to OfRoot
            </TrackedLink>
            <Link href="#capabilities" className="inline-flex min-h-12 items-center justify-center rounded-md border border-white/30 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
              Explore our capabilities
            </Link>
          </div>
        </div>
      </header>

      <main id="main-content">
        <section className="px-6 py-16 sm:px-8 sm:py-20" aria-labelledby="blind-spots-heading">
          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#B65F00]">The operational gap</p>
              <h2 id="blind-spots-heading" className="mt-3 text-3xl font-black sm:text-4xl">Physical operations still create digital blind spots.</h2>
            </div>
            <div className="space-y-5 text-base leading-relaxed text-slate-600 sm:text-lg">
              <p>Industrial organizations operate complex physical environments, but important information is often captured through disconnected photographs, spreadsheets, manual notes, isolated systems, and field procedures.</p>
              <p>The problem is not simply collecting more data. It is turning physical-world information into reliable, structured operational data that software and teams can actually use.</p>
            </div>
          </div>
        </section>

        <section id="capabilities" className="scroll-mt-24 bg-slate-50 px-6 py-16 sm:px-8 sm:py-20" aria-labelledby="capabilities-heading">
          <div className="mx-auto max-w-6xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#B65F00]">Capabilities</p>
            <h2 id="capabilities-heading" className="mt-3 max-w-3xl text-3xl font-black sm:text-4xl">A software layer between field activity and operational decisions.</h2>
            <p className="mt-4 max-w-3xl text-slate-600">These are engineering capabilities, not claims that every pattern has been deployed in every environment.</p>
            <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {capabilities.map((capability) => (
                <article key={capability.title} className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-[#FF9312]/50 hover:shadow-[0_14px_40px_rgba(15,23,42,0.07)]">
                  <h3 className="text-xl font-bold text-slate-900">{capability.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">{capability.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#071225] px-6 py-16 text-white sm:px-8 sm:py-20" aria-labelledby="architecture-heading">
          <div className="mx-auto max-w-6xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#FFC46B]">System architecture</p>
            <h2 id="architecture-heading" className="mt-3 max-w-3xl text-3xl font-black text-white sm:text-4xl">From physical signals to usable operational systems.</h2>
            <div className="mt-10 grid items-stretch gap-4 lg:grid-cols-[1fr_auto_1fr_auto_1fr] lg:gap-5">
              <FlowColumn eyebrow="Inputs" title="Physical environment" items={fieldInputs} />
              <div className="flex items-center justify-center text-2xl text-[#FFC46B]" aria-hidden="true"><span className="rotate-90 lg:rotate-0">→</span></div>
              <FlowColumn eyebrow="Transformation" title="OfRoot software layer" items={softwareLayer} emphasized />
              <div className="flex items-center justify-center text-2xl text-[#FFC46B]" aria-hidden="true"><span className="rotate-90 lg:rotate-0">→</span></div>
              <FlowColumn eyebrow="Outputs" title="Operational systems" items={operationalOutputs} />
            </div>
          </div>
        </section>

        <section className="px-6 py-16 sm:px-8 sm:py-20" aria-labelledby="case-study-heading">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#B65F00]">Industrial Software Engineering</p>
              <h2 id="case-study-heading" className="mt-3 text-3xl font-black sm:text-4xl">Industrial Field Operations</h2>
              <p className="mt-5 text-base leading-relaxed text-slate-600">Through a direct B2B consulting engagement, OfRoot contributed software engineering expertise to technology designed for complex industrial field environments.</p>
              <p className="mt-4 text-base leading-relaxed text-slate-600">The work focused on connecting information captured in the physical environment with structured enterprise workflows.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 sm:p-8">
              <p className="text-sm font-semibold text-slate-900">Engineering concepts included</p>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {caseStudyConcepts.map((concept) => (
                  <li key={concept} className="flex gap-3 text-sm leading-relaxed text-slate-700">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#E07F00]" aria-hidden="true" />
                    {concept}
                  </li>
                ))}
              </ul>
              <p className="mt-7 border-l-4 border-[#FF9312] pl-4 text-lg font-bold text-slate-900">Turn information from the physical environment into trusted operational data.</p>
            </div>
          </div>
        </section>

        <section className="bg-[#FFF7ED] px-6 py-16 sm:px-8 sm:py-20" aria-labelledby="oversight-heading">
          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#B65F00]">Human oversight</p>
              <h2 id="oversight-heading" className="mt-3 text-3xl font-black sm:text-4xl">AI should support operators, not silently replace judgment.</h2>
              <p className="mt-5 text-base leading-relaxed text-slate-700 sm:text-lg">In operational environments, confidence, traceability, and human verification can matter more than fully autonomous behavior. Systems should make uncertainty visible and preserve an accountable path to confirmation.</p>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2" aria-label="Human oversight principles">
              {['Auditability', 'Confidence thresholds', 'Operator confirmation', 'Review workflows', 'Traceable records'].map((item) => (
                <li key={item} className="rounded-xl border border-[#E07F00]/20 bg-white/80 p-4 text-sm font-semibold text-slate-800">{item}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="px-6 py-16 sm:px-8 sm:py-20" aria-labelledby="future-heading">
          <div className="mx-auto max-w-6xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#B65F00]">Where this leads</p>
            <h2 id="future-heading" className="mt-3 max-w-3xl text-3xl font-black sm:text-4xl">A foundation for increasingly complex physical systems.</h2>
            <p className="mt-5 max-w-4xl text-base leading-relaxed text-slate-600 sm:text-lg">We are building toward a future where software can understand and coordinate increasingly complex physical environments. That includes cameras, sensors, spatial systems, autonomous inspection, drones, and robotics.</p>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {futureCapabilities.map((capability) => (
                <li key={capability} className="rounded-xl border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-800">{capability}</li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-slate-500">These are future-facing areas the architecture can support, not claims that OfRoot manufactures physical hardware today.</p>
          </div>
        </section>

        <section className="bg-slate-950 px-6 py-16 text-white sm:px-8 sm:py-20" aria-labelledby="industrial-cta-heading">
          <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#FFC46B]">Start with the operation</p>
              <h2 id="industrial-cta-heading" className="mt-3 max-w-3xl text-3xl font-black text-white sm:text-4xl">Map the simplest software solution.</h2>
              <p className="mt-4 max-w-3xl text-slate-300">Have an operational problem involving field data, assets, AI, integrations, or physical systems? Let&apos;s map the simplest software solution.</p>
            </div>
            <TrackedLink href="/book?source=industrial-systems-final" source="industrial-systems:final" className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-md bg-[#FF9312] px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-[#FFB14A] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FFC46B]">
              Talk to OfRoot
            </TrackedLink>
          </div>
        </section>
      </main>
    </div>
  );
}
