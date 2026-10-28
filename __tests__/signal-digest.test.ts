jest.mock('@/app/lib/news', () => ({ getNewsSnapshot: jest.fn() }));
jest.mock('@/app/lib/signal-briefs', () => ({ getBriefForArticle: jest.fn() }));
jest.mock('@/app/lib/signal-subscriptions/store', () => ({ ...jest.requireActual('@/app/lib/signal-subscriptions/store'), getSubscriptionDatabase: jest.fn(), ensureSubscriptionSchema: jest.fn().mockResolvedValue(undefined) }));
jest.mock('@/app/lib/signal-subscriptions/email', () => ({ ...jest.requireActual('@/app/lib/signal-subscriptions/email'), sendSignalEmail: jest.fn() }));

import { createHmac } from 'node:crypto';
import { getNewsSnapshot } from '@/app/lib/news';
import { getBriefForArticle } from '@/app/lib/signal-briefs';
import { getSubscriptionDatabase } from '@/app/lib/signal-subscriptions/store';
import { sendSignalEmail } from '@/app/lib/signal-subscriptions/email';
import { chooseDigestItems, digestIssueId, dispatchSignalDigests, isFreshForDigest, prepareDigestItems, renderSignalDigest } from '@/app/lib/signal-subscriptions/digest';
import { verifySignalWebhook, processSignalWebhook } from '@/app/lib/signal-subscriptions/webhook';
import { verifySubscriptionToken } from '@/app/lib/signal-subscriptions/tokens';
import type { DigestItem, SignalSubscriber } from '@/app/lib/signal-subscriptions/types';
import type { NewsArticle, NewsSnapshot } from '@/app/lib/news/types';
import type { SignalBrief } from '@/app/lib/signal-briefs/types';
import type { Insight } from '@/app/lib/insights-content';

const now = new Date('2026-10-28T14:30:00.000Z');
const subscriber: SignalSubscriber = { id: 'c318ca2f-3c23-4bdf-a321-58205694b69a', email: 'reader@example.test', status: 'active', topics: ['ai', 'cybersecurity'], content: 'briefs', frequency: 'daily', confirmedAt: '2026-10-27T15:00:00Z', nextSendAt: '2026-10-28T14:00:00.000Z', lastSentAt: null, tokenVersion: 2 };
const article: NewsArticle = { id: 'a'.repeat(20), title: 'A bounded research record', url: 'https://arxiv.org/abs/2610.12345', sourceId: 'arxiv', category: 'ai', kind: 'research', publishedAt: '2026-10-28T12:00:00.000Z' };
const item = (key: string, topic: DigestItem['topic'] = 'ai'): DigestItem => ({ key, topic, title: key, url: `https://www.ofroot.technology/news/brief/${'a'.repeat(20)}`, excerpt: 'A complete source sentence.', kind: 'brief', publishedAt: '2026-10-28T12:00:00.000Z', source: 'Approved record', sourceUrl: 'https://arxiv.org/abs/2610.12345' });
const snapshot = (articles: NewsArticle[]) => ({ articles } as NewsSnapshot);
const brief = { status: 'ready', digest: 'A complete source sentence. A bounded result with limitations.', evidence: { publisher: 'arXiv via DataCite', url: article.url } } as SignalBrief;

beforeEach(() => {
  jest.clearAllMocks();
  global.__ofrootDigestSchema = undefined;
  process.env.SIGNAL_SUBSCRIPTION_SECRET = 'unit-test-only-subscription-secret-123456789';
  process.env.NEWS_DATABASE_URL = 'postgresql://test.invalid/signal';
  process.env.RESEND_API_KEY = 'unit-test-only-provider-key';
  process.env.RESEND_WEBHOOK_SECRET = `whsec_${Buffer.from('unit-test-only-webhook-secret').toString('base64')}`;
  process.env.SIGNAL_POSTAL_ADDRESS = 'OfRoot Unit Test\n123 Example <Suite>\nTest City, IL 00000';
  delete process.env.SIGNAL_DIGEST_MAX_PER_DAY;
  delete process.env.SIGNAL_DIGEST_BATCH_SIZE;
  jest.mocked(getNewsSnapshot).mockResolvedValue(snapshot([article]));
  jest.mocked(getBriefForArticle).mockResolvedValue(brief);
  jest.mocked(sendSignalEmail).mockResolvedValue({ id: 'provider-receipt' });
});

