/**
 * Home (modular)
 *
 * Purpose:
 *  - Replace the long single-file homepage with small, reusable sections.
 *  - Each section lives in `components/home/*` so Copilot or designers can iterate quickly.
 *
 * Notes:
 *  - This file is a server component by default (no `"use client"`).
 *  - Convert sections to client components only when they need state or effects.
 */

import { Metadata } from 'next';
import Hero from "@/components/home/Hero";
import Why from "@/components/home/Why";
import Features from "@/components/home/Features";
import HowItWorks from "@/components/home/HowItWorks";
import PricingAnchor from "@/components/home/PricingAnchor";
import SocialProof from "@/components/home/SocialProof";
import Faq from "@/components/home/Faq";

export const metadata: Metadata = {
  title: 'OfRoot — Operator-led AI systems that ship revenue in 30 days',
  description: 'We design, build, and run production AI workflows for operators who need revenue this quarter. Clear scope, senior ownership, and weekly shipping.',
  keywords: ['AI systems', 'automation', 'production AI', 'operators', 'revenue'],
  openGraph: {
    title: 'OfRoot — Operator-led AI systems that ship revenue in 30 days',
    description: 'Production AI workflows, built and run by senior engineers. Scope a 30-day build.',
    url: 'https://ofroot.technology',
    type: 'website',
    images: [
      {
        url: 'https://ofroot.technology/og.jpg',
        width: 1200,
        height: 630,
        alt: 'OfRoot — Operator-led AI systems that ship revenue in 30 days',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@ofroot_tech',
    creator: '@ofroot_tech',
  },
};

export default function HomePage() {
  return (
    <main className="flex flex-col w-full bg-white">
      <Hero />
      <Why />
      <Features />
      <HowItWorks />
      <PricingAnchor />
      <SocialProof />
      <Faq />
    </main>
  );
}
