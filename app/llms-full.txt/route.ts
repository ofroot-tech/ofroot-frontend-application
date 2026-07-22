import { SITE_URL } from '@/app/lib/growth-content';

export function GET() {
  const text = `# OfRoot Technology: AI Growth Systems

OfRoot is a technical growth systems partner. The company connects three layers of business performance: discovery, conversion, and operations.

## Discover
AI Discoverability combines technical SEO, answer-oriented content, entity consistency, structured data, landing pages, internal linking, original research planning, and third-party authority. SEO, AEO, and GEO are treated as one integrated system. OfRoot does not guarantee rankings, citations, or inclusion in a specific generated answer.

Canonical service: ${SITE_URL}/services/ai-discoverability
Buyer outcome: ${SITE_URL}/solutions/generate-demand

## Convert
Automation Systems connect lead capture, qualification, CRM routing, follow-up, synchronization, operational dashboards, and workflow monitoring. The design goal is faster response, fewer manual handoffs, visible failures, and reporting teams can explain.

Canonical service: ${SITE_URL}/services/automation-systems
Buyer outcome: ${SITE_URL}/solutions/convert-more-leads

## Operate
Private Company AI connects approved documents, software, code, processes, and business tools through permission-aware retrieval and source-backed answers. Use cases include company knowledge, developer assistance, and sales or operations support.

Canonical service: ${SITE_URL}/services/private-company-ai
Buyer outcome: ${SITE_URL}/solutions/unlock-company-knowledge
Security approach: ${SITE_URL}/security
Fictional demo: ${SITE_URL}/demo/private-ai

## Proof boundary
OfRoot preserves existing anonymized case studies at ${SITE_URL}/results. Capability statements should not be interpreted as independently verified customer metrics unless a case study provides supporting evidence.

## Contact
Request a Growth Systems Audit: ${SITE_URL}/book
Email: communications@ofroot.technology`;
  return new Response(text, { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } });
}