describe('Signal digest content and preference boundaries', () => {
  it('selects a concise spread without duplicate keys or previously delivered items', () => {
    const chosen = chooseDigestItems([item('ai-1'), item('ai-1'), item('ai-2'), item('security-1', 'cybersecurity'), item('already-sent')], subscriber.topics, new Set(['already-sent']));
    expect(chosen.map(value => value.key)).toEqual(['ai-1', 'security-1', 'ai-2']);
    expect(chooseDigestItems(Array.from({ length: 20 }, (_, n) => item(`record-${n}`)), ['ai'])).toHaveLength(5);
  });
  it('uses publication dates and the previous issue boundary, not preparation time', () => {
    expect(isFreshForDigest('2026-10-28T15:00:00Z', subscriber, now)).toBe(false);
    expect(isFreshForDigest('2026-10-20', subscriber, now)).toBe(false);
    expect(isFreshForDigest('2026-10-27T14:10:00Z', { ...subscriber, lastSentAt: '2026-10-27T14:05:00Z' }, now)).toBe(true);
    expect(isFreshForDigest('2026-10-27T14:00:00Z', { ...subscriber, lastSentAt: '2026-10-27T14:05:00Z' }, now)).toBe(false);
  });
  it('does not turn commercial discovery metadata into newsletter content', async () => {
    const reporting = { ...article, id: 'b'.repeat(20), sourceId: 'techcrunch', kind: 'reporting' as const, url: 'https://techcrunch.com/a-story/' };
    const selected = await prepareDigestItems(subscriber, new Set(), now, { snapshot: snapshot([reporting, article]), insights: [] });
    expect(selected.map(value => value.key)).toEqual([`brief:${article.id}`]);
    expect(getBriefForArticle).toHaveBeenCalledTimes(1);
    expect(selected[0].sourceUrl).toBe(article.url);
  });
  it('omits unsupported or missing primary evidence', async () => {
    jest.mocked(getBriefForArticle).mockResolvedValue({ status: 'unavailable' } as SignalBrief);
    expect(await prepareDigestItems(subscriber, new Set(), now, { snapshot: snapshot([article]) })).toEqual([]);
  });
  it('sends newly published OfRoot writing only when its content preference permits it', async () => {
    const owned = { slug: 'practical-ai', title: 'Practical AI', description: 'OfRoot-authored guidance.', category: 'AI', published: '2026-10-28', modified: '2026-10-28' } as Insight;
    const old = { ...owned, slug: 'old-guide', published: '2026-09-01', modified: '2026-10-28' };
    expect((await prepareDigestItems({ ...subscriber, content: 'insights' }, new Set(), now, { insights: [owned, old] })).map(value => value.key)).toEqual(['insight:practical-ai']);
    expect(getNewsSnapshot).not.toHaveBeenCalled();
    expect(getBriefForArticle).not.toHaveBeenCalled();
  });
  it('renders escaped excerpts, separate attribution, and scoped preference links', () => {
    const message = renderSignalDigest(subscriber, [{ ...item('test'), title: '<script>alert(1)</script>', excerpt: 'Accuracy < 0.05 & limits remain.' }], 'issue-one', now);
    expect(message.html).not.toContain('<script>');
    expect(message.html).toContain('&lt;script&gt;');
    expect(message.html).toContain('Accuracy &lt; 0.05 &amp; limits remain.');
    expect(message.text).toContain('Source: Approved record');
    expect(message.html).toContain('123 Example &lt;Suite&gt;');
    expect(message.html).toContain('OfRoot Unit Test<br />123 Example');
    expect(message.text).toContain('OfRoot Unit Test\n123 Example <Suite>\nTest City, IL 00000');
    const token = new URL(message.unsubscribeUrl!).searchParams.get('token')!;
    expect(verifySubscriptionToken(token, ['unsubscribe'], now).sid).toBe(subscriber.id);
    expect(() => verifySubscriptionToken(token, ['manage'], now)).toThrow();
    expect(message.idempotencyKey).toBe('signal-digest/issue-one');
    expect(digestIssueId(subscriber.id, subscriber.nextSendAt!)).toBe(digestIssueId(subscriber.id, '2026-10-28T14:00:00Z'));
    expect(digestIssueId(subscriber.id, subscriber.nextSendAt!)).not.toBe(digestIssueId(subscriber.id, '2026-10-29T14:00:00Z'));
  });
  it('passes one-click unsubscribe headers through the checked email transport', async () => {
    const transport = jest.requireActual('@/app/lib/signal-subscriptions/email') as typeof import('@/app/lib/signal-subscriptions/email');
    const fetcher = jest.fn().mockResolvedValue(new Response(JSON.stringify({ id: 'accepted-id' }), { status: 200 }));
    const message = renderSignalDigest(subscriber, [item('one')], 'one', now);
    expect(await transport.sendSignalEmail(message, fetcher)).toEqual({ id: 'accepted-id' });
    const body = JSON.parse(fetcher.mock.calls[0][1].body);
    expect(body.headers['List-Unsubscribe-Post']).toBe('List-Unsubscribe=One-Click');
    expect(body.headers['List-Unsubscribe']).toBe(`<${message.unsubscribeUrl}>`);
    expect(fetcher.mock.calls[0][1].headers['Idempotency-Key']).toBe(message.idempotencyKey);
  });
});

