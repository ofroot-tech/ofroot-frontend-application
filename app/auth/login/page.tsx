// app/auth/login/page.tsx
// Basic login page using App Router. Stores token in an httpOnly cookie via route handler.

import LoginForm from '@/components/LoginForm';
import Link from 'next/link';
import FlashToast from '@/components/FlashToast';

export default function LoginPage({ searchParams }: { searchParams?: { [key: string]: string | string[] | undefined } }) {
  const flash = typeof searchParams?.flash === 'string' ? searchParams?.flash : undefined;
  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <FlashToast flash={flash} />
      <h1 className="text-2xl font-semibold mb-6">Sign in</h1>
      <LoginForm />
      <p className="mt-4 text-sm">
        No account? <Link href="/auth/register" className="underline">Create one</Link>
      </p>
    </div>
  );
}
