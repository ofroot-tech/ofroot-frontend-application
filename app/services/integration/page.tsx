import ServiceHero from '../components/ServiceHero';
import ServiceProof from '../components/ServiceProof';
import ServiceFAQ from '../components/ServiceFAQ';

export const metadata = {
  title: 'Integration | OfRoot',
  description: 'Connect services and tools securely to streamline product and engineering workflows.',
};

export default function IntegrationPage() {
  return (
    <div>
      <ServiceHero
        title="Integration"
        subtitle="Connect services and tools securely to streamline product and engineering workflows."
        ctaHref="/consulting/book"
        ctaLabel="Book a strategy call"
      />

      <section className="mt-6 reveal-in">
        <p className="text-gray-700 max-w-3xl">We map integrations, design secure APIs, and automate data flows between systems so teams can move without fragile glue code.</p>
      </section>

      <ServiceProof quotes={[{ quote: 'Integrations removed manual export work and synchronized key metrics across teams.' }]} />

      <ServiceFAQ items={[{ q: 'Do you handle third‑party auth and data sync?', a: 'Yes — we design secure auth flows and robust syncing strategies.' }]} />
    </div>
  );
}
