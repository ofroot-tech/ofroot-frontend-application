import type { ReactNode } from 'react';
import styles from './ApprovedHome.module.css';

type Props = { children: ReactNode; headingId?: string; className?: string; as?: 'section' | 'footer'; label?: string };

/** Shared public surface. SignalProvider owns the site's only motion clock. */
export default function HeroShimmer({ children, headingId = 'home-hero-heading', className = '', as: Container = 'section', label }: Props) {
  return <Container className={`${styles.hero} ${className}`} aria-labelledby={label ? undefined : headingId} aria-label={label}>
    {children}
  </Container>;
}
