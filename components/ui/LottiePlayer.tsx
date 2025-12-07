"use client";

import React, { useEffect, useState } from "react";
import Player from "lottie-react";

type LottiePlayerProps = {
  src: string; // URL under /public
  loop?: boolean;
  autoplay?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

export default function LottiePlayer({ src, loop = true, autoplay = true, className, style }: LottiePlayerProps) {
  const [animationData, setAnimationData] = useState<any | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await fetch(src);
        if (!res.ok) return;
        const json = await res.json();
        if (mounted) setAnimationData(json);
      } catch (e) {
        // ignore — fallback handled by parent
        console.warn("Failed to load lottie:", e);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [src]);

  if (!animationData) return null;

  return (
    <div className={className} style={style} aria-hidden={false}>
      <Player animationData={animationData} loop={loop} autoplay={autoplay} />
    </div>
  );
}
