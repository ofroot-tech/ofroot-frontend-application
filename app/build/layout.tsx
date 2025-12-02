// app/build/layout.tsx
import type { Metadata } from 'next';

/**
 * Build Page Layout
 * 
 * Provides SEO metadata for the app building landing page.
 * This page targets founders and product teams looking for
 * MVP development services.
 */

export const metadata: Metadata = {
  title: 'How We Build Your MVP | Idea to Launch in Weeks | OfRoot',
  description:
    'A clear, outcome-driven process to turn your idea into a working MVP. Discovery, design, build, and launch with weekly demos and transparent progress.',
  keywords: [
    'MVP development',
    'app development',
    'startup development',
    'product development',
    'Next.js development',
    'Laravel development',
    'AI integration',
    'software development agency',
  ],
  openGraph: {
    title: 'How We Go From Idea to MVP | OfRoot',
    description:
      'Partner with OfRoot to ship your MVP fast. Clear process, weekly demos, modern stack.',
    type: 'website',
    url: 'https://ofroot.tech/build',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'How We Go From Idea to MVP | OfRoot',
    description:
      'Partner with OfRoot to ship your MVP fast. Clear process, weekly demos, modern stack.',
  },
};

export default function BuildLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
