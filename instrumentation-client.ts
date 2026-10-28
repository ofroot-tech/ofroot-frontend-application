// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";
import { isPrivateSignalBrowser, isPrivateSignalRoute } from './app/lib/signal-subscriptions/privacy';

Sentry.init({
  dsn: "https://358f15868f92698430cc8f38fdd24562@o4510176028983296.ingest.us.sentry.io/4510176030228480",

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampler: () => isPrivateSignalBrowser() ? 0 : 1,
  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
  beforeSend: event => isPrivateSignalBrowser() || isPrivateSignalRoute(event.request?.url) ? null : event,
  beforeSendTransaction: event => isPrivateSignalBrowser() || isPrivateSignalRoute(event.request?.url) ? null : event,
  beforeBreadcrumb: breadcrumb => isPrivateSignalBrowser() || [breadcrumb.data?.url, breadcrumb.data?.from, breadcrumb.data?.to].some(value => typeof value === 'string' && isPrivateSignalRoute(value)) ? null : breadcrumb,
  beforeSendLog: log => isPrivateSignalBrowser() ? null : log,
});

export const onRouterTransitionStart = (...args: Parameters<typeof Sentry.captureRouterTransitionStart>) => {
  if (!isPrivateSignalRoute(String(args[0]))) Sentry.captureRouterTransitionStart(...args);
};
