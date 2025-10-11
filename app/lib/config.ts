// app/lib/config.ts
// Centralized config for environment variables used in the Next.js app.

export function getApiBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!url) {
    // Provide a helpful runtime error during development builds.
    throw new Error(
      'Missing NEXT_PUBLIC_API_BASE_URL. Set it in .env.local (dev) or Vercel project settings (prod).'
    );
  }
  // Normalize: remove trailing slash to avoid double slashes when joining paths
  return url.replace(/\/$/, '');
}

export const API_BASE_URL = getApiBaseUrl();
