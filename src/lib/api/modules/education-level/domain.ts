/**
 * Domain types + Zod validation schemas for EducationLevel
 * Used by both service layer (server) and UI components (client).
 */

import { z } from 'zod';
import type { EducationLevel } from '$generated/prisma/client';

// ── Zod Schemas ──────────────────────────────────────────

/** Schema for creating a new EducationLevel */
export const CreateEducationLevelSchema = z.object({
  id: z.string().optional(),
  levelName: z.string().trim().min(1, 'Nama jenjang wajib diisi').max(50, 'Nama jenjang maksimal 50 karakter'),
  description: z.string().trim().max(500, 'Deskripsi maksimal 500 karakter').optional().default(''),
});

/** Schema for updating an existing EducationLevel (all fields optional) */
export const UpdateEducationLevelSchema = CreateEducationLevelSchema.partial();

// ── Inferred TypeScript Types ─────────────────────────────

/** Zod-inferred input type for creation */
export type CreateEducationLevelInput = z.infer<typeof CreateEducationLevelSchema>;

/** Zod-inferred input type for update */
export type UpdateEducationLevelInput = z.infer<typeof UpdateEducationLevelSchema>;

/** Entity returned by service (Prisma model) */
export type EducationLevelEntity = EducationLevel;

// ── Validation Helpers ────────────────────────────────────

/** Validate create input. Returns { success, data, errors } */
export function validateCreateEducationLevel(input: unknown) {
  return CreateEducationLevelSchema.safeParse(input);
}

/** Validate update input. Returns { success, data, errors } */
export function validateUpdateEducationLevel(input: unknown) {
  return UpdateEducationLevelSchema.safeParse(input);
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
