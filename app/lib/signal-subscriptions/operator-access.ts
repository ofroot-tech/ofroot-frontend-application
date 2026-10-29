import { getAuthTokenFromRequest } from '@/app/lib/cookies';
import { getUserFromSessionToken } from '@/app/lib/supabase-store';

/** Signal uses the same server-resolved owner/admin allowlist as the owner
 * dashboard. A cookie's existence or a client role never grants access. */
export function canViewSignalOperations(email: string | null | undefined, settings: Record<string, string | undefined> = process.env): boolean {
  const normalized = String(email || '').trim().toLowerCase();
  if (!normalized) return false;
  const admins = (settings.ADMIN_EMAILS || '').split(',').map(value => value.trim().toLowerCase()).filter(Boolean);
  const owner = (settings.COMPANY_OWNER_EMAIL || '').trim().toLowerCase();
  return normalized === owner || admins.includes(normalized);
}

export async function signalOperatorAccess(): Promise<200 | 401 | 403> {
  try {
    const token = await getAuthTokenFromRequest();
    if (!token) return 401;
    const user = await getUserFromSessionToken(token);
    if (!user) return 401;
    return canViewSignalOperations(user.email) ? 200 : 403;
  } catch { return 401; }
}
