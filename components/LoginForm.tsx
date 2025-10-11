"use client";

/**
 * LoginForm — the front door.
 *
 * The task is simple: collect credentials, ask politely,
 * and report the outcome with candor.
 */
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/components/Toaster";

interface LoginFormInputs {
  email: string;
  password: string;
}

export default function LoginForm() {
  const { register, handleSubmit } = useForm<LoginFormInputs>();
  const { login } = useAuth();
  const [error, setError] = useState("");

  const onSubmit = async (data: LoginFormInputs) => {
    try {
      await login(data.email, data.password);
      toast({ type: 'success', title: 'Signed in', message: 'Welcome back!' });
    } catch (err: any) {
      const message = err?.message || "Login failed";
      setError(message);
      toast({ type: 'error', title: 'Login failed', message });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <input {...register("email")} type="email" placeholder="Email" className="border p-2 rounded" required />
      <input {...register("password")} type="password" placeholder="Password" className="border p-2 rounded" required />
      {error && <p className="text-red-500">{error}</p>}
      <button type="submit" className="bg-blue-500 text-white p-2 rounded">Login</button>
    </form>
  );
}
