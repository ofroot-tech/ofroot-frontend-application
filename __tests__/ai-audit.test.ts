import { auditDomain, auditView, oraReportSchema, type AuditReport } from '../app/lib/ai-audit';
import { deliverFixPlan, loadAudit, signAudit, verifyAudit, guardRequest, readAuditJson } from '../app/lib/ai-audit-server';

const report: AuditReport = {
  contractVersion: '1.24.0', domain: 'example.com', score: 25, generatedAt: '2026-09-06T12:00:00Z', analysisStatus: 'complete', pendingChecks: [],
  layers: [{ id: 'access', name: 'Access', score: 1, maxScore: 2, checks: [
    { id: 'structure', name: 'Structure', status: 'warning', score: 1, maxScore: 2, details: 'Missing organization name', recommendation: 'Add the organization name.' },
    { id: 'mcp', name: 'MCP', status: 'fail', score: 0, maxScore: 2, recommendation: 'Add MCP.' },
  ] }],
  topFixes: [{ id: 'mcp', name: 'MCP', recommendation: 'Add MCP.' }],
  essentials: { score: 80, label: 'Good foundation', activeSurfaces: [], issues: ['structure'], checks: { structure: { tier: 'required', bonus: false } } },
};
const originalFetch = global.fetch;
beforeEach(() => { process.env.NEXTAUTH_SECRET = 'test-only-signing-secret'; process.env.RESEND_API_KEY = 'test-only-key'; });
afterEach(() => { global.fetch = originalFetch; jest.restoreAllMocks(); });

test.each(['localhost', '127.0.0.1', 'http://169.254.169.254', 'https://user:password@example.com', 'file:///etc/passwd', 'https://example.com:8443', 'https://a.internal', 'https://[::1]'])('rejects unsupported target %s', target => { expect(() => auditDomain(target)).toThrow(); });
test('normalizes URLs to a domain without sending private paths or query strings', () => { expect(auditDomain('https://EXAMPLE.com/private?token=secret')).toBe('example.com'); });
test('keeps website and full scores distinct and preserves provider issue order', () => {
  expect(auditView(report, 'website').score).toBe(80); expect(auditView(report, 'website').fixes[0].id).toBe('structure');
  expect(auditView(report, 'full').score).toBe(25); expect(auditView(report, 'full').fixes[0].id).toBe('mcp');
});
test('never fabricates a website score when essentials are absent or null', () => {
  expect(auditView({ ...report, essentials: undefined }, 'website').score).toBeNull();
  expect(auditView({ ...report, essentials: { ...report.essentials!, score: null } }, 'website').score).toBeNull();
});
test('pending checks make the displayed result provisional', () => { expect(auditView({ ...report, pendingChecks: ['deep'] }, 'website').partial).toBe(true); });
test('refuses incompatible report schema', () => { expect(oraReportSchema.safeParse({ ...report, contractVersion: '2.0.0' }).success).toBe(false); });
test('signs the actual summary and rejects tampering and expired reports', () => {
  const token = signAudit(report, 'website')!; expect(verifyAudit(token).score).toBe(80);
  expect(() => verifyAudit(`${token}x`)).toThrow();
  jest.spyOn(Date, 'now').mockReturnValue(Date.now() + 86400001); expect(() => verifyAudit(token)).toThrow('expired');
});
test('provider request uses a fixed endpoint, cache allowance, and never force-scans', async () => {
  global.fetch = jest.fn().mockResolvedValue(new Response(JSON.stringify(report)));
  await loadAudit('example.com'); const [url, options] = (global.fetch as jest.Mock).mock.calls[0];
  expect(url).toBe('https://ora.ai/api/scan?format=audit&include=essentials'); expect(JSON.parse(options.body)).toEqual({ url: 'https://example.com', maxAgeSeconds: 3600 });
});
test('refresh only reads the existing score', async () => {
  global.fetch = jest.fn().mockResolvedValue(new Response(JSON.stringify(report))); await loadAudit('example.com', true);
  expect((global.fetch as jest.Mock).mock.calls[0][1].method).toBe('GET');
});
test('honors provider rate limits', async () => {
  global.fetch = jest.fn().mockResolvedValue(new Response('{}', { status: 429, headers: { 'Retry-After': '7200' } }));
  await expect(loadAudit('example.com')).rejects.toMatchObject({ status: 429, retryAfter: '7200' });
});
test('rejects a report for another domain', async () => {
  global.fetch = jest.fn().mockResolvedValue(new Response(JSON.stringify({ ...report, domain: 'wrong.com' })));
  await expect(loadAudit('example.com')).rejects.toThrow('different domain');
});
test('email rejection never reports success', async () => {
  global.fetch = jest.fn().mockResolvedValue(new Response('{}', { status: 403 }));
  await expect(deliverFixPlan('Test', 'test@example.com', signAudit(report, 'website')!)).rejects.toThrow('could not deliver');
});
test('delivery includes verified scan context, reply-to, and idempotency', async () => {
  global.fetch = jest.fn().mockResolvedValue(new Response('{"id":"receipt"}'));
  await deliverFixPlan('Test', 'test@example.com', signAudit(report, 'website')!);
  const options = (global.fetch as jest.Mock).mock.calls[0][1]; const body = JSON.parse(options.body);
  expect(body.reply_to).toBe('test@example.com'); expect(body.text).toContain('Website essentials: 80/100'); expect(body.text).toContain('Add the organization name.'); expect(options.headers['Idempotency-Key']).toMatch(/^ai-audit-/);
});
test('missing delivery credentials fail closed', async () => {
  delete process.env.RESEND_API_KEY; global.fetch = jest.fn();
  await expect(deliverFixPlan('Test', 'test@example.com', signAudit(report, 'website')!)).rejects.toMatchObject({ status: 503 }); expect(global.fetch).not.toHaveBeenCalled();
});
test('rejects cross-origin and excessive requests', () => {
  expect(() => guardRequest(new Request('https://ofroot.technology/api/ai-audit', { headers: { origin: 'https://evil.example' } }), 'test')).toThrow();
  const req = new Request('https://ofroot.technology/api/ai-audit'); guardRequest(req, 'test-limit', 1); expect(() => guardRequest(req, 'test-limit', 1)).toThrow();
});
test('bounds the actual request body, not only its content-length header', async () => {
  await expect(readAuditJson(new Request('https://example.com', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ large: 'x'.repeat(100) }) }), 20)).rejects.toMatchObject({ status: 413 });
});
