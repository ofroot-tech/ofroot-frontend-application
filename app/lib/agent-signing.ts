import { createHash, createPrivateKey, createPublicKey, randomBytes } from 'node:crypto';
import { appendSignature, component, createSignature, type ResponseDescriptor } from 'http-message-sig';
import { signerFromJWK } from 'web-bot-auth/crypto';
import { CANONICAL_SITE_URL } from '@/app/config/site';
import { isPublicMarkdownPath } from '@/app/lib/agent-readiness';
import { AgentError } from '@/app/lib/agent-http';

export async function signingIdentity(input: unknown) {
  if (!input || typeof input !== 'object') throw new AgentError('Agent signing is not configured.', 503);
  const value = input as Record<string, unknown>;
  if (value.kty !== 'OKP' || value.crv !== 'Ed25519' || typeof value.d !== 'string' || typeof value.x !== 'string' || !value.d || !value.x) {
    throw new AgentError('Agent signing is not configured.', 503);
  }
  const jwk = { kty: 'OKP', crv: 'Ed25519', d: value.d, x: value.x };
  try {
    const publicKey = createPublicKey(createPrivateKey({ format: 'jwk', key: jwk })).export({ format: 'jwk' });
    if (publicKey.x !== jwk.x) throw new Error('Key mismatch');
    const signer = await signerFromJWK(jwk);
    return { signer, publicJwk: { kty: 'OKP', crv: 'Ed25519', x: publicKey.x!, kid: signer.keyid } };
  } catch { throw new AgentError('Agent signing is not configured.', 503); }
}

export type SigningIdentity = Awaited<ReturnType<typeof signingIdentity>>;
let configuredIdentity: Promise<SigningIdentity> | undefined;

export function getSigningIdentity(): Promise<SigningIdentity> {
  if (!configuredIdentity) {
    const raw = process.env.OFROOT_AGENT_SIGNING_JWK;
    if (!raw) return Promise.reject(new AgentError('Agent signing is not configured.', 503));
    let value: unknown;
    try { value = JSON.parse(raw); }
    catch { return Promise.reject(new AgentError('Agent signing is not configured.', 503)); }
    configuredIdentity = signingIdentity(value).catch(error => { configuredIdentity = undefined; throw error; });
  }
  return configuredIdentity;
}

function signatureParameters(identity: SigningIdentity, tag: string) {
  const created = Math.floor(Date.now() / 1000);
  return { created, expires: created + 60, alg: 'ed25519', keyid: identity.signer.keyid, tag, nonce: randomBytes(24).toString('base64') };
}

export async function signedPublicRequest(path: string, identity: SigningIdentity): Promise<Request> {
  if (!isPublicMarkdownPath(path)) throw new AgentError('Public page not found.', 404);
  const request = new Request(`${CANONICAL_SITE_URL}${path}`, {
    method: 'GET', credentials: 'omit', redirect: 'error',
    headers: { Accept: 'text/markdown', 'Signature-Agent': JSON.stringify(CANONICAL_SITE_URL), 'User-Agent': 'OfRoot-Public-Knowledge/1.0' },
  });
  const fields = await createSignature(request, {
    label: 'ofroot', components: ['@method', '@authority', '@path', '@query', 'signature-agent'],
    parameters: signatureParameters(identity, 'web-bot-auth'), signer: identity.signer,
  });
  return new Request(request, { headers: appendSignature(request.headers, fields) });
}

export async function signedDirectory(request: Request, identity: SigningIdentity): Promise<Response> {
  const body = JSON.stringify({ keys: [identity.publicJwk] });
  const headers = new Headers({
    'Content-Type': 'application/http-message-signatures-directory+json',
    'Content-Digest': `sha-256=:${createHash('sha256').update(body).digest('base64')}:`,
    'Cache-Control': 'public, max-age=30', 'X-Content-Type-Options': 'nosniff',
  });
  const message: ResponseDescriptor = {
    kind: 'response', status: 200, request,
    fields: [...headers.entries()].map(([name, value]) => ({ name, value })),
  };
  const fields = await createSignature(message, {
    label: 'ofroot', components: [component('@authority', { req: true }), '@status', 'content-type', 'content-digest'],
    parameters: signatureParameters(identity, 'http-message-signatures-directory'), signer: identity.signer,
  });
  return new Response(request.method === 'HEAD' ? null : body, { headers: appendSignature(headers, fields) });
}
