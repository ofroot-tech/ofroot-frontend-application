"use client";

import { useEffect } from 'react';
import { track } from '@/app/lib/ab';

export default function HomeViewPing() {
  useEffect(() => {
    try {
      track({
        category: 'view',
        action: 'home_page_view',
        label: 'home',
        meta: { path: window.location.pathname },
      });
    } catch {}
  }, []);

  return null;
}
