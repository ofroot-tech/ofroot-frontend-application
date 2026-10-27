import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { ReactNode } from 'react';
import HeroShimmer from './HeroShimmer';
import { TrackedLink } from './Analytics';
import styles from './PublicPage.module.css';

type Action = { href: string; label: ReactNode; source: string };
type Props = {
  eyebrow: ReactNode;
  title: ReactNode;
  description: ReactNode;
  headingId?: string;
  primary?: Action;
  secondary?: Action;
  breadcrumbs?: { label: string; href?: string }[];
  children?: ReactNode;
};

/** Server-rendered content over the same bounded, accessible motion as the homepage. */
export default function PublicHero({ eyebrow, title, description, headingId = 'page-heading', primary, secondary, breadcrumbs, children }: Props) {
  return <HeroShimmer headingId={headingId} className={styles.hero}>
    <div className={styles.heroGrid} aria-hidden="true"><span /><span /><span /></div>
    <div className={`${styles.shell} ${styles.heroInner}`}>
      {breadcrumbs && <nav className={styles.breadcrumb} aria-label="Breadcrumb">{breadcrumbs.map((item, index) => <span key={`${item.label}:${index}`}>{index > 0 && <span aria-hidden="true"> / </span>}{item.href ? <Link href={item.href}>{item.label}</Link> : <span aria-current="page">{item.label}</span>}</span>)}</nav>}
      <p className={styles.eyebrow}>{eyebrow}</p>
      <h1 id={headingId} className={styles.title}>{title}</h1>
      <p className={styles.description}>{description}</p>
      {(primary || secondary) && <div className={styles.actions}>
        {primary && <TrackedLink href={primary.href} source={primary.source} className={styles.primary}>{primary.label}<ArrowRight aria-hidden="true" /></TrackedLink>}
        {secondary && <TrackedLink href={secondary.href} source={secondary.source} event="secondary_cta_clicked" className={styles.secondary}>{secondary.label}<ArrowRight aria-hidden="true" /></TrackedLink>}
      </div>}
      {children}
    </div>
  </HeroShimmer>;
}
