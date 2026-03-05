// app/onboarding/automations/page.tsx
'use client';

import { Metadata } from 'next';
import SteppedAutomationForm from '@/app/landing/components/SteppedAutomationForm';

export default function AutomationsOnboarding() {
  return (
    <div className="w-full bg-gradient-to-br from-slate-50 via-white to-slate-100 min-h-screen">
      <SteppedAutomationForm />
    </div>
  );
}
