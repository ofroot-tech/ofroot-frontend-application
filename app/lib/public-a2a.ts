import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { AgentError, AgentJsonParseError, agentHttpError, agentJson, checkAgentOrigin, methodNotAllowed, readAgentJson } from '@/app/lib/agent-http';
import { executePublicTool } from '@/app/lib/public-agent-content';

const command = z.discriminatedUnion('action', [
  z.object({ action: z.literal('search'), query: z.string().trim().min(1).max(160), limit: z.number().int().min(1).max(5).optional() }).strict(),
  z.object({ action: z.literal('read'), path: z.string().max(300) }).strict(),
]);
const messageParams = z.object({
  message: z.object({
    messageId: z.string().min(1).max(128), role: z.literal('ROLE_USER'),
    contextId: z.string().min(1).max(128).optional(),
    parts: z.array(z.union([
      z.object({ data: command, mediaType: z.literal('application/json').optional() }).strict(),
      z.object({ text: z.string().min(1).max(500), mediaType: z.literal('text/plain').optional() }).strict(),
    ])).length(1),
  }).strict(),
  configuration: z.object({ acceptedOutputModes: z.array(z.string()).max(5).optional(), returnImmediately: z.literal(false).optional(), historyLength: z.literal(0).optional() }).strict().optional(),
}).strict();

function rpcError(id: string | number | null, code: number, message: string, status = 200) {
  return agentJson({ jsonrpc: '2.0', id, error: { code, message } }, status);
}

export async function handlePublicA2a(request: Request): Promise<Response> {
  let id: string | number | null = null;
  try {
    checkAgentOrigin(request);
    if (request.method !== 'POST') return methodNotAllowed();
    const version = request.headers.get('a2a-version') || '0.3';
    if (version !== '1.0') return rpcError(null, -32009, 'Supported A2A version: 1.0.', 400);
    const body = await readAgentJson(request);
    const envelope = z.object({ jsonrpc: z.literal('2.0'), id: z.union([z.string().max(128), z.number().int()]), method: z.string(), params: z.unknown() }).strict().safeParse(body);
    if (!envelope.success) return rpcError(null, -32600, 'Invalid JSON-RPC request.', 400);
    id = envelope.data.id;
    if (envelope.data.method !== 'SendMessage') return rpcError(id, -32601, 'Method not found. This service supports synchronous SendMessage only.');
    const parsed = messageParams.safeParse(envelope.data.params);
    if (!parsed.success) return rpcError(id, -32602, 'Send one ROLE_USER message with a public search/read command; tasks, uploads, and history are unsupported.');
    const { message, configuration } = parsed.data;
    if (configuration?.acceptedOutputModes?.length && !configuration.acceptedOutputModes.includes('application/json')) {
      return rpcError(id, -32005, 'Only application/json output is supported.');
    }
    const part = message.parts[0];
    let action: z.infer<typeof command>;
    try { action = 'data' in part ? part.data : command.parse(JSON.parse(part.text)); }
    catch { return rpcError(id, -32602, 'Use a JSON command: {"action":"search","query":"automation"} or {"action":"read","path":"/services/automation-systems"}.'); }
    const result = action.action === 'search'
      ? await executePublicTool('search_public_pages', { query: action.query, ...(action.limit === undefined ? {} : { limit: action.limit }) })
      : await executePublicTool('read_public_page', { path: action.path });
    return agentJson({ jsonrpc: '2.0', id, result: { message: {
      messageId: randomUUID(), contextId: message.contextId || randomUUID(), role: 'ROLE_AGENT',
      parts: [{ data: result, mediaType: 'application/json' }],
    } } }, 200, { 'A2A-Version': '1.0' });
  } catch (error) {
    if (error instanceof AgentJsonParseError) return rpcError(null, -32700, 'Invalid JSON.', 400);
    if (error instanceof AgentError && id !== null) return rpcError(id, error.status === 404 ? -32602 : -32603, error.message);
    return agentHttpError(error);
  }
}
