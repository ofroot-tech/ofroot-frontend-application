import { agentDocumentation } from '@/app/lib/agent-discovery';
export const runtime = 'nodejs';
export function GET() { return new Response(agentDocumentation, { headers: { 'Content-Type': 'text/markdown; charset=utf-8', 'Cache-Control': 'public, max-age=300', 'X-Content-Type-Options': 'nosniff' } }); }
