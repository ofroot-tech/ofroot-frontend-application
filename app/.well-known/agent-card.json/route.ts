import { a2aAgentCard } from '@/app/lib/agent-discovery';
import { agentJson } from '@/app/lib/agent-http';
export const runtime = 'nodejs';
export function GET() { return agentJson(a2aAgentCard); }
