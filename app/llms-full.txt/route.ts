import { SITE_URL } from '@/app/lib/growth-content';
import { featurePages, featurePath } from '@/app/lib/feature-content';
import { insights } from '@/app/lib/insights-content';

export function GET() {
  const featureDetails = [
    ['Discoverability capability map', 'ai-discoverability'],
    ['Automation capability map', 'automation-systems'],
    ['Private company AI capability map', 'private-company-ai'],
  ].map(([heading, service]) => {
    const pages = featurePages
      .filter(feature => feature.service === service)
      .map(feature => `### ${feature.eyebrow}\nCanonical page: ${SITE_URL}${featurePath(feature)}\nDirect answer: ${feature.directAnswer}\nQuestion this addresses: ${feature.buyerQuestion}`)
      .join('\n\n');
    return `## ${heading}\n${pages}`;
  }).join('\n\n');

  const insightDetails = insights
    .map(insight => `### ${insight.title}\nCanonical page: ${SITE_URL}/insights/${insight.slug}\nDirect answer: ${insight.directAnswer}`)
    .join('\n\n');

  const text = `# OfRoot Technology: Websites, Integrations, and AI Systems

OfRoot provides three connected offers: marketing websites and growth; integrations and internal tools; and AI systems and deployment. Its founder brings 11 years in technology. Home-service companies are one audience alongside founders, service businesses, and operational teams.

## Marketing websites and growth
Marketing websites, landing pages, ad campaign setup and management, and conversion measurement connect with technical SEO, AEO, and GEO. AI Discoverability combines technical SEO, answer-oriented content, entity consistency, structured data, landing pages, internal linking, original research planning, and third-party authority. SEO, AEO, and GEO are treated as one integrated system. OfRoot does not guarantee rankings, citations, or inclusion in a specific generated answer.

Canonical service: ${SITE_URL}/services/ai-discoverability
Related business outcome: ${SITE_URL}/solutions/generate-demand

## Integrations and internal tools
Internal applications, multi-source reporting and reconciliation, APIs, background jobs, and workflow automation help teams connect their work. Automation Systems connect lead capture, qualification, CRM routing, follow-up, synchronization, operational dashboards, and workflow monitoring. The design goal is faster response, fewer manual handoffs, visible failures, and reporting teams can explain.

Canonical service: ${SITE_URL}/services/automation-systems
Related business outcome: ${SITE_URL}/solutions/convert-more-leads

## AI systems and deployment
AI-assisted tools are scoped around approved data, evaluation, human review, hosting, monitoring, and operating documentation. Private Company AI connects approved documents, software, code, processes, and business tools through permission-aware retrieval and source-backed answers. Use cases include company knowledge, developer assistance, and sales or operations support.

Canonical service: ${SITE_URL}/services/private-company-ai
Related business outcome: ${SITE_URL}/solutions/unlock-company-knowledge
Security approach: ${SITE_URL}/security
Fictional demo: ${SITE_URL}/demo/private-ai

## AI Agent Integration Services
OfRoot designs production agent workflows around a specific business process, approved data, limited tool access, explicit human approvals, safe failure handling, evaluation, monitoring, and accountable ownership.

Canonical service: ${SITE_URL}/agent-integrations
Readiness guide: ${SITE_URL}/insights/is-your-business-ai-agent-ready
Interactive assessment: ${SITE_URL}/ai-agent-readiness-assessment
Technical website scanner: ${SITE_URL}/services/ai-audit
Scoring methodology: ${SITE_URL}/research/ai-agent-readiness-methodology

## Editorial and research standards
OfRoot attributes practical guidance to the OfRoot Technology Editorial Team until a named contributor has reviewed and approved publication under their own public profile. The published standards cover primary sourcing, evidence boundaries, AI assistance, corrections, substantive updates, research methods, and commercial transparency.

Editorial standards: ${SITE_URL}/about/editorial-standards
Author profile: ${SITE_URL}/authors/ofroot-technology

## Clinic Success Platform Appointment Preparation Pilot
The Clinic Success Platform pilot is a Technology service for clinic growth, referral links, and aggregate operations. It gives a clinic a focused referral path and agreed aggregate reporting to support operational review around appointment preparation. Health owns patient data, patient records, clinical workflows, and care decisions. Technology does not receive Health patient data automatically; any proposed Health-data access requires a separate documented approval and architecture conversation.

Canonical page: ${SITE_URL}/clinic-success

${featureDetails}

## Practical insight library
${insightDetails}

## Evidence and limitations
OfRoot publishes five illustrative capability examples at ${SITE_URL}/results: reporting and reconciliation, operational workflow applications, integrations and automation, AI-assisted tools, and marketing websites. These are potential engineering scopes, not client case studies or claims of measured outcomes. Existing case-study URL paths are retained for continuity.

## Engagements
OfRoot publishes current starting prices for a focused Growth Systems Build and Ongoing Optimization at ${SITE_URL}/pricing. Discoverability and private company AI are scoped after the audit because source quality, access rules, content volume, and implementation complexity materially affect the work.

## Contact
Discuss your project: ${SITE_URL}/book
Email: communications@ofroot.technology`;
  return new Response(text, { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } });
}
