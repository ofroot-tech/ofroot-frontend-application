// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

const isProd = process.env.NODE_ENV === 'production';

Sentry.init({
  dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN || undefined,
  environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV,

  // Keep performance sampling modest by default; override via env when needed
  tracesSampleRate: Number(process.env.SENTRY_TRACES) || 0.05,
  profilesSampleRate: Number(process.env.SENTRY_PROFILES) || 0,

  // Verbose logs only outside production unless explicitly enabled/disabled
  enableLogs: (!isProd && process.env.SENTRY_ENABLE_LOGS !== 'false') || process.env.SENTRY_ENABLE_LOGS === 'true',
  debug: (!isProd && process.env.SENTRY_DEBUG === 'true') || process.env.SENTRY_DEBUG === 'true',

  // Scrub sensitive headers defensively
  beforeSend(event) {
    if (event.request && event.request.headers) {
      const h = event.request.headers as Record<string, unknown>;
      delete (h as any).cookie;
      delete (h as any).authorization;
    }
    return event;
  },
});
