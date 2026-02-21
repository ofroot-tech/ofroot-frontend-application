import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import IntroLettersWorkspace from './IntroLettersWorkspace';
import {
  INTRO_LETTERS_SESSION_COOKIE,
  verifyIntroSession,
} from '@/app/lib/introLettersAuth';

export const metadata: Metadata = {
  title: 'Intro Letters | OfRoot',
  description: 'Password-gated intro outreach workspace.',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default async function IntroLettersPage() {
  const store = await cookies();
  const session = verifyIntroSession(
    store.get(INTRO_LETTERS_SESSION_COOKIE)?.value
  );

  return (
    <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-28 sm:px-6 sm:pt-32">
      <IntroLettersWorkspace
        initialAuthenticated={Boolean(session)}
        initialUsername={session?.username || null}
        initialExpiresAt={
          session ? new Date(session.expiresAt * 1000).toISOString() : null
        }
      />
    </main>
  );
}
