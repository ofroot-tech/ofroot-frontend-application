import ServiceHero from '../components/ServiceHero';
import ServiceProof from '../components/ServiceProof';
import ServiceFAQ from '../components/ServiceFAQ';

export const metadata = {
  title: 'Data & Reporting | OfRoot',
  description: 'Turn event data into clear reports and actionable insights for growth and ops.',
};

export default function DataReportingPage() {
  return (
    <div>
      <ServiceHero
        title="Data & Reporting"
        subtitle="Turn event data into clear reports and actionable insights for growth and ops."
        ctaHref="/consulting/book"
        ctaLabel="Book a strategy call"
      />

      <section className="mt-6 reveal-in">
        <p className="text-gray-700 max-w-3xl">We build tracking plans, dashboards, and reporting to help stakeholders make faster, data-driven decisions.</p>
      </section>

      <ServiceProof quotes={[{ quote: 'We finally got trusted analytics across product and marketing.' }]} />

      <ServiceFAQ items={[{ q: 'Can you work with our existing analytics stack?', a: 'Yes — we integrate with Segment, Snowflake, Looker, Metabase, and others.' }]} />
    </div>
  );
}