type Issue = { id: string; subscriberId: string; dueAt: string; owner: string; status: string; leaseUntil: string; attemptedAt?: string; providerId?: string | null };

/** A small database double tracks durable business state rather than email
 * snapshots: the tests can run two dispatches and observe actual deduplication. */
function databaseDouble(initial: SignalSubscriber = subscriber) {
  const row: Record<string, unknown> = { id: initial.id, email: initial.email, status: initial.status, topics: initial.topics, content: initial.content, frequency: initial.frequency, confirmed_at: initial.confirmedAt, next_send_at: initial.nextSendAt, last_sent_at: initial.lastSentAt, token_version: initial.tokenVersion };
  const issues = new Map<string, Issue>();
  const delivered = new Map<string, { issueId: string; status: string }>();
  let owner: string | null = null;
  const result = (rows: unknown[] = []) => ({ rows, rowCount: rows.length });
  const query = jest.fn(async (statement: string, values: unknown[] = []): Promise<{ rows: any[]; rowCount: number }> => {
    const sql = statement.replace(/\s+/g, ' ').trim();
    if (/^(BEGIN|COMMIT|ROLLBACK|SET |CREATE |SELECT pg_advisory)/.test(sql)) return result();
    if (sql.startsWith('SELECT COUNT(*)::int AS count FROM ofroot_signal_subscribers')) return result([{ count: row.status === 'active' && row.confirmed_at && row.next_send_at && Date.parse(String(row.next_send_at)) <= Date.parse(String(values[0])) ? 1 : 0 }]);
    if (sql.startsWith('INSERT INTO ofroot_signal_digest_leases')) { if (owner) return result(); owner = String(values[0]); return result([{ owner }]); }
    if (sql.startsWith('DELETE FROM ofroot_signal_digest_leases')) { owner = null; return result(); }
    if (sql.startsWith('SELECT i.id AS issue_id')) return result([...issues.values()].filter(issue => issue.status === 'sending' && Date.parse(issue.leaseUntil) < Date.parse(String(values[0]))).map(issue => ({ ...row, issue_id: issue.id, issue_owner: issue.owner, due_at: issue.dueAt })));
    if (sql.startsWith('SELECT DISTINCT e.provider_id')) return result();
    if (sql.startsWith('SELECT COUNT(*)::int AS count FROM ofroot_signal_digest_issues')) return result([{ count: [...issues.values()].filter(issue => issue.attemptedAt && Date.parse(issue.attemptedAt) >= Date.parse(String(values[0]))).length }]);
    if (sql.startsWith("SELECT * FROM ofroot_signal_subscribers WHERE status='active'")) return result([row]);
    if (sql.startsWith('INSERT INTO ofroot_signal_digest_issues')) {
      const id = String(values[0]); const previous = issues.get(id);
      if (previous && (previous.status !== 'preparing' || Date.parse(previous.leaseUntil) >= Date.parse(String(values[5])))) return result();
      issues.set(id, { id, subscriberId: String(values[1]), dueAt: String(values[2]), owner: String(values[3]), leaseUntil: String(values[4]), status: 'preparing' }); return result([{ id }]);
    }
    if (sql.startsWith('SELECT item_key')) return result([...delivered.keys()].map(item_key => ({ item_key })));
    if (sql.startsWith('SELECT * FROM ofroot_signal_subscribers WHERE id=')) return result([row]);
    if (sql.startsWith("SELECT id FROM ofroot_signal_digest_issues WHERE id=")) { const issue = issues.get(String(values[0])); return result(issue?.owner === values[1] && issue.status === 'preparing' ? [{ id: issue.id }] : []); }
    if (sql.startsWith('INSERT INTO ofroot_signal_digest_items')) { const key = String(values[1]); if (delivered.has(key)) return result(); delivered.set(key, { issueId: String(values[2]), status: 'reserved' }); return result([{ item_key: key }]); }
    if (sql.startsWith("UPDATE ofroot_signal_digest_issues SET status='sending'")) { const issue = issues.get(String(values[2]))!; issue.status = 'sending'; issue.attemptedAt = String(values[1]); return result([issue]); }
    if (sql.startsWith('UPDATE ofroot_signal_digest_issues SET status=$1,provider_id=')) { const issue = issues.get(String(values[3])); if (issue?.owner !== values[4] || issue.status !== 'sending') return result(); issue.status = String(values[0]); issue.providerId = values[1] as string | null; return result([{ id: issue.id }]); }
    if (sql.startsWith('UPDATE ofroot_signal_digest_items SET status=')) { for (const value of delivered.values()) if (value.issueId === values[1]) value.status = String(values[0]); return result(); }
    if (sql.startsWith('UPDATE ofroot_signal_subscribers SET next_send_at=$1,last_sent_at=')) { if (row.status === 'active' && row.next_send_at === values[4]) { row.next_send_at = values[0]; if (values[1]) row.last_sent_at = values[2]; } return result(); }
    if (sql.startsWith('UPDATE ofroot_signal_digest_issues SET status=$1 WHERE')) { const issue = issues.get(String(values[1]))!; issue.status = String(values[0]); return result(); }
    if (sql.startsWith('UPDATE ofroot_signal_subscribers SET next_send_at=$1 WHERE')) { if (row.next_send_at === values[2]) row.next_send_at = values[0]; return result(); }
    if (sql.startsWith("UPDATE ofroot_signal_digest_issues SET status='cancelled'")) { const issue = issues.get(String(values[0]))!; issue.status = 'cancelled'; return result(); }
    if (sql.startsWith("UPDATE ofroot_signal_digest_issues SET status='empty'")) { issues.get(String(values[0]))!.status = 'empty'; return result(); }
    if (sql.startsWith('SELECT id FROM ofroot_signal_email_events')) return result();
    if (sql.startsWith('UPDATE ofroot_signal_digest_issues SET lease_until=')) { issues.get(String(values[1]))!.leaseUntil = String(values[0]); return result(); }
    throw new Error(`Unhandled database test statement: ${sql}`);
  });
  const database = { query, connect: jest.fn(async () => ({ query, release: jest.fn() })) };
  jest.mocked(getSubscriptionDatabase).mockReturnValue(database as unknown as ReturnType<typeof getSubscriptionDatabase>);
  return { database, row, issues, delivered };
}

