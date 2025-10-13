// types/auth.ts
// Zod schemas and types for auth-related payloads and responses.

import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const authResponseSchema = z.object({
  token: z.string().min(1),
  data: z.object({
    id: z.number(),
    name: z.string(),
    email: z.string().email(),
    email_verified_at: z.string().nullable().optional(),
    tenant_id: z.number().nullable().optional(),
    created_at: z.string().optional(),
    updated_at: z.string().optional(),
  }),
});

export type AuthResponse = z.infer<typeof authResponseSchema>;
