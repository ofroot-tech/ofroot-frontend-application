"use client";

import { useEffect, useState } from 'react';

export default function BottomPromoBanner({ anchorPrice = '$49', endStr }: { anchorPrice?: string; endStr?: string }) {
  const [hidden, setHidden] = useState(true);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const key = 'promo_subscribe_dismissed_v1';
      const dismissed = localStorage.getItem(key) === '1';
      if (!dismissed) setHidden(false);
    } catch {}
  }, []);

  useEffect(() => {
    function onScroll() {
      try {
        const threshold = 600; // show bottom banner when user is within 600px from bottom
        const scrollBottom = window.innerHeight + window.scrollY;
        const docHeight = document.documentElement.scrollHeight;
        setVisible(scrollBottom >= docHeight - threshold);
      } catch {}
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (hidden || !visible) return null;
  let endText = endStr;
  if (!endText) {
    const end = new Date();
    end.setDate(end.getDate() + 5);
    endText = end.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  }
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 w-full bg-black/90 text-white">
      <div className="mx-auto max-w-6xl px-4 md:px-6 py-2 text-sm flex items-center justify-between gap-3">
        <div>
          <strong>Try it for $1</strong> — 14-day trial. Normally {anchorPrice}/month. Ends {endText}. Cancel anytime.
        </div>
        <div className="flex items-center gap-2">
          <a href="#subscribe-form" className="rounded bg-white text-black px-3 py-1 text-xs font-medium">Start trial</a>
          <button
            className="rounded border border-white/30 px-2 py-0.5 text-xs hover:bg-white hover:text-black"
            onClick={() => {
              try { localStorage.setItem('promo_subscribe_dismissed_v1', '1'); } catch {}
              setVisible(false);
            }}
          >Dismiss</button>
        </div>
      </div>
    </div>
  );
}
