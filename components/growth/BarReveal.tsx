'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

export default function BarReveal({ children, className }: { children: ReactNode; className: string }) {
  const row = useRef<HTMLDivElement>(null);
  const [entry, setEntry] = useState('initial');

  useEffect(() => {
    const element = row.current;
    if (!element || typeof IntersectionObserver === 'undefined') return;
    // Visible bars use their CSS page-entry animation. Defer below-fold bars
    // until the visitor reaches them, keeping the server-rendered links usable.
    if (element.getBoundingClientRect().top < window.innerHeight) return;
    setEntry(current => current === 'settled' ? current : 'waiting');
    const observer = new IntersectionObserver(([event]) => {
      if (!event.isIntersecting) return;
      setEntry(current => current === 'settled' ? current : 'entered');
      observer.disconnect();
    }, { threshold: .14 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return <div ref={row} className={className} data-entry={entry} onFocusCapture={event => {
    if (event.target instanceof HTMLElement && event.target.matches(':focus-visible')) setEntry('settled');
  }}>
    {children}
  </div>;
}
