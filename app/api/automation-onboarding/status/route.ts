import { NextRequest } from 'next/server';
import { getAuthTokenFromRequest } from '@/app/lib/cookies';
import { fail, ok } from '@/app/lib/response';
import { getAutomationBuildProgressForToken } from '@/app/lib/automation-progress';

export async function GET(_req: NextRequest) {
  const token = await getAuthTokenFromRequest();
  if (!token) return fail('Unauthorized', 401);

  const progress = await getAutomationBuildProgressForToken(token);
  return ok(progress);
}
