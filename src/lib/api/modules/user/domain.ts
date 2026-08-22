/**
 * Domain types + Zod validation schemas for User
 * Used by both service layer (server) and UI components (client).
 */

import { z } from 'zod';
import type { User } from '$generated/prisma/client';

// ── Zod Schemas ──────────────────────────────────────────

/** Schema for creating a new User */
export const CreateUserSchema = z.object({
  id: z.string().optional(),
  email: z.string().trim().min(1, 'Email wajib diisi').email('Format email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter').max(128, 'Password maksimal 128 karakter').optional(),
  fullName: z.string().trim().min(1, 'Nama lengkap wajib diisi').max(100, 'Nama maksimal 100 karakter'),
  phone: z.string().trim().max(20, 'Nomor telepon maksimal 20 karakter').optional().default(''),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'TENTOR', 'STUDENT', 'PARENT']).optional(),
  position: z.string().trim().max(100).optional(),
  education: z.string().trim().max(100).optional(),
  experienceYears: z.number().min(0).optional(),
  school: z.string().trim().max(100).optional(),
  address: z.string().trim().max(500).optional(),
  occupation: z.string().trim().max(100).optional(),
  parentId: z.string().optional(),
  isActive: z.boolean().default(true),
});

/** Schema for updating an existing User (all fields optional) */
export const UpdateUserSchema = CreateUserSchema.partial();

// ── Inferred TypeScript Types ─────────────────────────────

/** Zod-inferred input type for creation */
export type CreateUserInput = z.infer<typeof CreateUserSchema>;

/** Zod-inferred input type for update */
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;

/** Entity returned by service (Prisma model) */
export type UserEntity = User;

// ── Validation Helpers ────────────────────────────────────

/** Validate create input. Returns { success, data, errors } */
export function validateCreateUser(input: unknown) {
  return CreateUserSchema.safeParse(input);
}

/** Validate update input. Returns { success, data, errors } */
export function validateUpdateUser(input: unknown) {
  return UpdateUserSchema.safeParse(input);
}

/** Get field-level error map from Zod error */
export function getFieldErrors(zodError: z.ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of zodError.issues) {
    const field = issue.path.join('.');
    if (!fieldErrors[field]) {
      fieldErrors[field] = issue.message;
    }
  }
  return fieldErrors;
}
