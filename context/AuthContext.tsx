"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/app/utils/api";

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  plan?: string | null;
  billing_cycle?: 'monthly' | 'yearly' | null;
  has_blog_addon?: boolean;
};

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    api
      .get('/auth/me')
      .then((res) => {
        if (res.data?.ok) setUser(res.data.data);
        else setUser(null);
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', new URLSearchParams({ email, password }), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    if (!res.data?.ok) {
      throw new Error(res.data?.error?.message || 'Login failed');
    }
    const me = await api.get('/auth/me');
    if (me.data?.ok) setUser(me.data.data);
    router.push('/dashboard');
  };

  const logout = async () => {
    const res = await api.post('/auth/logout');
    if (res.data?.ok) setUser(null);
    router.push('/auth/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
