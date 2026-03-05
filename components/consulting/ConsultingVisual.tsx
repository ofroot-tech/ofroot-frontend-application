"use client";

import React from "react";

export default function ConsultingVisual() {
  return (
    <div className="w-48 h-48 mx-auto">
      {/* Static SVG fallback instead of Lottie animation for a lighter bundle */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/consulting-graphic.svg" alt="Illustration: person reviewing dashboard charts" className="w-48 h-auto" />
    </div>
  );
}
