import {withSentryConfig} from "@sentry/nextjs";
import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';

function buildCsp() {
  // Moderately strict CSP compatible with Next.js and Sentry
  const directives = [
    "default-src 'self'",
    "base-uri 'self'",
    "frame-ancestors 'none'",
    // Allow Next.js inline styles; tighten later by moving to hashed styles
    "style-src 'self' 'unsafe-inline' https:",
    // Allow Next dev/runtime eval; on prod Next no eval is used but keep https fallback
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:",
    // XHR/fetch to API, Sentry, and HTTPS resources
    "connect-src 'self' https:",
    // Images
    "img-src 'self' data: blob: https:",
    "font-src 'self' https: data:",
    "object-src 'none'",
    "form-action 'self'",
  ];
  return directives.join('; ');
}

const nextConfig: NextConfig = {
  /* config options here */
  // Silence workspace root inference warning by declaring the project root explicitly
  turbopack: {
    root: __dirname,
  },
  async redirects() {
    return [
      // Retired service URLs. Keep one permanent, indexable URL per intent.
      { source: '/services/automation', destination: '/services/workflow-automation', permanent: true },
      { source: '/services/integration', destination: '/services/hubspot-meta-integrations', permanent: true },
      { source: '/services/ai-development-integrations', destination: '/agent-integrations', permanent: true },
      { source: '/services/llm-agent-integrations', destination: '/agent-integrations', permanent: true },
      { source: '/services/marketing-automation', destination: '/services/hubspot-meta-integrations', permanent: true },
      { source: '/services/development-automation', destination: '/services/workflow-automation', permanent: true },
      { source: '/services/website-app-development', destination: '/services', permanent: true },
      { source: '/services/stability', destination: '/services/automation-systems', permanent: true },
      { source: '/services/growth-systems', destination: '/', permanent: true },
      { source: '/helpr', destination: '/platform?edition=helpr', permanent: true },
      { source: '/ontask', destination: '/platform?edition=ontask', permanent: true },

      // Marketing-friendly URLs should redirect instead of exposing rewritten duplicates.
      { source: '/mktg', destination: '/services/hubspot-meta-integrations', permanent: true },
      { source: '/development', destination: '/services/workflow-automation', permanent: true },
      { source: '/dev', destination: '/services/workflow-automation', permanent: true },
      { source: '/audit', destination: '/services/ai-audit', permanent: true },
      { source: '/addons', destination: '/services/add-ons', permanent: true },
      { source: '/webdev', destination: '/services', permanent: true },
      { source: '/sites', destination: '/services', permanent: true },
      { source: '/ai', destination: '/agent-integrations', permanent: true },
      { source: '/ai-dev', destination: '/agent-integrations', permanent: true },
      { source: '/plumbers', destination: '/landing/plumbers', permanent: true },
      { source: '/hvac', destination: '/landing/hvac', permanent: true },
      { source: '/roofers', destination: '/landing/roofers', permanent: true },
      { source: '/cto', destination: '/landing/cto', permanent: true },
    ];
  },
  async rewrites() {
    // Support /subscribe/:product -> /subscribe?product=:product
    const subscribe = [
      { source: '/subscribe/:product', destination: '/subscribe?product=:product' },
    ];

    return subscribe;
  },
  async headers() {
    // Allow disabling CSP in case of issues via env toggle
    const enableCsp = process.env.NEXT_ENABLE_CSP === 'true';

    const headers = [
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
    ];

    if (isProd) {
      headers.push({ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' });
    }

    if (enableCsp) {
      headers.push({ key: 'Content-Security-Policy', value: buildCsp() });
    }

    return [
      {
        source: '/:path*',
        headers,
      },
    ];
  },
  webpack: (config, { webpack }) => {
    // Low-disk release verification can disable the disposable webpack cache
    // without changing the production bundle or Vercel's normal build path.
    if (process.env.NEXT_DISABLE_BUILD_CACHE === 'true') {
      config.cache = false;
    }

    // Surface a build-time warning if the critical env var is missing in Vercel/CI
    const required = ['NEXT_PUBLIC_API_BASE_URL'];
    for (const key of required) {
      if (!process.env[key]) {
        console.warn(`Warning: Missing ${key}. Set it in .env.local (dev) or Vercel Project Settings (prod).`);
      }
    }

    // Inject SENTRY_RELEASE into the build when provided (for source maps)
    if (process.env.SENTRY_RELEASE) {
      config.plugins = config.plugins || [];
      config.plugins.push(new webpack.DefinePlugin({
        'process.env.SENTRY_RELEASE': JSON.stringify(process.env.SENTRY_RELEASE),
      }));
    }

    return config;
  },
};

export default withSentryConfig(nextConfig, {
  // Sentry source maps upload (requires envs in Vercel or CI):
  // SENTRY_AUTH_TOKEN, SENTRY_ORG=ofroot, SENTRY_PROJECT=ofroot-frontend
  org: "ofroot",
  project: "ofroot-frontend",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors.
  automaticVercelMonitors: true,
});

// Sentry will auto-load sentry.(client|server).config.ts if present.
