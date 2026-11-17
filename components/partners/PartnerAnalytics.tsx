'use client';

import Link from 'next/link';
import { useEffect, type AnchorHTMLAttributes } from 'react';

type PartnerEvent = 'partner_page_view' | 'partner_cta_click' | 'partner_form_start' | 'partner_form_submit';

/** Local, allowlisted hooks only. TODO(founder): connect after consent-aware
 * analytics approval. No provider dispatch, query strings or form values. */
export function partnerEvent(event: PartnerEvent, placement?: string) {
  window.dispatchEvent(new CustomEvent('ofroot:partner-analytics', {
    detail: { event, page: window.location.pathname === '/' ? 'home' : 'staffing_partnership', ...(placement ? { placement } : {}) },
  }));
}

export function PartnerPageView() {
  useEffect(() => { partnerEvent('partner_page_view'); }, []);
  return null;
}

export function PartnerTrackedLink({ href, placement, onClick, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; placement: string }) {
  return <Link href={href} {...props} onClick={event => { partnerEvent('partner_cta_click', placement); onClick?.(event); }} />;
}
