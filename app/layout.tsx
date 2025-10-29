import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import { AuthProvider } from "@/context/AuthContext";
import Toaster from "@/components/Toaster";
import RevealObserver from "@/app/components/RevealObserver";
import Footer from "@/app/components/Footer";
import ExitIntentPrompt from "@/components/ExitIntentPrompt";
import ChatWidget from "@/components/ChatWidget";
import { SITE } from './config/site';
import AlphaTextReveal from "@/components/AlphaTextReveal";
import SectionSnapperAll from "@/components/SectionSnapperAll";
import SmoothAnchorScroll from "@/components/SmoothAnchorScroll";
import SectionAutoChevron from "@/components/SectionAutoChevron";
import LoadingOnClickManager from "@/components/LoadingOnClickManager";

// Default site-wide metadata for SEO/SMO
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://ofroot.technology'),
  title: {
    default: `${SITE.name} · Engineering, Automation, and AI`,
    template: `%s · ${SITE.name}`,
  },
  description: 'On‑demand engineering, automation, and AI — by subscription. Ship faster with focused sprints and transparent pricing.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    url: SITE.url,
    siteName: SITE.name,
    title: `${SITE.name} · Engineering, Automation, and AI`,
    description: 'On‑demand engineering, automation, and AI — by subscription.',
    images: [
      {
        url: `${SITE.url}/og.jpg`,
        width: 1200,
        height: 630,
        alt: `${SITE.name} — Build faster with AI & automation`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@ofroot_tech',
    creator: '@ofroot_tech',
    title: `${SITE.name} · Engineering, Automation, and AI`,
    description: 'On‑demand engineering, automation, and AI — by subscription.',
    images: [`${SITE.url}/og.jpg`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
  },
}

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#FFFFFF" />
        <meta name="robots" content="index,follow" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          <Toaster />
          <ExitIntentPrompt />
      <AlphaTextReveal />
          {/* Render Navbar at the top-level (outside overflow/transform wrappers)
              so it stays fixed relative to the viewport and above effects */}
          <Navbar />
          <div className="relative flex min-h-screen flex-col overflow-hidden bg-white">
            <div className="floating-circles pointer-events-none" aria-hidden="true">
              <span className="c1" />
              <span className="c2" />
              <span className="c3" />
              <span className="c4" />
              <span className="c5" />
              <span className="c6" />
              <span className="c7" />
              <span className="c8" />
            </div>
            <RevealObserver />
            {/* Auto-enable snap/fade behavior wherever a page opts into .snap-page */}
            <SectionSnapperAll />
            {/* Smooth in-container anchor scrolling across the site */}
            <SmoothAnchorScroll />
            {/* Auto-inject glowing chevrons for next-section navigation */}
            <SectionAutoChevron />
            {/* Lightweight global loading state for CTA buttons */}
            <LoadingOnClickManager />
            <main className="relative z-10 flex-1">{children}</main>
            <div className="relative z-10">
              <Footer />
            </div>
          </div>
          <ChatWidget />
          {/* Organization + WebSite JSON-LD (SSR) */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'Organization',
                name: SITE.name,
                url: SITE.url,
                logo: SITE.logo,
                sameAs: SITE.socials,
              }),
            }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'WebSite',
                name: SITE.name,
                url: SITE.url,
                potentialAction: {
                  '@type': 'SearchAction',
                  target: `${SITE.url}/search?q={search_term_string}`,
                  'query-input': 'required name=search_term_string',
                },
              }),
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
