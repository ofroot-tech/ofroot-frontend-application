import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";

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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Navbar />
         {children}
       </body>
    </html>
  );
}
