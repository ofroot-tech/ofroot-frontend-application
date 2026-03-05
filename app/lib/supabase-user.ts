// app/lib/supabase-user.ts
// Lightweight helper to resolve a Supabase user from an access token using the anon key.

import { createClient, type User as SupabaseUser } from '@supabase/supabase-js';

export type BasicSupabaseUser = {
  id: string;
  name: string;
  email: string;
  raw?: SupabaseUser;
};

export async function fetchSupabaseUserByToken(token?: string | null): Promise<BasicSupabaseUser | null> {
  if (!token) return null;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) return null;

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) return null;

  const u = data.user;
  return {
    id: u.id,
    name: u.user_metadata?.name ?? u.user_metadata?.full_name ?? '',
    email: u.email ?? '',
    raw: u,
  };
}
