import ServiceHero from '../components/ServiceHero';
import ServiceProof from '../components/ServiceProof';
import ServiceFAQ from '../components/ServiceFAQ';

export const metadata = {
  title: 'Growth Systems | OfRoot',
  description: 'Build measurement-backed systems to acquire, engage, and retain customers.',
};

export default function GrowthSystemsPage() {
  return (
    <div>
      <ServiceHero
        title="Growth Systems"
        subtitle="Build measurement-backed systems to acquire, engage, and retain customers."
        ctaHref="/consulting/book"
        ctaLabel="Book a strategy call"
      />

      <section className="mt-6 reveal-in">
        <p className="text-gray-700 max-w-3xl">We focus on experiments, activation flows, and instrumentation that tie acquisition to retention and value.</p>
      </section>

      <ServiceProof quotes={[{ quote: 'Our experiments brought a clear lift in activation and MRR.' }]} />

      <ServiceFAQ items={[{ q: 'Do you run experiments for us?', a: 'Yes — we design, instrument, and analyze experiments end-to-end.' }]} />
    </div>
  );
}
