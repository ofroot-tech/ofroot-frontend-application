"use client";

/**
 * SignInPage component renders a sign-in form for users to authenticate using available providers.
 * 
 * - Fetches authentication providers using `getProviders` from NextAuth on mount.
 * - Displays a credentials form if the "credentials" provider is available.
 * - Renders sign-in buttons for other providers (e.g., Google, GitHub).
 * - Handles form submission for credentials and triggers `signIn` with the selected provider.
 * - Uses Tailwind CSS for styling and layout.
 *
 * @returns {JSX.Element} The sign-in page UI with provider options.
 */
import { getProviders, signIn } from 'next-auth/react';
import { useEffect, useState } from 'react';
import type { ClientSafeProvider, LiteralUnion } from 'next-auth/react';
import type { BuiltInProviderType } from 'next-auth/providers/index';

export default function SignInPage() {
  const [providers, setProviders] = useState<Record<LiteralUnion<BuiltInProviderType, string>, ClientSafeProvider> | null>(null);

  useEffect(() => {
    (async () => {
      const res = await getProviders();
      setProviders(res);
    })();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-gradient-to-br from-gray-900 to-gray-700">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded shadow-xl">
        <h1 className="text-2xl font-bold text-center text-gray-900">Sign in to your account</h1>
        {providers === null && (
          <p className="text-center text-gray-500">Loading providers...</p>
        )}
        {providers && Object.keys(providers).length === 0 && (
          <p className="text-center text-red-500">No authentication providers found. Please check your NextAuth configuration.</p>
        )}
        {providers && Object.values(providers).map((provider: any) => (
          provider.id === 'credentials' ? (
            <form
              key={provider.name}
              className="space-y-4"
              onSubmit={async (e) => {
                e.preventDefault();
                const email = (e.currentTarget.elements.namedItem('email') as HTMLInputElement).value;
                const password = (e.currentTarget.elements.namedItem('password') as HTMLInputElement).value;
                await signIn('credentials', { email, password, callbackUrl: '/' });
              }}
            >
              <input name="email" type="email" placeholder="Email" required className="w-full px-3 py-2 border rounded" />
              <input name="password" type="password" placeholder="Password" required className="w-full px-3 py-2 border rounded" />
              <button type="submit" className="w-full py-2 font-semibold text-white bg-blue-600 rounded hover:bg-blue-700">Sign in</button>
            </form>
          ) : (
            <div key={provider.name} className="pt-4">
              <button
                className="w-full py-2 font-semibold text-white bg-gray-800 rounded hover:bg-gray-900"
                onClick={() => signIn(provider.id, { callbackUrl: '/' })}
              >
                Sign in with {provider.name}
              </button>
            </div>
          )
        ))}
        {/* Debug: Show providers object */}
        <pre className="mt-4 text-xs text-gray-400 bg-gray-100 p-2 rounded overflow-x-auto">{JSON.stringify(providers, null, 2)}</pre>
      </div>
    </div>
  );
}
