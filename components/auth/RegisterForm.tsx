"use client";

/**
 * RegisterForm — the handshake at first meeting.
 *
 * We gather the essentials, extend an invitation to the server,
 * and guide the reader to the next step with a clear note.
 */
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import api from "@/app/utils/api";
import { useRouter } from "next/navigation";
import { toast } from "@/components/Toaster";

interface RegisterInputs {
  name: string;
  email: string;
  password: string;
}

export default function RegisterForm() {
  const { register, handleSubmit } = useForm<RegisterInputs>();
  const [error, setError] = useState("");
  const [open, setOpen] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/auth/register-status', { cache: 'no-store' });
        const j = await res.json().catch(() => ({}));
        if (!cancelled) setOpen(!!j?.open);
      } catch {
        if (!cancelled) setOpen(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const onSubmit = async (data: RegisterInputs) => {
    if (!open) {
      toast({ type: 'info', title: 'Registration closed', message: 'Account creation is disabled.' });
      return;
    }
    try {
      await api.post('/auth/register', data);
      router.push('/auth/login?flash=registered');
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || err?.response?.data?.message || 'Registration failed';
      setError(msg);
      toast({ type: 'error', title: 'Registration failed', message: msg });
    }
  };

  if (open === false) {
    return <p className="text-sm text-gray-600">Registration is closed.</p>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <input {...register("name")} type="text" placeholder="Name" className="border p-2 rounded" required />
      <input {...register("email")} type="email" placeholder="Email" className="border p-2 rounded" required />
      <input {...register("password")} type="password" placeholder="Password" className="border p-2 rounded" required />
      {error && <p className="text-red-500">{error}</p>}
      <button type="submit" className="bg-black text-white p-2 rounded">Create account</button>
    </form>
  );
}
