import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { NextRequest } from 'next/server';
import { POST as authPost } from '../app/api/intro-letters/auth/route';
import { POST as sendPost } from '../app/api/intro-letters/send/route';
import { signIntroSession, INTRO_LETTERS_SESSION_COOKIE } from '../app/lib/introLettersAuth';

const ORIGINAL_ENV = {
  gateUser: process.env.INTRO_LETTERS_GATE_USER,
  gatePassword: process.env.INTRO_LETTERS_GATE_PASSWORD,
  gateSecret: process.env.INTRO_LETTERS_GATE_SECRET,
  resendKey: process.env.RESEND_API_KEY,
  resendFrom: process.env.RESEND_FROM,
  resendFromName: process.env.RESEND_FROM_NAME,
};

const originalFetch = global.fetch;

function makeRequest(url: string, body: unknown, headers?: HeadersInit) {
  return new NextRequest(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(headers || {}),
    },
    body: JSON.stringify(body),
  });
}

function buildRecipients(count: number) {
  return Array.from({ length: count }).map((_, idx) => ({
    leaderName: `Leader ${idx}`,
    companyName: `Company ${idx}`,
    email: `leader${idx}@example.com`,
  }));
}

describe('intro letters routes', () => {
  beforeEach(() => {
    process.env.INTRO_LETTERS_GATE_USER = 'dimitri.mcdaniel@gmail.com';
    process.env.INTRO_LETTERS_GATE_PASSWORD = '1734';
    process.env.INTRO_LETTERS_GATE_SECRET = 'test-intro-secret';
    process.env.RESEND_API_KEY = 'resend-test-key';
    process.env.RESEND_FROM = 'no-reply@ofroot.technology';
    process.env.RESEND_FROM_NAME = 'OfRoot';
    jest.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    if (ORIGINAL_ENV.gateUser === undefined) delete process.env.INTRO_LETTERS_GATE_USER;
    else process.env.INTRO_LETTERS_GATE_USER = ORIGINAL_ENV.gateUser;
    if (ORIGINAL_ENV.gatePassword === undefined) delete process.env.INTRO_LETTERS_GATE_PASSWORD;
    else process.env.INTRO_LETTERS_GATE_PASSWORD = ORIGINAL_ENV.gatePassword;
    if (ORIGINAL_ENV.gateSecret === undefined) delete process.env.INTRO_LETTERS_GATE_SECRET;
    else process.env.INTRO_LETTERS_GATE_SECRET = ORIGINAL_ENV.gateSecret;
    if (ORIGINAL_ENV.resendKey === undefined) delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY = ORIGINAL_ENV.resendKey;
    if (ORIGINAL_ENV.resendFrom === undefined) delete process.env.RESEND_FROM;
    else process.env.RESEND_FROM = ORIGINAL_ENV.resendFrom;
    if (ORIGINAL_ENV.resendFromName === undefined) delete process.env.RESEND_FROM_NAME;
    else process.env.RESEND_FROM_NAME = ORIGINAL_ENV.resendFromName;
  });

  it('auth success sets the session cookie', async () => {
    const req = makeRequest('http://localhost/api/intro-letters/auth', {
      username: 'dimitri.mcdaniel@gmail.com',
      password: '1734',
    }, { 'x-forwarded-for': '10.0.0.1' });

    const res = await authPost(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(res.headers.get('set-cookie') || '').toContain(`${INTRO_LETTERS_SESSION_COOKIE}=`);
  });

  it('auth failure returns 401', async () => {
    const req = makeRequest('http://localhost/api/intro-letters/auth', {
      username: 'dimitri.mcdaniel@gmail.com',
      password: 'wrong-password',
    }, { 'x-forwarded-for': '10.0.0.2' });

    const res = await authPost(req);
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json.ok).toBe(false);
  });

  it('send rejects without intro session authentication', async () => {
    const req = makeRequest('http://localhost/api/intro-letters/send', {
      service: 'workflow_automation',
      senderName: 'Dimitri',
      subjectTemplate: 'Hello {{leaderName}}',
      bodyTemplate: 'Hi {{leaderName}}',
      recipients: buildRecipients(1),
    });
    const res = await sendPost(req);
    expect(res.status).toBe(401);
  });

  it('send enforces max 25 recipients', async () => {
    const signed = signIntroSession({ username: 'dimitri.mcdaniel@gmail.com' });
    expect(signed).not.toBeNull();

    const req = makeRequest(
      'http://localhost/api/intro-letters/send',
      {
        service: 'workflow_automation',
        senderName: 'Dimitri',
        subjectTemplate: 'Hello {{leaderName}}',
        bodyTemplate: 'Hi {{leaderName}}',
        recipients: buildRecipients(26),
      },
      {
        cookie: `${INTRO_LETTERS_SESSION_COOKIE}=${signed?.token}`,
      }
    );

    const res = await sendPost(req);
    expect(res.status).toBe(400);
  });

  it('send returns mixed per-recipient results on partial provider failure', async () => {
    const signed = signIntroSession({ username: 'dimitri.mcdaniel@gmail.com' });
    expect(signed).not.toBeNull();

    global.fetch = jest
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ id: 'email_1' }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ message: 'Provider unavailable' }), {
          status: 500,
          headers: { 'content-type': 'application/json' },
        })
      ) as unknown as typeof fetch;

    const req = makeRequest(
      'http://localhost/api/intro-letters/send',
      {
        service: 'landing_pages',
        senderName: 'Dimitri',
        subjectTemplate: 'Hello {{leaderName}}',
        bodyTemplate: 'Hi {{leaderName}}, this is {{senderName}}',
        recipients: buildRecipients(2),
      },
      {
        cookie: `${INTRO_LETTERS_SESSION_COOKIE}=${signed?.token}`,
      }
    );

    const res = await sendPost(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(json.data.summary).toEqual({ total: 2, sent: 1, failed: 1 });
    expect(json.data.results[0].ok).toBe(true);
    expect(json.data.results[1].ok).toBe(false);
  });
});
