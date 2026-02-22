import { ok } from '@/app/lib/response';
import {
  getIntroSessionCookieOptions,
  INTRO_LETTERS_SESSION_COOKIE,
} from '@/app/lib/introLettersAuth';

export async function POST() {
  const res = ok({ loggedOut: true });
  res.cookies.set(INTRO_LETTERS_SESSION_COOKIE, '', getIntroSessionCookieOptions(0));
  return res;
}
