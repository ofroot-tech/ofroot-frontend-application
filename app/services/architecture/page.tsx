import ServiceHero from '../components/ServiceHero';
import ServiceProof from '../components/ServiceProof';
import ServiceFAQ from '../components/ServiceFAQ';

export const metadata = {
  title: 'Architecture | OfRoot',
  description: 'Platform architecture services: scalable designs, cloud patterns, and technical strategy.',
};

export default function ArchitecturePage() {
  return (
    <div>
      <ServiceHero
        title="Architecture"
        subtitle="Design scalable, maintainable platform architectures that align with business goals."
        ctaHref="/consulting/book"
        ctaLabel="Book a strategy call"
      />

      <section className="mt-6 reveal-in">
        <p className="text-gray-700 max-w-3xl">We define pragmatic, risk-aware architectures that support product velocity and long-term maintainability. Our work includes cloud strategy, domain modeling, data flows, and API/topology design.</p>
      </section>

      <ServiceProof logos={['/images/logos/acme.svg']} quotes={[{ quote: 'Clear architecture removed costly rewrites and accelerated delivery by months.' }]} />

      <ServiceFAQ items={[{ q: 'How long does an architecture engagement take?', a: 'Typical discovery and roadmap: 2–4 weeks depending on scope.' }]} />
    </div>
  );
}
