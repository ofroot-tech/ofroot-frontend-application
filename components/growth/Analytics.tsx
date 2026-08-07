'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { track } from '@/app/lib/ab';

export function PageView({ kind, name }: { kind: 'service' | 'solution' | 'feature' | 'demo' | 'pricing' | 'ai_process'; name: string }) {
  useEffect(() => {
    track({ category: 'view', action: `${kind}_page_viewed`, label: name, meta: { path: window.location.pathname } });
  }, [kind, name]);
  return null;
}

export function TrackedPageView({ event, label }: { event: string; label: string }) {
  useEffect(() => {
    track({ category: 'view', action: event, label, meta: { path: window.location.pathname } });
  }, [event, label]);
  return null;
}

export function TrackedLink({
  href,
  children,
  className = '',
  event = 'audit_cta_clicked',
  source,
  external = false,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  event?: string;
  source: string;
  external?: boolean;
}) {
  const onClick = () => track({ category: 'cta', action: event, label: source, meta: { path: window.location.pathname } });
  if (external) {
    return <a href={href} target="_blank" rel="noopener noreferrer" className={className} onClick={onClick}>{children}</a>;
  }
  return <Link href={href} className={className} onClick={onClick}>{children}</Link>;
}

export function TrackedSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLElement>(null);
  const sent = useRef(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !sent.current) {
        sent.current = true;
        track({ category: 'view', action: 'engagement_section_viewed', label: 'engagement_models', meta: { path: window.location.pathname } });
        observer.disconnect();
      }
    }, { threshold: 0.35 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return <section ref={ref} className={className}>{children}</section>;
}
