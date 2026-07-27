import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import { AuthProvider } from "@/context/AuthContext";
import Toaster from "@/components/Toaster";
import RevealObserver from "@/app/components/RevealObserver";
import Footer from "@/app/components/Footer";
import ExitIntentPrompt from "@/components/ExitIntentPrompt";
// import ChatWidget from "@/components/ChatWidget"; // Temporarily disabled
import { SITE } from './config/site';
import AlphaTextReveal from "@/components/AlphaTextReveal";
import SectionSnapperAll from "@/components/SectionSnapperAll";
import SmoothAnchorScroll from "@/components/SmoothAnchorScroll";
import LoadingOnClickManager from "@/components/LoadingOnClickManager";
import { Analytics } from "@vercel/analytics/react";

// Default site-wide metadata for SEO/SMO
export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} · AI Growth Systems`,
    template: `%s · ${SITE.name}`,
  },
  description: 'AI-powered growth and operations systems that help companies get discovered, convert demand, and operate faster.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    url: SITE.url,
    siteName: SITE.name,
    title: `${SITE.name} · AI Growth Systems`,
    description: 'Turn visibility, automation, and company knowledge into growth.',
    images: [
      {
        url: `${SITE.url}/og.jpg`,
        width: 1200,
        height: 630,
        alt: `${SITE.name} — AI growth systems`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@ofroot_tech',
    creator: '@ofroot_tech',
    title: `${SITE.name} · AI Growth Systems`,
    description: 'Turn visibility, automation, and company knowledge into growth.',
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
        <a href="#main-content" className="sr-only z-[100000] rounded bg-white px-4 py-3 font-semibold text-slate-950 focus:not-sr-only focus:fixed focus:left-4 focus:top-4">Skip to main content</a>
        <AuthProvider>
          <Toaster />
          <ExitIntentPrompt />
      <AlphaTextReveal />
          {/* Render Navbar at the top-level (outside overflow/transform wrappers)
              so it stays fixed relative to the viewport and above effects */}
          <Navbar />
          <div className="relative flex min-h-screen flex-col overflow-hidden bg-white">
            <RevealObserver />
            {/* Auto-enable snap/fade behavior wherever a page opts into .snap-page */}
            <SectionSnapperAll />
            {/* Smooth in-container anchor scrolling across the site */}
            <SmoothAnchorScroll />
            {/* Lightweight global loading state for CTA buttons */}
            <LoadingOnClickManager />
            <div className="relative z-10 flex-1">{children}</div>
            <div className="relative z-10">
              <Footer />
            </div>
          </div>
          {/* <ChatWidget /> */}{/* Chat temporarily disabled */}
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
              }),
            }}
          />
          <Analytics />
        </AuthProvider>
      </body>
    </html>
  );
}
