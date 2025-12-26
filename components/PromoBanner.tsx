"use client";

import { useEffect, useState } from 'react';

type PromoBannerProps = { spaced?: boolean; anchorPrice?: string; endStr?: string };
export default function PromoBanner({ spaced = false, anchorPrice = '$49', endStr }: PromoBannerProps) {
  const [hidden, setHidden] = useState(() => {
    try {
      return localStorage.getItem('promo_subscribe_dismissed_v1') === '1';
    } catch {
      return true;
    }
  });
  const [nearBottom, setNearBottom] = useState(false);

  useEffect(() => {
    function onScroll() {
      try {
        const threshold = 600; // px from bottom when we consider near-bottom
        const scrollBottom = window.innerHeight + window.scrollY;
        const docHeight = document.documentElement.scrollHeight;
        setNearBottom(scrollBottom >= docHeight - threshold);
      } catch {}
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  if (hidden || nearBottom) return null;
  let endText = endStr;
  if (!endText) {
    const end = new Date();
    end.setDate(end.getDate() + 5); // 5-day rolling window
    endText = end.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  }
  const topMargin = spaced ? 'mt-16 md:mt-20' : 'mt-14 md:mt-16';
  return (
    <div className={`promo-banner w-full bg-black text-white ${topMargin}`} role="region" aria-label="Promotional offer banner">
      <div className="mx-auto max-w-6xl px-4 md:px-6 py-2 text-sm flex items-center justify-between gap-3">
        <div>
          <strong>Trial offer:</strong> Normally {anchorPrice}/month — start for $1 today. Ends {endText}.
        </div>
        <button
          className="rounded border border-white/30 px-2 py-0.5 text-xs hover:bg-white hover:text-black"
          onClick={() => {
            try { localStorage.setItem('promo_subscribe_dismissed_v1', '1'); } catch {}
            setHidden(true);
          }}
        >Dismiss</button>
      </div>
    </div>
  );
}
