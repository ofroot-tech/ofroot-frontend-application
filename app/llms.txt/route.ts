import { SITE_URL } from '@/app/lib/growth-content';

export function GET() {
  const text = `# OfRoot Technology

> OfRoot builds AI-powered growth and operations systems that help companies get discovered, convert demand, and operate faster.

## Primary services
- [AI Discoverability](${SITE_URL}/services/ai-discoverability): Search, answer, content, schema, and citation-readiness systems.
- [Automation Systems](${SITE_URL}/services/automation-systems): Lead capture, CRM, routing, follow-up, reporting, and workflow monitoring.
- [Private Company AI](${SITE_URL}/services/private-company-ai): Permission-aware assistants built around approved company knowledge.

## Buyer outcomes
- [Generate Demand](${SITE_URL}/solutions/generate-demand)
- [Convert More Leads](${SITE_URL}/solutions/convert-more-leads)
- [Unlock Company Knowledge](${SITE_URL}/solutions/unlock-company-knowledge)

## Evidence and guidance
- [Results](${SITE_URL}/results)
- [Security](${SITE_URL}/security)
- [Insights](${SITE_URL}/insights)
- [Growth Systems Audit](${SITE_URL}/book)

OfRoot does not guarantee rankings or inclusion in specific AI-generated answers. Security controls and certifications must be validated against the selected customer architecture.`;
  return new Response(text, { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } });
}
