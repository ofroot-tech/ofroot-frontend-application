import type { User } from '@/app/lib/api';

export function isPaidPlan(plan: string | null | undefined): boolean {
  const normalized = String(plan || '').trim().toLowerCase();
  return normalized === 'pro' || normalized === 'business';
}

export function hasCompetitiveAnalysisAccess(
  user: Pick<User, 'plan' | 'top_role'> | null | undefined
): boolean {
  const role = String(user?.top_role || '').trim().toLowerCase();
  return isPaidPlan(user?.plan) || role === 'owner' || role === 'admin';
}
