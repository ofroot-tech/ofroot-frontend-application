// ============================================================
// File: app/lib/sanitize.ts
// Purpose: Provide HTML sanitization for server-side rendering
// Reason: Prevent XSS attacks when rendering user-generated content
// ============================================================

import { JSDOM } from 'jsdom';
import DOMPurify from 'dompurify';

/**
 * Sanitize HTML on the server using jsdom + DOMPurify
 * This is safe for server-side rendering in Next.js
 */
export function sanitizeHtml(dirty: string): string {
  const window = new JSDOM('').window;
  const purify = DOMPurify(window as any);
  return purify.sanitize(dirty);
}
