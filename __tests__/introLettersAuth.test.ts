import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import {
  signIntroSession,
  verifyIntroSession,
} from '../app/lib/introLettersAuth';

const ORIGINAL_SECRET = process.env.INTRO_LETTERS_GATE_SECRET;

describe('introLettersAuth', () => {
  beforeEach(() => {
    process.env.INTRO_LETTERS_GATE_SECRET = 'test-intro-secret';
  });

  afterEach(() => {
    if (ORIGINAL_SECRET === undefined) {
      delete process.env.INTRO_LETTERS_GATE_SECRET;
    } else {
      process.env.INTRO_LETTERS_GATE_SECRET = ORIGINAL_SECRET;
    }
  });

  it('signs and verifies a valid intro session token', () => {
    const signed = signIntroSession({
      username: 'dimitri.mcdaniel@gmail.com',
      nowMs: 1_000,
      ttlSeconds: 120,
    });

    expect(signed).not.toBeNull();
    const session = verifyIntroSession(signed?.token, { nowMs: 50_000 });
    expect(session).toEqual({
      username: 'dimitri.mcdaniel@gmail.com',
      expiresAt: 121,
    });
  });

  it('rejects tampered tokens', () => {
    const signed = signIntroSession({
      username: 'dimitri.mcdaniel@gmail.com',
      nowMs: 1_000,
      ttlSeconds: 120,
    });
    expect(signed).not.toBeNull();
    const tampered = `${signed?.token}x`;
    expect(verifyIntroSession(tampered, { nowMs: 2_000 })).toBeNull();
  });

  it('rejects expired tokens', () => {
    const signed = signIntroSession({
      username: 'dimitri.mcdaniel@gmail.com',
      nowMs: 1_000,
      ttlSeconds: 5,
    });
    expect(signed).not.toBeNull();
    expect(verifyIntroSession(signed?.token, { nowMs: 7_000 })).toBeNull();
  });
});
