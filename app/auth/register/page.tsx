// app/auth/register/page.tsx

import Link from 'next/link';
import RegisterForm from '@/components/auth/RegisterForm';
import { toast } from '@/components/Toaster';
import { API_BASE_URL } from '@/app/lib/config';
import { redirect } from 'next/navigation';

export default async function RegisterPage({ searchParams }: { searchParams?: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const sp = (await searchParams) || {} as any;
  const flash = typeof sp.flash === 'string' ? sp.flash : undefined;

  // Query backend to see if registration is open
  const res = await fetch(`${API_BASE_URL}/auth/register-status`, { cache: 'no-store' }).catch(() => null as any);
  const open = !!(await res?.json()?.then((j: any) => j?.open).catch(() => false));
  if (!open) {
    redirect('/auth/login');
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-semibold mb-6">Create account</h1>
      <RegisterForm />
      <p className="mt-4 text-sm">
        Already have an account? <Link href="/auth/login" className="underline">Sign in</Link>
      </p>
    </div>
  );
}
