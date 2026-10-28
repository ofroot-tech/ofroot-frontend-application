jest.mock('@/app/lib/signal-subscriptions/email', () => ({ sendSignalEmail: jest.fn(), signalEmailFrame: jest.fn((_heading, body) => body) }));
jest.mock('@/app/lib/signal-subscriptions/store', () => ({
  ...jest.requireActual('@/app/lib/signal-subscriptions/store'),
  consumeSubscriptionRate: jest.fn(), ensureSubscriptionSchema: jest.fn(), getSubscriptionDatabase: jest.fn(), withSubscriptionTransaction: jest.fn(),
}));

import { SubscriptionError, type SignalSubscriber } from '@/app/lib/signal-subscriptions/types';
import { nextSignalSend } from '@/app/lib/signal-subscriptions/config';
import { createSubscriptionToken, verifySubscriptionToken } from '@/app/lib/signal-subscriptions/tokens';
import { beginSubscription, changeSubscriberPreferences, confirmSubscription, getSubscriberPreferences, requestPreferencesLink, unsubscribeSignal } from '@/app/lib/signal-subscriptions/service';
import { consumeSubscriptionRate, getSubscriptionDatabase, subscriptionRateDecision, withSubscriptionTransaction } from '@/app/lib/signal-subscriptions/store';
import { sendSignalEmail } from '@/app/lib/signal-subscriptions/email';
import { assertSubscriptionOrigin, readSubscriptionJson, subscriptionFailure } from '@/app/api/news/subscriptions/_shared';

const subscriber: SignalSubscriber = { id: '38bcdb81-650f-4f1e-b0bc-5999ef15527a', email: 'reader@example.com', status: 'active', topics: ['ai'], content: 'both', frequency: 'weekly', confirmedAt: '2026-10-27T12:00:00.000Z', nextSendAt: '2026-11-02T14:00:00.000Z', lastSentAt: null, tokenVersion: 3 };
const row = (overrides: Record<string, unknown> = {}) => ({ id: subscriber.id, email: subscriber.email, status: subscriber.status, topics: subscriber.topics, content: subscriber.content, frequency: subscriber.frequency, confirmed_at: subscriber.confirmedAt, next_send_at: subscriber.nextSendAt, last_sent_at: null, token_version: subscriber.tokenVersion, ...overrides });
const signup = { email: ' Reader@Example.COM ', topics: ['ai', 'policy'], content: 'both', frequency: 'weekly', consent: true, website: '' };
const query = jest.fn();
const savedEnv = { secret: process.env.SIGNAL_SUBSCRIPTION_SECRET, database: process.env.NEWS_DATABASE_URL, resend: process.env.RESEND_API_KEY, vercel: process.env.VERCEL_URL };

beforeEach(() => {
  jest.clearAllMocks(); jest.useFakeTimers(); jest.setSystemTime(new Date('2026-10-28T12:00:00.000Z'));
  process.env.SIGNAL_SUBSCRIPTION_SECRET = 'test-signal-subscription-secret-with-enough-entropy';
  process.env.NEWS_DATABASE_URL = 'postgresql://unit-test.invalid/signal';
  process.env.RESEND_API_KEY = 'unit-test-provider-key'; delete process.env.VERCEL_URL;
  query.mockReset().mockResolvedValue({ rows: [], rowCount: 0 });
  jest.mocked(consumeSubscriptionRate).mockResolvedValue(true);
  jest.mocked(sendSignalEmail).mockResolvedValue({ id: 'mock-provider-receipt' });
  jest.mocked(getSubscriptionDatabase).mockReturnValue({ query } as unknown as ReturnType<typeof getSubscriptionDatabase>);
  (withSubscriptionTransaction as jest.Mock).mockImplementation((action: (client: unknown) => Promise<unknown>) => action({ query }));
});
afterEach(() => {
  jest.useRealTimers();
  for (const [name, value] of Object.entries({ SIGNAL_SUBSCRIPTION_SECRET: savedEnv.secret, NEWS_DATABASE_URL: savedEnv.database, RESEND_API_KEY: savedEnv.resend, VERCEL_URL: savedEnv.vercel })) {
    if (value === undefined) delete process.env[name]; else process.env[name] = value;
  }
});

