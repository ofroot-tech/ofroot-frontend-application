'use client';
/**
 * SafeEmbed (client component, Knuth-style)
 *
 * Problem
 * - SSR + dangerouslySetInnerHTML can cause hydration mismatches when the HTML
 *   mutates (e.g., third-party scripts change the DOM before React hydrates).
 *
 * Approach
 * - Render an empty <div> on the server and populate innerHTML on the client
 *   in a useEffect. This avoids SSR/CSR content diffs.
 * - Re-execute <script> tags by cloning them into new script nodes (browser
 *   ignores inline <script> when set via innerHTML for security reasons).
 */
import { useEffect, useRef } from 'react';

export default function SafeEmbed({ html }: { html: string }) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Set HTML
    el.innerHTML = html;

    // Re-execute scripts by replacing them with fresh nodes
    const scripts = Array.from(el.querySelectorAll('script'));
    for (const oldScript of scripts) {
      const s = document.createElement('script');
      // Copy attributes
      for (const { name, value } of Array.from(oldScript.attributes)) {
        s.setAttribute(name, value);
      }
      s.text = oldScript.textContent || '';
      oldScript.replaceWith(s);
    }
  }, [html]);

  return <div ref={ref} suppressHydrationWarning aria-live="polite" />;
}
