"use client";

import React from "react";
import { Player } from "lottie-react";

type LottiePlayerProps = {
  src: string;
  loop?: boolean;
  autoplay?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

export default function LottiePlayer({ src, loop = true, autoplay = true, className, style }: LottiePlayerProps) {
  return (
    <div className={className} style={style} aria-hidden={false}>
      <Player src={src} loop={loop} autoplay={autoplay} />
    </div>
  );
}
