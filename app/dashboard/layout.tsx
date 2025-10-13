// app/dashboard/layout.tsx
//
// Dashboard Layout: A Modest Frame for Super-User Operations
//
// This file defines the layout for the dashboard section of the application.
// The layout consists of a navigation bar followed by the main content area.
//
// Navigation is presented first, allowing users to select between different
// dashboard sections. The main content (children) is rendered below the navigation.
//
// The navigation includes links to:
//   - Overview
//   - Subscribers
//   - Tenants
//   - Users
//   - Billing
//
// The layout is centered and constrained to a maximum width for readability.

import type { ReactNode } from 'react';
import DashboardShell from './_components/Shell';
import { cookies } from 'next/headers';
import { TOKEN_COOKIE_NAME, LEGACY_COOKIE_NAME } from '@/app/lib/cookies';

// The DashboardLayout component receives its content as children.
// It arranges the navigation and content within a styled container.
export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const store = await cookies();
  const authed = Boolean(store.get(TOKEN_COOKIE_NAME)?.value || store.get(LEGACY_COOKIE_NAME)?.value);
  return <DashboardShell authed={authed}>{children}</DashboardShell>;
}
