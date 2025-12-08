import ServiceHero from '../components/ServiceHero';
import ServiceProof from '../components/ServiceProof';
import ServiceFAQ from '../components/ServiceFAQ';

export const metadata = {
  title: 'Stability | OfRoot',
  description: 'Reduce risk with observability, testing, and incident response improvements.',
};

export default function StabilityPage() {
  return (
    <div>
      <ServiceHero
        title="Stability"
        subtitle="Reduce risk with observability, testing, and incident response improvements."
        ctaHref="/consulting/book"
        ctaLabel="Book a strategy call"
      />

      <section className="mt-6 reveal-in">
        <p className="text-gray-700 max-w-3xl">We improve monitoring, SLOs, testing coverage, and operational readiness so your product stays healthy under load.</p>
      </section>

      <ServiceProof quotes={[{ quote: 'Improved SLOs and alerts significantly lowered our mean time to recovery.' }]} />

      <ServiceFAQ items={[{ q: 'Can you help with incident runbooks?', a: 'Yes — we create runbooks and integrate them into on-call tooling.' }]} />
    </div>
  );
}