describe('durable digest delivery', () => {
  it('does not dispatch before signed delivery events are configured', async () => {
    const state = databaseDouble();
    delete process.env.RESEND_WEBHOOK_SECRET;
    await expect(dispatchSignalDigests({ now })).rejects.toThrow('delivery-event verification');
    expect(state.database.query).not.toHaveBeenCalled();
    expect(sendSignalEmail).not.toHaveBeenCalled();
  });
  it('fails closed before database work when the public postal address is missing', async () => {
    const state = databaseDouble();
    delete process.env.SIGNAL_POSTAL_ADDRESS;
    await expect(dispatchSignalDigests({ now })).rejects.toThrow('public postal address');
    expect(state.database.query).not.toHaveBeenCalled();
    expect(sendSignalEmail).not.toHaveBeenCalled();
    expect(() => renderSignalDigest(subscriber, [item('one')], 'one', now)).toThrow('public postal address');
  });
  it('sends a confirmed due digest once and does not repeat its items on another issue', async () => {
    const state = databaseDouble();
    const first = await dispatchSignalDigests({ now, pause: async () => undefined });
    expect(first.sent).toBe(1);
    expect(sendSignalEmail).toHaveBeenCalledTimes(1);
    state.row.next_send_at = '2026-10-28T14:00:00.000Z';
    const repeatedOccurrence = await dispatchSignalDigests({ now, pause: async () => undefined });
    expect(repeatedOccurrence.sent).toBe(0);
    state.row.next_send_at = '2026-10-28T14:20:00.000Z';
    const anotherIssue = await dispatchSignalDigests({ now, pause: async () => undefined });
    expect(anotherIssue.empty).toBe(1);
    expect(sendSignalEmail).toHaveBeenCalledTimes(1);
    expect(state.delivered.get(`brief:${article.id}`)?.status).toBe('sent');
  });
  it('does not deliver unconfirmed, paused, or suppressed subscriptions', async () => {
    for (const status of ['pending', 'paused', 'suppressed'] as const) {
      global.__ofrootDigestSchema = undefined;
      databaseDouble({ ...subscriber, status, confirmedAt: status === 'pending' ? null : subscriber.confirmedAt });
      expect((await dispatchSignalDigests({ now })).sent).toBe(0);
    }
    expect(sendSignalEmail).not.toHaveBeenCalled();
  });
  it('skips an empty digest and advances its next date', async () => {
    const state = databaseDouble();
    jest.mocked(getNewsSnapshot).mockResolvedValue(snapshot([]));
    const result = await dispatchSignalDigests({ now });
    expect(result.empty).toBe(1);
    expect(state.row.next_send_at).toBe('2026-10-29T14:00:00.000Z');
    expect(sendSignalEmail).not.toHaveBeenCalled();
  });
  it('keeps uncertain attempts reserved instead of blindly resending', async () => {
    const state = databaseDouble();
    jest.mocked(sendSignalEmail).mockRejectedValue(new Error('Acknowledgement lost'));
    expect((await dispatchSignalDigests({ now })).uncertain).toBe(1);
    expect([...state.issues.values()][0].status).toBe('uncertain');
    expect(state.delivered.get(`brief:${article.id}`)?.status).toBe('uncertain');
    state.row.next_send_at = '2026-10-28T14:20:00.000Z';
    expect((await dispatchSignalDigests({ now })).sent).toBe(0);
    expect(sendSignalEmail).toHaveBeenCalledTimes(1);
  });
  it('supports a configuration/due-count dry run without mail or a delivery lease', async () => {
    const state = databaseDouble();
    delete process.env.SIGNAL_POSTAL_ADDRESS;
    expect(await dispatchSignalDigests({ now, dryRun: true })).toMatchObject({ state: 'dry_run', due: 1, sent: 0 });
    expect(sendSignalEmail).not.toHaveBeenCalled();
    expect(state.database.query.mock.calls.some(call => call[0].includes('INSERT INTO ofroot_signal_digest_leases'))).toBe(false);
  });
  it('leaves unattempted subscriptions due when the function preparation budget is exhausted', async () => {
    const state = databaseDouble();
    const clock = jest.spyOn(Date, 'now').mockReturnValueOnce(0).mockReturnValue(200_001);
    try {
      expect(await dispatchSignalDigests({ now })).toMatchObject({ sent: 0, scanned: 0, remaining: 1 });
      expect(state.row.next_send_at).toBe(subscriber.nextSendAt);
      expect(state.issues.size).toBe(0);
      expect(sendSignalEmail).not.toHaveBeenCalled();
    } finally { clock.mockRestore(); }
  });
  it('recovers a process lost after an attempted send without a next-day duplicate', async () => {
    const state = databaseDouble();
    const issueId = digestIssueId(subscriber.id, subscriber.nextSendAt!);
    state.issues.set(issueId, { id: issueId, subscriberId: subscriber.id, dueAt: subscriber.nextSendAt!, owner: 'crashed-worker', status: 'sending', leaseUntil: '2026-10-28T14:10:00.000Z', attemptedAt: '2026-10-28T14:00:00.000Z' });
    state.delivered.set(`brief:${article.id}`, { issueId, status: 'reserved' });
    expect((await dispatchSignalDigests({ now })).uncertain).toBe(1);
    expect(state.issues.get(issueId)?.status).toBe('uncertain');
    expect(state.delivered.get(`brief:${article.id}`)?.status).toBe('uncertain');
    expect(state.row.next_send_at).toBe('2026-10-29T14:00:00.000Z');
    expect(sendSignalEmail).not.toHaveBeenCalled();
  });
});

