"use client";

/**
 * LoginForm — the front door.
 *
 * Narrative: a clear, low-friction sign-in that respects accessibility,
 * communicates errors candidly, and aligns with our brand tokens.
 */
import { useForm } from "react-hook-form";
import { useMemo, useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/components/Toaster";

interface LoginFormInputs {
  email: string;
  password: string;
}

export default function LoginForm() {
  const { register, handleSubmit, formState } = useForm<LoginFormInputs>({ mode: 'onBlur' });
  const { errors, isSubmitting } = formState;
  const { login } = useAuth();
  const [error, setError] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [useMagic, setUseMagic] = useState(false);
  const [regOpen, setRegOpen] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/auth/register-status', { cache: 'no-store' });
        const j = await res.json().catch(() => ({}));
        const open = !!(j?.data?.open ?? j?.open);
        if (!cancelled) setRegOpen(open);
      } catch {
        if (!cancelled) setRegOpen(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const onSubmit = async (data: LoginFormInputs) => {
    try {
      setError("");
      if (useMagic) {
        // Placeholder call — returns 501. Keep it honest in UX.
        const res = await fetch('/api/auth/magic-link', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: data.email }) });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.error?.message || 'Passwordless not available');
        }
        return;
      }
      await login(data.email, data.password);
      toast({ type: 'success', title: 'Signed in', message: 'Welcome back!' });
    } catch (err: any) {
      const message = err?.message || "Login failed";
      setError(message);
      toast({ type: 'error', title: 'Login failed', message });
    }
  };

  // Small helper to disable submit while submitting
  const disabled = useMemo(() => isSubmitting, [isSubmitting]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      {/* Mode toggle */}
      <div className="flex items-center gap-3 text-xs">
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" checked={useMagic} onChange={(e) => setUseMagic(e.currentTarget.checked)} />
          Use passwordless sign-in
        </label>
        <span className="text-gray-500">(Sends a magic link to your email)</span>
      </div>

      <div>
        <label htmlFor="email" className="sr-only">Email</label>
        <input
          id="email"
          {...register("email", { required: "Please enter your email" })}
          type="email"
          placeholder="Email"
          className="w-full rounded-md border px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'email-error' : undefined}
          required
        />
        {errors.email && <p id="email-error" className="mt-1 text-xs text-rose-600">{errors.email.message as string}</p>}
      </div>

      {!useMagic && (
        <div>
          <label htmlFor="password" className="sr-only">Password</label>
          <div className="relative">
            <input
              id="password"
              {...register("password", { required: "Please enter your password" })}
              type={showPw ? 'text' : 'password'}
              placeholder="Password"
              className="w-full rounded-md border px-3 py-2 pr-24 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'password-error' : undefined}
              required
            />
            <button
              type="button"
              onClick={() => setShowPw(v => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-xs underline"
              aria-pressed={showPw}
              aria-label={showPw ? 'Hide password' : 'Show password'}
            >
              {showPw ? 'Hide' : 'Show'}
            </button>
          </div>
          {errors.password && <p id="password-error" className="mt-1 text-xs text-rose-600">{errors.password.message as string}</p>}
        </div>
      )}

      {error && <p className="text-rose-600 text-sm" role="alert" aria-live="polite">{error}</p>}

      <button
        type="submit"
        disabled={disabled}
        className={`inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-semibold ${disabled ? 'bg-gray-300 text-gray-500' : 'bg-[#20b2aa] text-white hover:bg-[#1a8f85]'} focus:outline-none focus:ring-2 focus:ring-[#20b2aa]`}
      >
        {disabled ? (useMagic ? 'Sending link…' : 'Signing in…') : (useMagic ? 'Send magic link' : 'Sign in')}
      </button>

      <div className="flex items-center justify-between text-xs text-gray-500">
        {regOpen ? <a href="/auth/register" className="underline">Create account</a> : <span />}
        <a href="#" className="underline" aria-disabled>Forgot password?</a>
      </div>
    </form>
  );
}
