import { createHash, createPublicKey, generateKeyPairSync, verify } from 'node:crypto';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { component, verifySignature, type ResponseDescriptor } from 'http-message-sig';
import { verifierFromJWK } from 'web-bot-auth/crypto';
import { CANONICAL_SITE_URL as site } from '@/app/config/site';
import { AgentError, MAX_AGENT_REQUEST_BYTES, limitedText } from '@/app/lib/agent-http';
import { getPublicMarkdown, isPublicMarkdownPath, publicMarkdownPaths } from '@/app/lib/agent-readiness';
import { signingIdentity, signedDirectory, signedPublicRequest, type SigningIdentity } from '@/app/lib/agent-signing';
import { MAX_PUBLIC_PAGE_BYTES, readPublicPage, searchPublicPages } from '@/app/lib/public-agent-content';
import { handlePublicMcp } from '@/app/lib/public-mcp';
import { handlePublicA2a } from '@/app/lib/public-a2a';
import { publicHealthResponse, publicReadResponse, publicSearchResponse } from '@/app/lib/public-agent-rest';
import { GET as getDirectory } from '@/app/.well-known/http-message-signatures-directory/route';
import { GET as getSkill } from '@/app/.well-known/agent-skills/public-knowledge/SKILL.md/route';
import { GET as getSkillsIndex } from '@/app/.well-known/agent-skills/index.json/route';
import { GET as getCatalog } from '@/app/.well-known/api-catalog/route';
import { GET as getMcpCard } from '@/app/.well-known/mcp/server-card.json/route';
import { GET as getA2aCard } from '@/app/.well-known/agent-card.json/route';
import { GET as getOpenApi } from '@/app/agent-content/openapi.json/route';

const path = '/services/automation-systems';
const originalSigningEnv = process.env.OFROOT_AGENT_SIGNING_JWK;
let identity: SigningIdentity;

beforeAll(async () => {
  // Test keys remain in this process and are never saved or sent to a provider.
  const jwk = generateKeyPairSync('ed25519').privateKey.export({ format: 'jwk' });
  process.env.OFROOT_AGENT_SIGNING_JWK = JSON.stringify(jwk);
  identity = await signingIdentity(jwk);
});
afterEach(() => { jest.restoreAllMocks(); jest.useRealTimers(); });
afterAll(() => {
  if (originalSigningEnv === undefined) delete process.env.OFROOT_AGENT_SIGNING_JWK;
  else process.env.OFROOT_AGENT_SIGNING_JWK = originalSigningEnv;
});

function rpcRequest(endpoint: string, body: unknown, headers: HeadersInit = {}) {
  return new Request(`${site}${endpoint}`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body) });
}
function a2aRequest(action: unknown, extra: Record<string, unknown> = {}, headers: HeadersInit = {}) {
  return rpcRequest('/a2a', { jsonrpc: '2.0', id: 'request-1', method: 'SendMessage', params: {
    message: { messageId: 'message-1', role: 'ROLE_USER', parts: [{ data: action, mediaType: 'application/json' }] }, ...extra,
  } }, { 'A2A-Version': '1.0', ...headers });
}
function requestPolicy(now?: number) {
  return { algorithms: ['ed25519'], requiredComponents: ['@method', '@authority', '@path', '@query', 'signature-agent'], requiredParameters: ['created', 'expires', 'keyid', 'tag', 'nonce'], ...(now ? { now } : {}) };
}
async function verifyRequest(request: Request, now?: number) {
  const verifier = await verifierFromJWK(identity.publicJwk);
  return verifySignature(request, { policy: requestPolicy(now), resolveVerifier: candidate => {
    expect(candidate.parameters.keyid).toBe(identity.publicJwk.kid);
    expect(candidate.parameters.tag).toBe('web-bot-auth');
    return verifier;
  } });
}
function nodeVerify(headers: Headers, lines: string[]) {
  const parameters = headers.get('signature-input')!.replace(/^ofroot=/, '');
  const signature = headers.get('signature')!.match(/^ofroot=:([^:]+):$/)![1];
  const base = [...lines, `"@signature-params": ${parameters}`].join('\n');
  return verify(null, Buffer.from(base), createPublicKey({ format: 'jwk', key: identity.publicJwk }), Buffer.from(signature, 'base64'));
}
function publicSource() {
  return jest.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
    expect(input).toBeInstanceOf(Request);
    const request = input as Request;
    expect(request.url).toBe(`${site}${path}`);
    expect(request.redirect).toBe('error');
    expect(request.credentials).toBe('omit');
    expect(request.headers.get('accept')).toBe('text/markdown');
    expect(request.headers.has('authorization')).toBe(false);
    expect(request.headers.has('cookie')).toBe(false);
    expect(init?.signal).toBeDefined();
    await verifyRequest(request);
    return new Response(getPublicMarkdown(path), { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
  });
}

