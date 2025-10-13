// sentry.client.config.ts
// Sentry (browser) — careful and concise.

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  // Browser DSN is public by design. Use NEXT_PUBLIC_SENTRY_DSN (set in Vercel).
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || undefined,
  environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV,
  tracesSampleRate: Number(process.env.NEXT_PUBLIC_SENTRY_TRACES) || 0.05,
  replaysOnErrorSampleRate: Number(process.env.NEXT_PUBLIC_SENTRY_REPLAY_ERROR) || 0.1,
  replaysSessionSampleRate: Number(process.env.NEXT_PUBLIC_SENTRY_REPLAY_SESSION) || 0.0,
  ignoreErrors: [
    // Browser noise we can live without
    'ResizeObserver loop limit exceeded',
    'AbortError: The user aborted a request',
  ],
  beforeSend(event) {
    // Scrub sensitive data defensively
    if (event.request) {
      if (event.request.headers) {
        delete (event.request.headers as any)['cookie'];
        delete (event.request.headers as any)['authorization'];
      }
    }
    return event;
  },
});
