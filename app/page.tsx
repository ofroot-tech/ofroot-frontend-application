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
import PickIntegration from "@/components/home/PickIntegration";
import HowItWorks from "@/components/home/HowItWorks";
import PricingAnchor from "@/components/home/PricingAnchor";
import SocialProof from "@/components/home/SocialProof";
import Faq from "@/components/home/Faq";

export const metadata: Metadata = {
  title: 'OfRoot - HubSpot + Meta integrations that book meetings',
  description: 'We design, build, and run HubSpot and Meta API workflows that capture leads, route follow-up, and convert demand into booked meetings.',
  keywords: ['HubSpot integrations', 'Meta API integration', 'lead routing', 'meeting booking workflows', 'marketing automation'],
  openGraph: {
    title: 'OfRoot - HubSpot + Meta integrations that book meetings',
    description: 'Lead capture, sync, and booking workflows built by senior engineers.',
    url: 'https://ofroot.technology',
    type: 'website',
    images: [
      {
        url: 'https://ofroot.technology/og.jpg',
        width: 1200,
        height: 630,
        alt: 'OfRoot - HubSpot + Meta integrations that book meetings',
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
      <PickIntegration />
      <HowItWorks />
      <PricingAnchor />
      <SocialProof />
      <Faq />
    </main>
  );
}