describe('scoped passwordless tokens', () => {
  it('keeps email out of the payload and rejects token tampering', () => {
    const token = createSubscriptionToken(subscriber, 'manage');
    expect(verifySubscriptionToken(token).sid).toBe(subscriber.id);
    expect(Buffer.from(token.split('.')[0], 'base64url').toString()).not.toContain(subscriber.email);
    expect(() => verifySubscriptionToken(`${token.slice(0, -1)}${token.endsWith('a') ? 'b' : 'a'}`)).toThrow(SubscriptionError);
  });
  it('does not let an unsubscribe link read preferences', async () => {
    const token = createSubscriptionToken(subscriber, 'unsubscribe');
    expect(() => verifySubscriptionToken(token)).toThrow(SubscriptionError);
    await expect(getSubscriberPreferences(token)).rejects.toBeInstanceOf(SubscriptionError);
    expect(query).not.toHaveBeenCalled();
  });
  it('expires management links and rejects future-issued links', () => {
    const token = createSubscriptionToken(subscriber, 'manage');
    expect(() => verifySubscriptionToken(token, ['manage'], new Date('2027-02-01T12:00:00Z'))).toThrow(SubscriptionError);
    expect(() => verifySubscriptionToken(token, ['manage'], new Date('2026-10-27T12:00:00Z'))).toThrow(SubscriptionError);
  });
  it('produces stable issue-scoped links without depending on current clock time', () => {
    const issue = new Date('2026-10-28T14:00:00Z');
    expect(createSubscriptionToken(subscriber, 'unsubscribe', issue)).toBe(createSubscriptionToken(subscriber, 'unsubscribe', issue));
    expect(createSubscriptionToken(subscriber, 'manage', issue)).not.toBe(createSubscriptionToken(subscriber, 'unsubscribe', issue));
  });
});

