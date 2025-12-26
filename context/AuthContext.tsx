"use client";

/**
 * AuthContext — literate walkthrough
 *
 * We keep the narrative tight: bootstrap from Supabase on mount, stay in sync
 * via onAuthStateChange, and route login through our API so we also set the
 * server-side auth cookie for `/api/auth/me` parity. After receiving tokens
 * from the API we hydrate the browser Supabase client with `setSession`, so
 * both client hooks and server routes share the same auth state.
 */
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";

export type AuthUser = {
  id: string; // Supabase UUID
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

const toAuthUser = (raw: any): AuthUser => ({
  id: raw?.id,
  name: raw?.user_metadata?.name || raw?.user_metadata?.full_name || '',
  email: raw?.email || '',
  plan: raw?.user_metadata?.plan ?? null,
  billing_cycle: raw?.user_metadata?.billing_cycle ?? null,
  has_blog_addon: Boolean(raw?.user_metadata?.has_blog_addon ?? false),
});

type ApiLoginSuccess = {
  user?: any;
  access_token?: string;
  refresh_token?: string;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let active = true;
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (!active) return;
        if (session?.user) setUser(toAuthUser(session.user));
      })
      .finally(() => active && setLoading(false));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(toAuthUser(session.user));
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const payload: ApiLoginSuccess | { error?: { message?: string } } = await res.json().catch(() => ({} as any));
      if (!res.ok) {
        const message = (payload as any)?.error?.message || 'Login failed';
        throw new Error(message);
      }

      const { access_token, refresh_token, user: apiUser } = (payload as ApiLoginSuccess) || {};
      if (access_token && refresh_token) {
        const { data, error } = await supabase.auth.setSession({ access_token, refresh_token });
        if (error) throw new Error(error.message || 'Unable to persist session');
        const sessionUser = data?.user ?? data?.session?.user ?? apiUser;
        if (sessionUser) setUser(toAuthUser(sessionUser));
      } else if (apiUser) {
        setUser(toAuthUser(apiUser));
      }

      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' }).catch(() => undefined);
      await supabase.auth.signOut();
      setUser(null);
      router.push('/auth/login');
    } finally {
      setLoading(false);
    }
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
