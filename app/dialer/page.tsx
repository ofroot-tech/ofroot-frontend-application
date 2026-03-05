/**
 * # Dialer redirect
 *
 * The dialer now lives behind the authenticated dashboard. Visiting /dialer
 * sends you to /dashboard/dialer, which enforces login.
 */
import { redirect } from 'next/navigation';

export default function DialerRedirect() {
  redirect('/dashboard/dialer');
}
