// app/api/_helpers/sentry.ts
// Minimal helper to capture route errors with Sentry when loaded.

let sentry: any = null;
try {
  sentry = require('@sentry/nextjs');
} catch {}

export function captureRouteException(err: unknown, context?: Record<string, unknown>) {
  if (!sentry || !sentry.captureException) return;
  if (context) sentry.setContext('route', context);
  sentry.captureException(err);
}