describe('public source boundary', () => {
  test('search returns a bounded list of approved canonical sources', () => {
    const result = searchPublicPages({ query: 'automation', limit: 3 });
    expect(result.results).toHaveLength(3);
    expect(publicMarkdownPaths()).toContain(path);
    for (const page of result.results) {
      expect(isPublicMarkdownPath(page.path)).toBe(true);
      expect(page.url).toBe(`${site}${page.path}`);
    }
    expect(publicMarkdownPaths().every(p => getPublicMarkdown(p)?.startsWith('# '))).toBe(true);
    expect(searchPublicPages({ query: 'zxq981c2e1c9noresult' }).results).toEqual([]);
  });

  test.each([
    { query: '' }, { query: ' '.repeat(5) }, { query: '!?!' }, { query: 'x'.repeat(161) },
    { query: 'automation', limit: 0 }, { query: 'automation', limit: 6 }, { query: 'automation', limit: 1.5 },
    { query: 'automation', url: 'https://example.org' },
  ])('rejects invalid search input %#', input => {
    expect(() => searchPublicPages(input)).toThrow(AgentError);
  });

  test.each(['/admin', '/dashboard', '/api/news', '//evil.example/a', 'https://evil.example/a', `${path}?x=1`, '/services/../admin', `${path}/`, '/services/%2e%2e/admin'])('rejects unapproved read path %s before fetching', async candidate => {
    const fetcher = jest.fn();
    await expect(readPublicPage({ path: candidate }, { identity, fetcher })).rejects.toMatchObject({ status: 404 });
    expect(fetcher).not.toHaveBeenCalled();
  });

  test('reads a canonical source exactly once with a valid signed GET', async () => {
    const source = publicSource();
    const result = await readPublicPage({ path }, { identity });
    expect(result).toEqual({ path, url: `${site}${path}`, markdown: getPublicMarkdown(path), retrieval: 'signed-public-get' });
    expect(source).toHaveBeenCalledTimes(1);
  });

  test.each([
    [302, 'text/markdown'], [500, 'text/markdown'], [200, 'text/html'],
  ])('rejects source status %s / %s', async (status, type) => {
    const fetcher = jest.fn(async () => new Response('untrusted response', { status: Number(status), headers: { 'Content-Type': String(type) } }));
    await expect(readPublicPage({ path }, { identity, fetcher })).rejects.toMatchObject({ status: 502 });
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  test('rejects oversized declared and streamed source bodies', async () => {
    const declared = jest.fn(async () => new Response('small', { headers: { 'Content-Type': 'text/markdown', 'Content-Length': String(MAX_PUBLIC_PAGE_BYTES + 1) } }));
    await expect(readPublicPage({ path }, { identity, fetcher: declared })).rejects.toMatchObject({ status: 502 });
    const streamed = jest.fn(async () => new Response('x'.repeat(MAX_PUBLIC_PAGE_BYTES + 1), { headers: { 'Content-Type': 'text/markdown' } }));
    await expect(readPublicPage({ path }, { identity, fetcher: streamed })).rejects.toBeInstanceOf(AgentError);
  });

  test('converts fetch failure into a bounded public error without exposing the exception', async () => {
    const fetcher = jest.fn(async () => { throw new Error('private upstream diagnostic'); });
    await expect(readPublicPage({ path }, { identity, fetcher })).rejects.toMatchObject({ status: 502, message: 'The public source is temporarily unavailable.' });
  });

  test('ends a stalled body read after the deadline and cancels its stream', async () => {
    jest.useFakeTimers();
    const cancel = jest.fn();
    const stalled = limitedText(new ReadableStream({ cancel }), 128);
    const rejected = expect(stalled).rejects.toMatchObject({ status: 504 });
    await jest.advanceTimersByTimeAsync(5000);
    await rejected;
    expect(cancel).toHaveBeenCalledTimes(1);
  });
});

describe('signing identity and public key directory', () => {
  test('request signature is independently valid with Node crypto and rejects path/header tampering and expiry', async () => {
    const request = await signedPublicRequest(path, identity);
    expect(request.headers.get('signature-agent')).toBe(JSON.stringify(site));
    expect(nodeVerify(request.headers, [
      '"@method": GET', '"@authority": www.ofroot.technology', `"@path": ${path}`, '"@query": ?', `"signature-agent": ${JSON.stringify(site)}`,
    ])).toBe(true);
    await verifyRequest(request);
    await expect(verifyRequest(new Request(`${site}/`, request))).rejects.toThrow();
    const modified = new Headers(request.headers); modified.set('Signature-Agent', '"https://evil.example"');
    await expect(verifyRequest(new Request(request, { headers: modified }))).rejects.toThrow();
    await expect(verifyRequest(request, Math.floor(Date.now() / 1000) + 120)).rejects.toThrow();
    const second = await signedPublicRequest(path, identity);
    expect(second.headers.get('signature-input')).not.toBe(request.headers.get('signature-input'));
  });

  test('directory exposes only the public key and signs the actual host, content type, status and digest', async () => {
    const request = new Request(`${site}/.well-known/http-message-signatures-directory`);
    const response = await signedDirectory(request, identity);
    const body = await response.text();
    expect(response.headers.get('content-type')).toBe('application/http-message-signatures-directory+json');
    const key = JSON.parse(body).keys[0];
    expect(Object.keys(key).sort()).toEqual(['crv', 'kid', 'kty', 'x']);
    const digest = `sha-256=:${createHash('sha256').update(body).digest('base64')}:`;
    expect(response.headers.get('content-digest')).toBe(digest);
    expect(nodeVerify(response.headers, [
      '"@authority";req: www.ofroot.technology', '"@status": 200',
      '"content-type": application/http-message-signatures-directory+json', `"content-digest": ${digest}`,
    ])).toBe(true);
    const verifier = await verifierFromJWK(key);
    const descriptor: ResponseDescriptor = { kind: 'response', status: 200, request, fields: [...response.headers].map(([name, value]) => ({ name, value })) };
    const policy = { algorithms: ['ed25519'], requiredComponents: [component('@authority', { req: true }), '@status', 'content-type', 'content-digest'], requiredParameters: ['created', 'expires', 'keyid', 'tag'] };
    await expect(verifySignature(descriptor, { policy, resolveVerifier: () => verifier })).resolves.toMatchObject({ parameters: { tag: 'http-message-signatures-directory', keyid: key.kid } });
    await expect(verifySignature({ ...descriptor, request: new Request('https://evil.example/.well-known/http-message-signatures-directory') }, { policy, resolveVerifier: () => verifier })).rejects.toThrow();
    const head = await signedDirectory(new Request(request, { method: 'HEAD' }), identity);
    expect(await head.text()).toBe('');
    expect(head.headers.has('signature')).toBe(true);
  });

  test('missing, malformed, public-only and mismatched keys fail closed', async () => {
    await expect(signingIdentity(null)).rejects.toMatchObject({ status: 503 });
    await expect(signingIdentity(identity.publicJwk)).rejects.toMatchObject({ status: 503 });
    const first = generateKeyPairSync('ed25519').privateKey.export({ format: 'jwk' });
    const second = generateKeyPairSync('ed25519').publicKey.export({ format: 'jwk' });
    await expect(signingIdentity({ ...first, x: second.x })).rejects.toMatchObject({ status: 503 });
    const configured = process.env.OFROOT_AGENT_SIGNING_JWK;
    try {
      for (const raw of [undefined, 'invalid-json', JSON.stringify(identity.publicJwk)]) {
        if (raw === undefined) delete process.env.OFROOT_AGENT_SIGNING_JWK;
        else process.env.OFROOT_AGENT_SIGNING_JWK = raw;
        await jest.isolateModulesAsync(async () => {
          const { GET } = await import('@/app/.well-known/http-message-signatures-directory/route');
          const response = await GET(new Request(`${site}/.well-known/http-message-signatures-directory`));
          expect(response.status).toBe(503);
          expect(response.headers.has('signature')).toBe(false);
          expect(await response.json()).toEqual({ error: 'Agent signing is not configured.' });
        });
      }
    } finally { process.env.OFROOT_AGENT_SIGNING_JWK = configured; }
  });
});

describe('real MCP SDK client over the Streamable HTTP handler', () => {
  test('initializes, lists bounded read-only tools, and executes search/read with normal SDK messages', async () => {
    const source = publicSource();
    const client = new Client({ name: 'ofroot-protocol-test', version: '1.0' });
    const transport = new StreamableHTTPClientTransport(new URL(`${site}/mcp`), {
      fetch: (input, init) => handlePublicMcp(new Request(input, init)),
    });
    try {
      await client.connect(transport);
      expect(client.getServerVersion()?.name).toBe('ofroot-public-knowledge');
      const tools = await client.listTools();
      expect(tools.tools.map(tool => tool.name).sort()).toEqual(['read_public_page', 'search_public_pages']);
      expect(tools.tools.every(tool => tool.annotations?.readOnlyHint && !tool.annotations.destructiveHint)).toBe(true);
      const search = await client.callTool({ name: 'search_public_pages', arguments: { query: 'automation', limit: 2 } });
      expect(search.isError).not.toBe(true);
      expect(search.structuredContent).toMatchObject({ query: 'automation' });
      expect((search.structuredContent as { results: unknown[] }).results).toHaveLength(2);
      const read = await client.callTool({ name: 'read_public_page', arguments: { path } });
      expect(read.isError).not.toBe(true);
      expect(read.structuredContent).toMatchObject({ path, url: `${site}${path}`, markdown: getPublicMarkdown(path), retrieval: 'signed-public-get' });
      const rejected = await client.callTool({ name: 'read_public_page', arguments: { path: '/admin' } });
      expect(rejected.isError).toBe(true);
      expect(source).toHaveBeenCalledTimes(1);
      expect(transport.sessionId).toBeUndefined();
    } finally { await client.close(); }
  });

  test('rejects forbidden origins, oversized requests and unsupported methods before executing tools', async () => {
    const body = { jsonrpc: '2.0', id: 1, method: 'tools/list' };
    expect((await handlePublicMcp(rpcRequest('/mcp', body, { Origin: 'https://evil.example' }))).status).toBe(403);
    expect((await handlePublicMcp(rpcRequest('/mcp', { ...body, padding: 'x'.repeat(MAX_AGENT_REQUEST_BYTES) }))).status).toBe(413);
    expect((await handlePublicMcp(new Request(`${site}/mcp`))).status).toBe(405);
  });

  test.each(['malformed JSON', 'invalid UTF-8'])('returns a JSON-RPC parse error for %s', async format => {
    const body = format === 'malformed JSON' ? '{' : new Uint8Array([0xff]);
    const response = await handlePublicMcp(new Request(`${site}/mcp`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body,
    }));
    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ jsonrpc: '2.0', id: null, error: { code: -32700 } });
  });

  test('rejects batches before they can fan out signed source reads', async () => {
    const source = jest.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('must not fetch'));
    const batch = Array.from({ length: 100 }, (_, id) => ({ jsonrpc: '2.0', id, method: 'tools/call', params: { name: 'read_public_page', arguments: { path } } }));
    const response = await handlePublicMcp(rpcRequest('/mcp', batch));
    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ jsonrpc: '2.0', id: null, error: { code: -32600 } });
    expect(source).not.toHaveBeenCalled();
  });

  test('bounds the complete MCP response including duplicated text and structured content', async () => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('x'.repeat(MAX_PUBLIC_PAGE_BYTES), { headers: { 'Content-Type': 'text/markdown' } }));
    const response = await handlePublicMcp(rpcRequest('/mcp', { jsonrpc: '2.0', id: 'large-read', method: 'tools/call', params: { name: 'read_public_page', arguments: { path } } }, {
      Accept: 'application/json, text/event-stream', 'MCP-Protocol-Version': '2025-11-25',
    }));
    expect(response.status).toBe(502);
    expect(await response.json()).toMatchObject({ jsonrpc: '2.0', id: 'large-read', error: { code: -32603 } });
  });
});

