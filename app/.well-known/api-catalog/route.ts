import { apiCatalog } from '@/app/lib/agent-discovery';
export const runtime = 'nodejs';
export function GET() { return new Response(JSON.stringify(apiCatalog), { headers: { 'Content-Type': 'application/linkset+json', 'Cache-Control': 'public, max-age=300', 'X-Content-Type-Options': 'nosniff' } }); }
