'use client';

import { useEffect, useState, type ReactNode } from 'react';
import styles from './ReadingTheme.module.css';

const storageKey = 'ofroot-reading-theme-v1';

/** A reader preference changes paint only: search, saved stories, and playback
 * stay mounted, and unavailable browser storage never blocks reading. */
export default function ReadingTheme({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved === 'light' || saved === 'dark') setTheme(saved);
    } catch { /* The default light theme remains usable without storage. */ }
  }, []);

  function changeTheme() {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    try { localStorage.setItem(storageKey, next); } catch { /* Session-only preference. */ }
  }

  return <div className={styles.frame} data-reading-theme={theme}>
    <div className={styles.toolbar}>
      <nav aria-label="Reading sections"><a href="/blog">Blog</a><a href="/news">Signal</a></nav>
      <button type="button" onClick={changeTheme} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} reading mode`}>
        {theme === 'light' ? 'Dark mode' : 'Light mode'}
      </button>
    </div>
    {children}
  </div>;
}
