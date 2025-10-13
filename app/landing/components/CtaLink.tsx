'use client';
/**
 * CtaLink (client component, Knuth-style)
 * - Renders a Next Link and records a CTA click event before navigation.
 * - Keeps analytics in the client bundle only.
 */
import Link from 'next/link';

export default function CtaLink({ href, label, slug, variant, className, style }: { href: string; label: string; slug: string; variant: string; className?: string; style?: React.CSSProperties; }) {
  return (
    <Link
      href={href}
      className={className}
      style={style}
      onClick={async () => {
        try {
          const { trackCtaClick } = await import('@/app/lib/ab');
          trackCtaClick({ slug, variant, label });
        } catch {}
      }}
    >
      {label}
    </Link>
  );
}
