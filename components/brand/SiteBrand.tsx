import Link from 'next/link';
import styles from './SiteBrand.module.css';

export default function SiteBrand({ onNavigate, compact = false, light = false }: { onNavigate?: () => void; compact?: boolean; light?: boolean }) {
  return (
    <Link href="/" onClick={onNavigate} aria-label="OfRoot home" className={`${styles.brand} ${compact ? styles.compact : ''} ${light ? styles.light : ''}`}>
      <span className={styles.mark} aria-hidden="true">OFT</span>
      <span className={styles.name} aria-hidden="true">
        <span className={styles.wordmark}>OFROOT</span>
        <span className={styles.descriptor}>TECHNOLOGY</span>
      </span>
    </Link>
  );
}
