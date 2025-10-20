"use client";

import { useEffect } from 'react';
import { track } from '@/app/lib/ab';

export default function ClientViewPing() {
  useEffect(() => {
    try { track({ category: 'view', action: 'subscribe_page', meta: { path: location.pathname } }); } catch {}
  }, []);
  return null;
}
