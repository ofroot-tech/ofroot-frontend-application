import { randomUUID } from 'node:crypto';
import { POST } from '@/app/api/partner-inquiry/route';
import { savePartnerInquiry } from '@/app/lib/partner-inquiry-store';
import { PartnerInquiryError, partnerAttribution } from '@/app/lib/partner-inquiry';

jest.mock('@/app/lib/partner-inquiry-store', () => ({ savePartnerInquiry: jest.fn() }));
const saved = jest.mocked(savePartnerInquiry);
const submission = () => ({ requestId: randomUUID(), name: 'Synthetic Partner', email: 'qa@example.test', company: 'Synthetic Staffing', partnerType: 'staffing', need: 'embedded', description: 'A synthetic application modernization engagement.', timeframe: 'planning', budget: '', consent: true, website: '', attribution: { source: 'fixture', medium: '', campaign: '' } });
function request(body: unknown, origin = 'http://localhost:3017', contentType = 'application/json') {
  return new Request('http://localhost:3017/api/partner-inquiry', { method: 'POST', headers: { origin, 'Content-Type': contentType }, body: JSON.stringify(body) });
}

beforeEach(() => {
  saved.mockReset().mockImplementation(async input => ({ requestId: input.requestId }));
});

it('returns a durable reference only after the store confirms receipt', async () => {
  const input = submission();
  const response = await POST(request(input));
  expect(response.status).toBe(201);
  expect(response.headers.get('cache-control')).toBe('no-store');
  expect(await response.json()).toEqual({ ok: true, requestId: input.requestId });
  expect(saved).toHaveBeenCalledWith(expect.objectContaining({ email: 'qa@example.test', consent: true }), 'unknown');
});

it.each([
  { consent: false }, { name: '' }, { email: 'bad' }, { company: '' },
  { partnerType: 'invalid' }, { need: 'invalid' }, { description: 'short' },
  { description: 'x'.repeat(3001) }, { requestId: '../bad' }, { timeframe: '' },
  { extraField: 'not allowed' }, { attribution: { source: 'qa@example.test' } },
])('rejects invalid input before storage: %j', async change => {
  expect((await POST(request({ ...submission(), ...change }))).status).toBe(400);
  expect(saved).not.toHaveBeenCalled();
});

it('rejects cross-origin, missing-origin, wrong-content-type and honeypot requests', async () => {
  expect((await POST(request(submission(), 'https://example.test'))).status).toBe(403);
  expect((await POST(request(submission(), ''))).status).toBe(403);
  expect((await POST(request(submission(), undefined, 'text/plain'))).status).toBe(415);
  expect((await POST(request({ ...submission(), website: 'spam' }))).status).toBe(400);
  expect(saved).not.toHaveBeenCalled();
});

it('bounds bytes even when no Content-Length is provided', async () => {
  expect((await POST(request({ padding: 'x'.repeat(17000) }))).status).toBe(413);
  expect(saved).not.toHaveBeenCalled();
});

it('accepts the browser Host when Next uses an internal URL, while rejecting forwarded-host spoofing', async () => {
  const headers = { host: '127.0.0.1:3017', origin: 'http://127.0.0.1:3017', 'Content-Type': 'application/json' };
  const response = await POST(new Request('http://localhost:3017/api/partner-inquiry', { method: 'POST', headers, body: JSON.stringify(submission()) }));
  expect(response.status).toBe(201);
  const rejected = await POST(new Request('http://localhost:3017/api/partner-inquiry', { method: 'POST', headers: { ...headers, origin: 'https://attacker.test', 'x-forwarded-host': 'attacker.test' }, body: JSON.stringify(submission()) }));
  expect(rejected.status).toBe(403);
});

it('returns an honest failure without exposing a database error', async () => {
  const warning = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  saved.mockRejectedValueOnce(new Error('postgres://secret-private-connection'));
  const response = await POST(request(submission()));
  expect(response.status).toBe(503);
  expect(await response.text()).not.toContain('secret-private');
  expect(warning).toHaveBeenCalledWith('Partner inquiry could not be saved.');
  warning.mockRestore();
});

it('preserves rate-limit and retry-conflict statuses', async () => {
  saved.mockRejectedValueOnce(new PartnerInquiryError('Limited', 429));
  const response = await POST(request(submission()));
  expect(response.status).toBe(429);
  expect(response.headers.get('retry-after')).toBe('3600');
  saved.mockRejectedValueOnce(new PartnerInquiryError('Changed', 409));
  expect((await POST(request(submission()))).status).toBe(409);
});

it('limits campaign attribution and drops email addresses and full URLs', () => {
  expect(partnerAttribution(new URLSearchParams('utm_source=partner&utm_medium=email&utm_campaign=spring'))).toEqual({ source: 'partner', medium: 'email', campaign: 'spring' });
  expect(partnerAttribution(new URLSearchParams('utm_source=person@example.test&utm_medium=https://example.test/private?email=person&utm_campaign=ok'))).toEqual({ source: '', medium: '', campaign: 'ok' });
});
