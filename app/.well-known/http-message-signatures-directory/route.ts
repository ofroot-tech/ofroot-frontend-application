import { getSigningIdentity, signedDirectory } from '@/app/lib/agent-signing';
import { agentHttpError } from '@/app/lib/agent-http';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
  try { return await signedDirectory(request, await getSigningIdentity()); }
  catch (error) { return agentHttpError(error); }
}
export const HEAD = GET;
