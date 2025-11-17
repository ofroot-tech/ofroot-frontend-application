import * as Sentry from '@sentry/nextjs';
import { wakeRenderApiIfNeeded } from './app/lib/wakeRenderApi';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
    await wakeRenderApiIfNeeded();
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}

export const onRequestError = Sentry.captureRequestError;
