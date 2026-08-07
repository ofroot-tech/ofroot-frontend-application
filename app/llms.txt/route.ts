import { SITE_URL } from '@/app/lib/growth-content';
import { featurePages, featurePath } from '@/app/lib/feature-content';

export function GET() {
  const featureGroups = [
    ['AI discoverability capabilities', 'ai-discoverability'],
    ['Automation capabilities', 'automation-systems'],
    ['Private company AI use cases', 'private-company-ai'],
  ].map(([heading, service]) => {
    const links = featurePages
      .filter(feature => feature.service === service)
      .map(feature => `- [${feature.eyebrow}](${SITE_URL}${featurePath(feature)}): ${feature.directAnswer}`)
      .join('\n');
    return `## ${heading}\n${links}`;
  }).join('\n\n');

  const text = `# OfRoot Technology

> OfRoot builds AI-powered growth and operations systems that help companies get discovered, convert demand, and operate faster.

## Primary services
- [AI Discoverability](${SITE_URL}/services/ai-discoverability): Search, answer, content, schema, and citation-readiness systems.
- [Automation Systems](${SITE_URL}/services/automation-systems): Lead capture, CRM, routing, follow-up, reporting, and workflow monitoring.
- [Private Company AI](${SITE_URL}/services/private-company-ai): Permission-aware assistants built around approved company knowledge.
- [AI Process Audit](${SITE_URL}/ai-process): Process discovery, manual-cost analysis, opportunity scoring, implementation planning, and measured improvement.
- [How to Find the Manual Work Worth Automating First](${SITE_URL}/blog/find-expensive-manual-work-before-automating): A practical guide to mapping work, calculating cost, scoring opportunities, and measuring results.
- [Clinic Success Platform Appointment Preparation Pilot](${SITE_URL}/clinic-success): A clinic-facing referral-link and aggregate-operations pilot. Technology does not receive Health patient data automatically.

${featureGroups}

## Buyer outcomes
- [Generate Demand](${SITE_URL}/solutions/generate-demand)
- [Convert More Leads](${SITE_URL}/solutions/convert-more-leads)
- [Unlock Company Knowledge](${SITE_URL}/solutions/unlock-company-knowledge)

## Evidence and guidance
- [Results](${SITE_URL}/results)
- [Security](${SITE_URL}/security)
- [Insights](${SITE_URL}/insights)
- [Growth Systems Audit](${SITE_URL}/book)
- [Engagements and starting ranges](${SITE_URL}/pricing)

OfRoot does not guarantee rankings or inclusion in specific AI-generated answers. Security controls and certifications must be validated against the selected customer architecture.`;
  return new Response(text, { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } });
}
