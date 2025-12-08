import ServiceHero from '../components/ServiceHero';
import ServiceProof from '../components/ServiceProof';
import ServiceFAQ from '../components/ServiceFAQ';

export const metadata = {
  title: 'Automation | OfRoot',
  description: 'Automation services to remove manual bottlenecks and reduce operational toil.',
};

export default function AutomationPage() {
  return (
    <div>
      <ServiceHero
        title="Automation"
        subtitle="Remove manual bottlenecks with reliable automation for deploys, testing and ops."
        ctaHref="/consulting/book"
        ctaLabel="Book a strategy call"
      />

      <section className="mt-6 reveal-in">
        <p className="text-gray-700 max-w-3xl">We implement CI/CD, automated testing, release pipelines, and runbooks so teams move faster with fewer incidents.</p>
      </section>

      <ServiceProof quotes={[{ quote: 'Automations cut our weekly deploy time from hours to minutes.' }]} />

      <ServiceFAQ items={[{ q: 'Which tools do you work with?', a: 'We work with GitHub Actions, GitLab CI, CircleCI, Jenkins, and other proven tools.' }]} />
    </div>
  );
}
