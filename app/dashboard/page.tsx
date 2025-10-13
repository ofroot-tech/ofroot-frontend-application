// app/dashboard/page.tsx
// Redirect the root dashboard to the streamlined Overview.

import { redirect } from 'next/navigation';

export default function DashboardIndex() {
  redirect('/dashboard/overview');
}
