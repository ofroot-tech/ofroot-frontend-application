'use client';
import Link from 'next/link';
import styles from '@/components/editorial/Reading.module.css';

export default function BlogError({reset}:{reset:()=>void}) {
  return <main className={styles.page}><div className={styles.article}><h1>This article couldn’t load.</h1><p className={styles.intro}>Please try again in a moment. We won’t replace a missing article with generated content.</p><button type="button" className={styles.link} onClick={reset}>Try again</button><p><Link href="/blog" className={styles.link}>Return to the blog</Link></p></div></main>;
}