describe('confirmation and consent', () => {
  it('stages pending preferences, stores only a token hash, and leaves active fields untouched', async () => {
    query.mockResolvedValue({ rows: [{ id: subscriber.id }], rowCount: 1 });
    await beginSubscription(signup, '203.0.113.12');
    const [sql, parameters] = query.mock.calls[0];
    const conflictUpdate = String(sql).split('ON CONFLICT')[1];
    expect(conflictUpdate).not.toMatch(/\b(?:topics|content|frequency|status|next_send_at)\s*=/);
    expect(parameters[1]).toBe('reader@example.com');
    const message = jest.mocked(sendSignalEmail).mock.calls[0][0];
    const rawToken = message.text.match(/#token=([A-Za-z0-9_-]{43})/)?.[1];
    expect(rawToken).toBeDefined();
    expect(parameters[6]).toMatch(/^[a-f0-9]{64}$/);
    expect(JSON.stringify(parameters)).not.toContain(rawToken!);
    expect(message.text).toContain('/news/confirm#token=');
  });
  it.each([
    { ...signup, consent: false }, { ...signup, topics: [] }, { ...signup, topics: ['ai', 'ai'] }, { ...signup, email: 'not-an-email' },
  ])('rejects invalid consent/preferences before touching delivery', async input => {
    await expect(beginSubscription(input, '203.0.113.12')).rejects.toBeInstanceOf(SubscriptionError);
    expect(sendSignalEmail).not.toHaveBeenCalled();
    expect(consumeSubscriptionRate).not.toHaveBeenCalled();
  });
  it('accepts a honeypot silently and does not send or persist it', async () => {
    await beginSubscription({ ...signup, website: 'filled-by-bot' }, '203.0.113.12');
    expect(query).not.toHaveBeenCalled(); expect(sendSignalEmail).not.toHaveBeenCalled();
  });
  it('fails closed when delivery is not configured', async () => {
    delete process.env.RESEND_API_KEY;
    await expect(beginSubscription(signup, '203.0.113.12')).rejects.toMatchObject({ status: 503 });
    expect(query).not.toHaveBeenCalled();
  });
  it('does not resend a confirmation during the email cooldown', async () => {
    jest.mocked(consumeSubscriptionRate).mockResolvedValue(false);
    await beginSubscription(signup, '203.0.113.12');
    expect(query).not.toHaveBeenCalled(); expect(sendSignalEmail).not.toHaveBeenCalled();
  });
  it('confirms a pending choice once, clearing the challenge under a row lock', async () => {
    query.mockResolvedValueOnce({ rows: [row({ status: 'pending', pending_preferences: { topics: ['policy'], content: 'briefs', frequency: 'daily' } })] })
      .mockResolvedValueOnce({ rows: [row({ topics: ['policy'], content: 'briefs', frequency: 'daily', token_version: 4 })] });
    const result = await confirmSubscription('x'.repeat(43));
    expect(query.mock.calls[0][0]).toContain('FOR UPDATE');
    expect(query.mock.calls[0][0]).toContain('confirmation_expires_at>NOW()');
    expect(query.mock.calls[1][0]).toContain('confirmation_hash=NULL');
    expect(result.preferences.topics).toEqual(['policy']);
    expect(verifySubscriptionToken(result.managementToken).version).toBe(4);
    query.mockResolvedValueOnce({ rows: [] });
    await expect(confirmSubscription('x'.repeat(43))).rejects.toMatchObject({ status: 400 });
  });
  it('never reactivates a complaint/bounce suppression through confirmation', async () => {
    query.mockResolvedValue({ rows: [row({ status: 'suppressed', pending_preferences: { topics: ['ai'], content: 'both', frequency: 'weekly' } })] });
    await expect(confirmSubscription('x'.repeat(43))).rejects.toMatchObject({ status: 400 });
    expect(query).toHaveBeenCalledTimes(1);
  });
});

describe('preference and unsubscribe authorization', () => {
  it.each(['pending', 'unsubscribed', 'suppressed'])('rejects management access to %s records', async status => {
    query.mockResolvedValue({ rows: [row({ status })] });
    await expect(getSubscriberPreferences(createSubscriptionToken(subscriber, 'manage'))).rejects.toMatchObject({ status: 400 });
  });
  it('revokes old management links when the stored token version advances', async () => {
    query.mockResolvedValue({ rows: [row({ token_version: 4 })] });
    await expect(getSubscriberPreferences(createSubscriptionToken(subscriber, 'manage'))).rejects.toMatchObject({ status: 400 });
  });
  it('lets a verified reader pause without discarding their choices', async () => {
    query.mockResolvedValueOnce({ rows: [row()] }).mockResolvedValueOnce({ rows: [row({ status: 'paused', next_send_at: null })] });
    const result = await changeSubscriberPreferences(createSubscriptionToken(subscriber, 'manage'), { topics: ['ai'], content: 'both', frequency: 'weekly', paused: true });
    expect(result.status).toBe('paused'); expect(result.topics).toEqual(['ai']); expect(result.nextSendAt).toBeNull();
    expect(query.mock.calls[1][1][5]).toBeNull();
  });
  it('makes opt-out idempotent while preserving hard suppression', async () => {
    const token = createSubscriptionToken({ ...subscriber, tokenVersion: 1 }, 'unsubscribe');
    await unsubscribeSignal(token); await unsubscribeSignal(token);
    expect(query).toHaveBeenCalledTimes(2);
    expect(query.mock.calls[0][0]).toContain("WHEN status='suppressed' THEN status");
    expect(query.mock.calls[0][0]).toContain("WHEN status IN ('unsubscribed','suppressed') THEN token_version");
  });
  it('does not disclose an unknown address through preference-link delivery', async () => {
    query.mockResolvedValue({ rows: [] });
    await expect(requestPreferencesLink('reader@example.com', '203.0.113.12')).resolves.toBeUndefined();
    expect(sendSignalEmail).not.toHaveBeenCalled();
  });
});

describe('rate boundaries, scheduling, and request safety', () => {
  const now = Date.parse('2026-10-28T12:00:00Z');
  const fresh = { windowStart: now - 120_000, count: 1, lastAt: now - 90_000 };
  it('caps email requests and shared-IP requests independently', () => {
    expect(subscriptionRateDecision({ ...fresh, count: 3 }, fresh, now)).toBe('limited');
    expect(subscriptionRateDecision(fresh, { ...fresh, count: 5 }, now)).toBe('limited');
    expect(subscriptionRateDecision({ ...fresh, lastAt: now - 30_000 }, fresh, now)).toBe('cooldown');
    expect(subscriptionRateDecision({ ...fresh, count: 9, windowStart: now - 3_600_001 }, fresh, now)).toBe('allow');
  });
  it('bounds distributed transactional-email attempts by a shared daily budget', () => {
    expect(subscriptionRateDecision(fresh, fresh, now, { count: 39, limit: 40 })).toBe('allow');
    expect(subscriptionRateDecision(fresh, fresh, now, { count: 40, limit: 40 })).toBe('limited');
    expect(subscriptionRateDecision(fresh, fresh, now, { count: 0, limit: 0 })).toBe('limited');
  });
  it('keeps daily and Monday editions in the next future UTC slot', () => {
    expect(nextSignalSend('daily', new Date('2026-10-28T15:00:00Z'))).toBe('2026-10-29T14:00:00.000Z');
    expect(nextSignalSend('weekly', new Date('2026-10-28T12:00:00Z'))).toBe('2026-11-02T14:00:00.000Z');
    expect(nextSignalSend('weekly', new Date('2026-11-02T14:00:01Z'))).toBe('2026-11-09T14:00:00.000Z');
  });
  it('rejects foreign browser origins and oversized bodies', async () => {
    expect(() => assertSubscriptionOrigin(new Request('https://www.ofroot.technology/api/news/subscriptions', { headers: { origin: 'https://attacker.example' } }))).toThrow(SubscriptionError);
    await expect(readSubscriptionJson(new Request('https://www.ofroot.technology/api/news/subscriptions', { method: 'POST', body: 'x'.repeat(9_000) }))).rejects.toMatchObject({ status: 413 });
  });
  it('does not expose unknown backend errors or cache private replies', async () => {
    const response = subscriptionFailure(new Error('private database details'));
    expect(response.status).toBe(503); expect(response.headers.get('cache-control')).toBe('no-store');
    expect(JSON.stringify(await response.json())).not.toContain('private database details');
  });
});
