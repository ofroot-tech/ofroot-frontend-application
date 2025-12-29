/**
 * A/B helpers (literate/Knuth-style)
 *
 * Goals
 *  - Provide tiny utilities to read the active variant for a slug and record
 *    lightweight analytics events without coupling to a specific vendor.
 *  - Prefer graceful no-ops when analytics is unavailable (e.g., local dev).
 *
 * Integration strategy
 *  - We use Vercel Analytics if present. If not, we fallback to console.log so
 *    developers can still see event flow locally.
 *  - Events carry a minimal taxonomy: category, action, label, value, meta.
 */

'use client';

export type AbEvent = {
  category: 'ab' | 'cta' | 'view' | string;
  action: string;
  label?: string;
  value?: number;
  // meta can hold arbitrary key/value info (slug, variant, path, etc.)
  meta?: Record<string, any>;
};

/** Read active variant cookie on the client. */
export function getActiveVariant(slug: string): string | undefined {
  const name = `ofroot_variant_${slug}`;
  const match = document.cookie.split('; ').find((c) => c.startsWith(name + '='));
  return match ? decodeURIComponent(match.split('=')[1]) : undefined;
}

/** Generic event dispatcher. Uses Vercel Analytics if available. */
export function track(event: AbEvent) {
  try {
    const anyWindow = window as any;
    if (typeof anyWindow.va === 'function') {
      // Vercel Analytics custom events — may return a promise; swallow errors
      const res = anyWindow.va(event.action, { category: event.category, label: event.label, value: event.value, ...event.meta });
      // Normalize to promise and silence network failures (e.g., adblock)
      if (res && typeof res.then === 'function') {
        (res as Promise<unknown>).catch(() => {});
      }
      return;
    }
  } catch (_) {
    // ignored — we will log below as a fallback
  }
  // Fallback to console for local insight
   
  console.log('[ab.track]', event);
}

/** Track an exposure (variant shown). Call once per view. */
export function trackVariantExposure(opts: { slug: string; variant: string }) {
  track({ category: 'ab', action: 'exposure', label: opts.slug, meta: { variant: opts.variant, path: location.pathname } });
}

/** Track a CTA click. Attach to buttons/links. */
export function trackCtaClick(opts: { slug: string; variant?: string; id?: string; label?: string }) {
  track({ category: 'cta', action: 'click', label: opts.label || opts.id || 'cta', meta: { slug: opts.slug, variant: opts.variant, path: location.pathname } });
}
