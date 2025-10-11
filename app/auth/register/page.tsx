// app/auth/register/page.tsx

import Link from 'next/link';
import RegisterForm from '@/components/auth/RegisterForm';
import { toast } from '@/components/Toaster';

export default function RegisterPage({ searchParams }: { searchParams?: { [key: string]: string | string[] | undefined } }) {
  const flash = typeof searchParams?.flash === 'string' ? searchParams?.flash : undefined;
  if (flash === 'account-required' && typeof window !== 'undefined') {
    queueMicrotask(() => toast({ type: 'info', title: 'Please register', message: 'Create an account to continue.' }));
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
