"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * RevealObserver
 * Globally observes elements with `.reveal-in` and adds `.in-view` when they
 * enter the viewport to trigger CSS fade-in/slide-up animations.
 * Respects prefers-reduced-motion.
 */
export default function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) return; // do not animate for users who prefer reduced motion

    const els = document.querySelectorAll<HTMLElement>('.reveal-in');
    if (!els.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).classList.add('in-view');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -10% 0px' }
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
