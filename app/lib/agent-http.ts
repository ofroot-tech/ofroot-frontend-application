import { CANONICAL_SITE_URL } from '@/app/config/site';

export const MAX_AGENT_REQUEST_BYTES = 16 * 1024;
export const MAX_AGENT_RESPONSE_BYTES = 128 * 1024;
export const AGENT_TIMEOUT_MS = 5000;

export class AgentError extends Error {
  constructor(message: string, readonly status = 400) { super(message); }
}

export class AgentJsonParseError extends AgentError {
  constructor() { super('Invalid JSON.', 400); }
}

export function checkAgentOrigin(request: Request) {
  const origin = request.headers.get('origin');
  if (origin && origin !== CANONICAL_SITE_URL) throw new AgentError('Origin is not allowed.', 403);
}

export async function limitedText(stream: ReadableStream<Uint8Array> | null, maximum: number): Promise<string> {
  if (!stream) return '';
  const reader = stream.getReader();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new AgentError('Request timed out.', 504)), AGENT_TIMEOUT_MS);
  });
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    for (;;) {
      const { done, value } = await Promise.race([reader.read(), deadline]);
      if (done) break;
      total += value.byteLength;
      if (total > maximum) throw new AgentError('Content exceeds the size limit.', 413);
      chunks.push(value);
    }
    const bytes = new Uint8Array(total);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } finally {
    clearTimeout(timer);
    void reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}

export async function readAgentJson(request: Request): Promise<unknown> {
  checkAgentOrigin(request);
  if (request.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'application/json') {
    throw new AgentError('Content-Type must be application/json.', 415);
  }
  if (Number(request.headers.get('content-length')) > MAX_AGENT_REQUEST_BYTES) {
    throw new AgentError('Request exceeds the size limit.', 413);
  }
  try {
    const text = await limitedText(request.body, MAX_AGENT_REQUEST_BYTES);
    return JSON.parse(text);
  } catch (error) {
    if (error instanceof AgentError) throw error;
    throw new AgentJsonParseError();
  }
}

export function agentJson(value: unknown, status = 200, extraHeaders: HeadersInit = {}) {
  const body = JSON.stringify(value);
  if (new TextEncoder().encode(body).byteLength > MAX_AGENT_RESPONSE_BYTES) {
    throw new AgentError('Response exceeds the size limit.', 502);
  }
  return new Response(body, { status, headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...extraHeaders,
  } });
}

export function agentHttpError(error: unknown) {
  return agentJson({ error: error instanceof AgentError ? error.message : 'Agent service unavailable.' }, error instanceof AgentError ? error.status : 503);
}

export function methodNotAllowed() {
  return agentJson({ error: 'Method not allowed.' }, 405, { Allow: 'POST' });
}
