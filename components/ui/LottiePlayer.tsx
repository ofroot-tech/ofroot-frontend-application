"use client";

import React from "react";

type LottiePlayerProps = {
  src: string; // URL under /public (previously a JSON lottie file)
  loop?: boolean;
  autoplay?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

// Lightweight fallback: render nothing. Keep a component API so
// other files can import `LottiePlayer` without pulling a lottie runtime.
export default function LottiePlayer(_: LottiePlayerProps) {
  return null;
}
