"use client";

import React from "react";
import LottiePlayer from "@/components/ui/LottiePlayer";

export default function ConsultingVisual() {
  return (
    <div className="w-48 h-48 mx-auto">
      <LottiePlayer src="/animations/consulting.json" className="w-full h-full" />
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/consulting-graphic.svg" alt="Illustration: person reviewing dashboard charts" className="w-48 h-auto" />
      </noscript>
    </div>
  );
}
