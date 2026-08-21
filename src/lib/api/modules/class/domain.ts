/**
 * Domain types + Zod validation schemas for ClassLevel
 * Used by both service layer (server) and UI components (client).
 */

import { z } from 'zod';
import type { ClassLevel } from '$generated/prisma/client';

// ── Zod Schemas ──────────────────────────────────────────

/** Schema for creating a new ClassLevel */
export const CreateClassLevelSchema = z.object({
  className: z.string().trim().min(1, 'Nama kelas wajib diisi').max(50, 'Nama kelas maksimal 50 karakter'),
  educationLevelId: z.string().min(1, 'Jenjang wajib dipilih'),
  description: z.string().trim().max(500, 'Deskripsi maksimal 500 karakter').optional().default(''),
});

/** Schema for updating an existing ClassLevel (all fields optional) */
export const UpdateClassLevelSchema = CreateClassLevelSchema.partial();

// ── Inferred TypeScript Types ─────────────────────────────

/** Zod-inferred input type for creation */
export type CreateClassLevelInput = z.infer<typeof CreateClassLevelSchema>;

/** Zod-inferred input type for update */
export type UpdateClassLevelInput = z.infer<typeof UpdateClassLevelSchema>;

/** Entity returned by service (Prisma model) */
export type ClassLevelEntity = ClassLevel;

// ── Validation Helpers ────────────────────────────────────

/** Validate create input. Returns { success, data, errors } */
export function validateCreateClassLevel(input: unknown) {
  return CreateClassLevelSchema.safeParse(input);
}

/** Validate update input. Returns { success, data, errors } */
export function validateUpdateClassLevel(input: unknown) {
  return UpdateClassLevelSchema.safeParse(input);
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
