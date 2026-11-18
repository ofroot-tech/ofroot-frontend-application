import styles from './PixelSignal.module.css';

/** Still artwork for in-page branding; the shared live signal has one owner. */
export default function PixelSignal({ className = '' }: { className?: string }) {
  return <figure className={`${styles.figure} ${className}`}>
    <figcaption className={styles.caption}>OfRoot / Signal</figcaption>
    <picture className={styles.artwork}>
      <img src="/brand/ofroot-pixel-signal-still.svg" alt="" width={960} height={320} />
    </picture>
    <div className={styles.footer}><span>Connected by design.</span></div>
  </figure>;
}
