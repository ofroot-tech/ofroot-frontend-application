// app/auth/register/page.tsx

import Link from 'next/link';
import { cookies } from 'next/headers';
import RegisterForm from '@/components/auth/RegisterForm';
import {
  AUTOMATION_ONBOARDING_COOKIE,
  decodeAutomationOnboardingSession,
  sanitizeNextPath,
} from '@/app/lib/automation-onboarding';

export default async function RegisterPage({ searchParams }: { searchParams?: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const sp = (await searchParams) || {} as any;
  const nextParamRaw = typeof sp.next === 'string' ? sp.next : undefined;
  const emailParamRaw = typeof sp.email === 'string' ? sp.email.trim() : undefined;
  const nextPath = sanitizeNextPath(nextParamRaw);
  const store = await cookies();
  const onboardingRaw = store.get(AUTOMATION_ONBOARDING_COOKIE)?.value;
  const onboarding = decodeAutomationOnboardingSession(onboardingRaw);
  const prefillEmail =
    emailParamRaw && /^\S+@\S+\.\S+$/.test(emailParamRaw)
      ? emailParamRaw
      : onboarding?.business_email;

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-semibold mb-6">Create account</h1>
      <RegisterForm nextPath={nextPath} prefillEmail={prefillEmail} />
      <p className="mt-4 text-sm">
        Already have an account? <Link href={nextPath ? `/auth/login?next=${encodeURIComponent(nextPath)}` : '/auth/login'} className="underline">Sign in</Link>
      </p>
    </div>
  );
}
