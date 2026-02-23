import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getAuthTokenFromRequest } from '@/app/lib/cookies';
import {
  AUTOMATION_ONBOARDING_COOKIE,
  decodeAutomationOnboardingSession,
} from '@/app/lib/automation-onboarding';
import AutomationServicesForm from '@/app/onboarding/automations/services/AutomationServicesForm';
import { getUserFromSessionToken } from '@/app/lib/supabase-store';

const NEXT_PARAM = encodeURIComponent('/onboarding/automations/services');

export default async function AutomationOnboardingServicesPage() {
  const token = await getAuthTokenFromRequest();
  if (!token) {
    redirect(`/auth/login?next=${NEXT_PARAM}`);
  }

  const me = await getUserFromSessionToken(token).catch(() => null);
  if (!me) {
    redirect(`/auth/login?next=${NEXT_PARAM}`);
  }

  const store = await cookies();
  const sessionRaw = store.get(AUTOMATION_ONBOARDING_COOKIE)?.value;
  const onboarding = decodeAutomationOnboardingSession(sessionRaw);

  if (!onboarding) {
    redirect('/onboarding/automations?reason=expired');
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold text-slate-900">Automation services setup</h1>
      <p className="mt-2 text-slate-600">
        Configure lead-to-CSV capture and optional Instagram/Facebook DM auto-response rules.
      </p>

      <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
        <p><span className="font-medium">Contact:</span> {onboarding.full_name} ({onboarding.business_email})</p>
        <p><span className="font-medium">Company:</span> {onboarding.company_name}</p>
        <p><span className="font-medium">Primary channel:</span> {onboarding.primary_channel}</p>
      </div>

      <AutomationServicesForm
        businessEmail={onboarding.business_email}
        fullName={onboarding.full_name}
        companyName={onboarding.company_name}
      />
    </div>
  );
}
