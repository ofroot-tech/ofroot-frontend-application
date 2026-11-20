import { AgentError, agentHttpError, agentJson, checkAgentOrigin } from '@/app/lib/agent-http';
import { getSigningIdentity } from '@/app/lib/agent-signing';
import { publicMarkdownPaths } from '@/app/lib/agent-readiness';
import { AGENT_VERSION, readPublicPage, searchPublicPages } from '@/app/lib/public-agent-content';

function queryInput(request: Request, allowed: string[]) {
  checkAgentOrigin(request);
  const parameters = new URL(request.url).searchParams;
  for (const key of parameters.keys()) {
    if (!allowed.includes(key) || parameters.getAll(key).length !== 1) throw new AgentError('Unknown or repeated query parameter.');
  }
  return parameters;
}

export async function publicSearchResponse(request: Request) {
  try {
    const parameters = queryInput(request, ['query', 'limit']);
    return agentJson(searchPublicPages({ query: parameters.get('query'), ...(parameters.has('limit') ? { limit: Number(parameters.get('limit')) } : {}) }));
  } catch (error) { return agentHttpError(error); }
}

export async function publicReadResponse(request: Request) {
  try {
    const parameters = queryInput(request, ['path']);
    return agentJson(await readPublicPage({ path: parameters.get('path') }));
  } catch (error) { return agentHttpError(error); }
}

export async function publicHealthResponse(request: Request) {
  try {
    queryInput(request, []);
    await getSigningIdentity();
    return agentJson({ status: 'ok', service: 'ofroot-public-knowledge', version: AGENT_VERSION, publicPages: publicMarkdownPaths().length, signing: 'ready' });
  } catch (error) { return agentHttpError(error); }
}