describe('A2A 1.0 JSON-RPC binding', () => {
  test('executes standard data and text messages and preserves the supplied context', async () => {
    const source = publicSource();
    const search = await handlePublicA2a(a2aRequest({ action: 'search', query: 'automation', limit: 2 }));
    const result = await search.json();
    expect(search.headers.get('a2a-version')).toBe('1.0');
    expect(result).toMatchObject({ jsonrpc: '2.0', id: 'request-1', result: { message: { role: 'ROLE_AGENT', parts: [{ mediaType: 'application/json', data: { query: 'automation' } }] } } });
    expect(result.result.message.parts[0].data.results).toHaveLength(2);
    const read = await handlePublicA2a(rpcRequest('/a2a', { jsonrpc: '2.0', id: 2, method: 'SendMessage', params: {
      message: { messageId: 'message-2', contextId: 'context-1', role: 'ROLE_USER', parts: [{ text: JSON.stringify({ action: 'read', path }) }] },
    } }, { 'A2A-Version': '1.0', Authorization: 'Bearer incoming-test-only', Cookie: 'incoming-test-only' }));
    expect(await read.json()).toMatchObject({ id: 2, result: { message: { contextId: 'context-1', parts: [{ data: { path, markdown: getPublicMarkdown(path) } }] } } });
    expect(source).toHaveBeenCalledTimes(1);
  });

  test.each(['0.3', '2.0', ''])('rejects unsupported or missing version %j without using 1.0 semantics', async version => {
    const request = a2aRequest({ action: 'search', query: 'automation' });
    if (version) request.headers.set('A2A-Version', version); else request.headers.delete('A2A-Version');
    const response = await handlePublicA2a(request);
    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ jsonrpc: '2.0', error: { code: -32009 } });
  });

  test('rejects private reads, uploads, asynchronous tasks and unsupported methods', async () => {
    const source = jest.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('must not fetch'));
    const privateRead = await handlePublicA2a(a2aRequest({ action: 'read', path: '/admin' }));
    expect(await privateRead.json()).toMatchObject({ error: { code: -32602 } });
    const asynchronous = await handlePublicA2a(a2aRequest({ action: 'search', query: 'automation' }, { configuration: { returnImmediately: true } }));
    expect(await asynchronous.json()).toMatchObject({ error: { code: -32602 } });
    const upload = await handlePublicA2a(rpcRequest('/a2a', { jsonrpc: '2.0', id: 1, method: 'SendMessage', params: { message: { messageId: 'upload', role: 'ROLE_USER', parts: [{ raw: 'aGVsbG8=', mediaType: 'text/plain' }] } } }, { 'A2A-Version': '1.0' }));
    expect(await upload.json()).toMatchObject({ error: { code: -32602 } });
    const method = await handlePublicA2a(rpcRequest('/a2a', { jsonrpc: '2.0', id: 1, method: 'GetTask', params: { id: 'no-task' } }, { 'A2A-Version': '1.0' }));
    expect(await method.json()).toMatchObject({ error: { code: -32601 } });
    expect(source).not.toHaveBeenCalled();
  });

  test.each(['malformed JSON', 'invalid UTF-8'])('returns a JSON-RPC parse error for %s', async format => {
    const body = format === 'malformed JSON' ? '{' : new Uint8Array([0xff]);
    const response = await handlePublicA2a(new Request(`${site}/a2a`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'A2A-Version': '1.0' }, body }));
    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ jsonrpc: '2.0', id: null, error: { code: -32700 } });
  });
});

