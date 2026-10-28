import { sendSignalEmail } from '@/app/lib/signal-subscriptions/email';
import { isPrivateSignalRoute } from '@/app/lib/signal-subscriptions/privacy';

describe('Signal mail transport and private-route boundaries', () => {
  afterEach(() => { delete process.env.RESEND_API_KEY; });

  it('keeps private mailbox links and forms outside telemetry while leaving articles public', () => {
    for (const path of ['/news/subscribe', '/news/confirm#token=private', '/news/preferences?ignored=1', '/news/unsubscribe', '/api/news/subscriptions/unsubscribe?token=private']) {
      expect(isPrivateSignalRoute(path)).toBe(true);
    }
    for (const path of ['/news', '/news/briefs', '/news/brief/123', '/news/preferences-guide', undefined]) expect(isPrivateSignalRoute(path)).toBe(false);
  });

  it('requires a provider receipt and hides provider error details', async () => {
    process.env.RESEND_API_KEY = 'test-only-key';
    const message = { to: 'delivered+signal-test@resend.dev', subject: 'Signal test', html: '<p>Test</p>', text: 'Test', idempotencyKey: 'test-only-id' };
    const rejected = jest.fn().mockResolvedValue(new Response(JSON.stringify({ message: 'private provider details' }), { status: 403 }));
    await expect(sendSignalEmail(message, rejected)).rejects.toMatchObject({ status: 502 });
    await expect(sendSignalEmail(message, jest.fn().mockResolvedValue(new Response('{}', { status: 200 })))).rejects.toMatchObject({ status: 502 });
    const accepted = jest.fn().mockResolvedValue(new Response('{"id":"receipt-id"}', { status: 200 }));
    await expect(sendSignalEmail(message, accepted)).resolves.toEqual({ id: 'receipt-id' });
    expect(accepted.mock.calls[0][1].headers['Idempotency-Key']).toBe('test-only-id');
    expect(JSON.parse(accepted.mock.calls[0][1].body).tags).toEqual([{ name: 'product', value: 'signal' }]);
  });
});
