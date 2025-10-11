'use client';
/**
 * Exposure (client component, Knuth-style)
 * - Fires a single variant exposure event on mount.
 * - Uses dynamic import to avoid loading analytics code on the server.
 */
import { useEffect } from 'react';

export default function Exposure({ slug, variant }: { slug: string; variant: string }) {
  useEffect(() => {
    let mounted = true;
    import('@/app/lib/ab')
      .then(({ trackVariantExposure }) => {
        if (mounted) trackVariantExposure({ slug, variant });
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, [slug, variant]);
  return null;
}