describe('REST and discoverable artifacts', () => {
  test('search, read and configuration health use the same bounded public functions', async () => {
    const source = publicSource();
    const search = await publicSearchResponse(new Request(`${site}/agent-content/search?query=automation&limit=2`));
    expect(search.status).toBe(200);
    expect((await search.json()).results).toHaveLength(2);
    const read = await publicReadResponse(new Request(`${site}/agent-content/read?path=${encodeURIComponent(path)}`));
    expect(read.status).toBe(200);
    expect(await read.json()).toMatchObject({ path, retrieval: 'signed-public-get' });
    expect(source).toHaveBeenCalledTimes(1);
    expect((await publicHealthResponse(new Request(`${site}/agent-content/health`))).status).toBe(200);
    expect((await getDirectory(new Request(`${site}/.well-known/http-message-signatures-directory`))).status).toBe(200);
  });

  test.each(['query=automation&query=private', 'query=automation&limit=6', 'query=automation&extra=1'])('rejects invalid REST query %s', async query => {
    expect((await publicSearchResponse(new Request(`${site}/agent-content/search?${query}`))).status).toBe(400);
  });

  test('skill digest matches served bytes and discovery links describe implemented routes', async () => {
    const index = await getSkillsIndex().json();
    const skill = await getSkill().text();
    expect(index.skills[0].digest).toBe(`sha256:${createHash('sha256').update(skill).digest('hex')}`);
    expect(index.skills[0].url).toBe(`${site}/.well-known/agent-skills/public-knowledge/SKILL.md`);
    const catalog = getCatalog();
    expect(catalog.headers.get('content-type')).toBe('application/linkset+json');
    expect((await catalog.json()).linkset.map((entry: { anchor: string }) => entry.anchor)).toEqual([`${site}/agent-content`, `${site}/mcp`, `${site}/a2a`]);
    expect(await getMcpCard().json()).toMatchObject({ transport: { type: 'streamable-http', endpoint: `${site}/mcp` }, authentication: { required: false } });
    expect(await getA2aCard().json()).toMatchObject({ supportedInterfaces: [{ url: `${site}/a2a`, protocolBinding: 'JSONRPC', protocolVersion: '1.0' }], capabilities: { streaming: false, pushNotifications: false } });
    const openapi = await getOpenApi().json();
    expect(Object.keys(openapi.paths).sort()).toEqual(['/agent-content/health', '/agent-content/read', '/agent-content/search']);
    expect(openapi.paths['/agent-content/read'].get.responses['503']).toBeDefined();
  });
});
