const RENDER_HOST_PATTERN = /onrender\.com/i;

function normalizeBaseUrl(url: string) {
  return url.replace(/\/$/, '');
}

function shouldAttemptWake(baseUrl?: string | null) {
  if (!baseUrl) return false;
  const isProd = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
  if (!isProd) return false;

  if (!RENDER_HOST_PATTERN.test(baseUrl)) return false;

  const declaredPlan = (process.env.RENDER_API_PLAN || '').toLowerCase();
  const isFreePlan = declaredPlan === 'free' || (!declaredPlan && process.env.RENDER_WAKE_FORCE === 'true');
  return isFreePlan;
}

export async function wakeRenderApiIfNeeded() {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!shouldAttemptWake(baseUrl)) {
    return;
  }

  const wakeTarget = `${normalizeBaseUrl(baseUrl!)}/public/blog-posts?limit=1`;
  const timeoutMs = Number(process.env.RENDER_WAKE_TIMEOUT_MS || 5000);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(wakeTarget, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
      cache: 'no-store',
    });
    if (!res.ok) {
      console.warn('[wakeRenderApi] Non-200 response', res.status);
    }
  } catch (err) {
    console.warn('[wakeRenderApi] Failed to wake Render API', err);
  } finally {
    clearTimeout(timeout);
  }
}
