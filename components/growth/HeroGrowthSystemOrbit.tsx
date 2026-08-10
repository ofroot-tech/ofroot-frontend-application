'use client';

import { useEffect, useRef, useState } from 'react';

const orbitLabels = [
  { label: 'Discover', position: 'hero-growth-orbit__item--discover' },
  { label: 'Convert', position: 'hero-growth-orbit__item--convert' },
  { label: 'Operate', position: 'hero-growth-orbit__item--operate' },
];

export default function HeroGrowthSystemOrbit() {
  const orbitRef = useRef<HTMLDivElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const orbit = orbitRef.current;
    if (!orbit || !('IntersectionObserver' in window)) return;

    let isInView = false;
    const syncAnimation = () => {
      setIsAnimating(isInView && document.visibilityState === 'visible');
    };
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry) return;
      isInView = entry.isIntersecting;
      syncAnimation();
    }, { threshold: 0.2 });

    observer.observe(orbit);
    document.addEventListener('visibilitychange', syncAnimation);

    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', syncAnimation);
    };
  }, []);

  return (
    <div
      ref={orbitRef}
      className="hero-growth-orbit relative mx-auto aspect-square max-w-[360px] rounded-full border border-white/10"
      data-animate={isAnimating ? 'true' : 'false'}
      role="img"
      aria-label="One connected growth system: Discover, Convert, Operate"
    >
      <div className="absolute inset-[14%] rounded-full border border-[#37FFE0]/30" aria-hidden="true" />
      <div className="absolute inset-[29%] flex items-center justify-center rounded-full bg-white/5 text-center font-bold text-white shadow-[0_0_80px_rgba(55,255,224,.12)]" aria-hidden="true">
        One connected<br />growth system
      </div>
      <div className="hero-growth-orbit__track absolute inset-0" aria-hidden="true">
        {orbitLabels.map(({ label, position }) => (
          <div key={label} className={`hero-growth-orbit__item ${position}`}>
            <span className="hero-growth-orbit__label inline-flex rounded-full border border-white/15 bg-[#0c1b31] px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(3,11,24,.28)]">
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
