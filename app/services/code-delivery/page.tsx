import ServiceHero from '../components/ServiceHero';
import ServiceProof from '../components/ServiceProof';
import ServiceFAQ from '../components/ServiceFAQ';

export const metadata = {
  title: 'Code Delivery | OfRoot',
  description: 'Improve delivery velocity and reliability through process and tooling improvements.',
};

export default function CodeDeliveryPage() {
  return (
    <div>
      <ServiceHero
        title="Code Delivery"
        subtitle="Improve velocity and safety with CI/CD, code ownership and delivery workflows."
        ctaHref="/consulting/book"
        ctaLabel="Book a strategy call"
      />

      <section className="mt-6 reveal-in">
        <p className="text-gray-700 max-w-3xl">We optimize team processes, branching strategies, pull request workflows, and environment management so your team ships confidently.</p>
      </section>

      <ServiceProof quotes={[{ quote: 'Delivery improvements led to a 2x increase in release frequency.' }]} />

      <ServiceFAQ items={[{ q: 'Do you help with team training?', a: 'Yes — we include enablement and documentation so practices stick.' }]} />
    </div>
  );
}
