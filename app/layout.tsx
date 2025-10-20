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

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://ofroot.technology'),
  title: "ofroot",
  description: "OfRoot — Innovative Technology Solutions",
  icons: {
    icon: '/ofroot-logo.png',
    apple: '/ofroot-logo.png',
  },
  openGraph: {
    title: 'ofroot',
    description: 'OfRoot — Innovative Technology Solutions',
    images: ['/ofroot-logo.png'],
    authors: ['OfRoot'],
    siteName: 'ofroot.technology',
  },
  other: {
    sameAs: ['https://www.linkedin.com/company/106671711/']
  }
};

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
            <main className="relative z-10 flex-1">{children}</main>
            <div className="relative z-10">
              <Footer />
            </div>
          </div>
          <ChatWidget />
        </AuthProvider>
      </body>
    </html>
  );
}