describe('signed email-event processing', () => {
  const secret = `whsec_${Buffer.from('a sufficiently long unit-test webhook key').toString('base64')}`;
  const raw = JSON.stringify({ type: 'email.complained', data: { email_id: 'provider-receipt', to: ['reader@example.test'] } });
  const signed = (body = raw, at = now) => {
    const id = 'msg_signal_unit_test'; const timestamp = Math.floor(at.getTime() / 1000).toString();
    const signature = `v1,${createHmac('sha256', Buffer.from(secret.slice(6), 'base64')).update(`${id}.${timestamp}.${body}`).digest('base64')}`;
    return { id, timestamp, signature };
  };
  it('accepts the exact signed raw body and rejects alterations, replay age, and missing setup', () => {
    expect(verifySignalWebhook(raw, signed(), secret, now)).toEqual({ type: 'email.complained', providerId: 'provider-receipt', eventId: 'msg_signal_unit_test' });
    expect(() => verifySignalWebhook(`${raw} `, signed(), secret, now)).toThrow('Invalid email event');
    expect(() => verifySignalWebhook(raw, signed(), secret, new Date(now.getTime() + 301_000))).toThrow();
    expect(() => verifySignalWebhook(raw, signed(), '', now)).toThrow('not configured');
  });
  it('rejects unsigned events and malformed suppression identities', () => {
    expect(() => verifySignalWebhook(raw, { ...signed(), signature: 'v1,invalid' }, secret, now)).toThrow();
    const malformed = JSON.stringify({ type: 'email.bounced', data: { to: ['someone-else@example.test'] } });
    expect(() => verifySignalWebhook(malformed, signed(malformed), secret, now)).toThrow();
  });
  it('reconciles by provider receipt rather than trusting an email address in an event', async () => {
    process.env.RESEND_WEBHOOK_SECRET = secret;
    const current = new Date(); const headers = signed(raw, current);
    const query = jest.fn(async (sql: string) => {
      if (sql.startsWith('SELECT id FROM ofroot_signal_email_events')) return { rows: [{ id: headers.id }], rowCount: 1 };
      if (sql.startsWith('SELECT subscriber_id')) return { rows: [], rowCount: 0 };
      return { rows: [], rowCount: 0 };
    });
    jest.mocked(getSubscriptionDatabase).mockReturnValue({ query, connect: async () => ({ query, release: () => undefined }) } as unknown as ReturnType<typeof getSubscriptionDatabase>);
    expect(await processSignalWebhook(raw, headers)).toEqual({ ok: true, ignored: false });
    expect(query.mock.calls.some(call => call[0].startsWith('UPDATE ofroot_signal_subscribers'))).toBe(false);
  });
});
