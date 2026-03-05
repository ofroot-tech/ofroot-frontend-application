// =============================================================
// Script: seed-admin.ts
// Purpose: Create or promote a default admin user in Supabase Auth
//          and ensure a matching User row with isAdmin = true.
// Usage:   DEFAULT_ADMIN_EMAIL=admin@example.com \
//          DEFAULT_ADMIN_PASSWORD=strongpass \
//          DEFAULT_ADMIN_NAME="Admin" \
//          pnpm tsx scripts/seed-admin.ts
// Requires: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY set in env.
// Notes:   - Does not log secrets. Reads from env only.
//          - Idempotent: will reuse existing auth user by email.
// =============================================================

import "dotenv/config";
import { createClient, type User as SupabaseAuthUser, type SupabaseClient } from "@supabase/supabase-js";

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name} in environment`);
  return value;
}

async function main() {
  const supabaseUrl = required("NEXT_PUBLIC_SUPABASE_URL");
  const serviceKey = required("SUPABASE_SERVICE_ROLE_KEY");
  const email = required("DEFAULT_ADMIN_EMAIL");
  const password = required("DEFAULT_ADMIN_PASSWORD");
  const name = process.env.DEFAULT_ADMIN_NAME ?? "Admin";

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Step 1: find or create auth user
  const authUser = await getOrCreateAuthUser(admin, email, password, name);

  // Step 2: upsert User profile with admin flag
  const now = new Date().toISOString();
  const { error: upsertError } = await admin.from("User").upsert({
    id: authUser.id,
    name,
    email,
    isAdmin: true,
    createdAt: now,
    updatedAt: now,
  });
  if (upsertError) throw upsertError;

  // eslint-disable-next-line no-console
  console.log(`Admin ready: ${email}`);
}

async function getOrCreateAuthUser(
  admin: SupabaseClient,
  email: string,
  password: string,
  name: string
): Promise<SupabaseAuthUser> {
  // Try create first
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name },
  });

  if (!error && data?.user) return data.user;

  // If user already exists, fetch via listUsers and match email
  const alreadyExists = error?.message?.toLowerCase().includes("already") || error?.status === 422;
  if (!alreadyExists) throw error ?? new Error("Failed to create auth user");

  const { data: listData, error: listErr } = await admin.auth.admin.listUsers();
  if (listErr) throw listErr;

  const match = listData.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  if (!match) throw new Error("User already exists but could not be found via listUsers");

  return match as SupabaseAuthUser;
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
