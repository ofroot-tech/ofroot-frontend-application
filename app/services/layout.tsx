import type { ReactNode } from 'react';
import styles from '@/components/growth/PublicPage.module.css';

export default function ServicesLayout({ children }: { children: ReactNode }) {
  return <div className={`${styles.page} ${styles.serviceLayout}`}>{children}</div>;
}
