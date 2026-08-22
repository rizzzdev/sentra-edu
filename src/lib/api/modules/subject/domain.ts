/**
 * Domain types + Zod validation schemas for Subject
 * Used by both service layer (server) and UI components (client).
 */

import { z } from 'zod';
import type { Subject } from '$generated/prisma/client';

// ── Zod Schemas ──────────────────────────────────────────

/** Schema for creating a new Subject */
export const CreateSubjectSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, 'Nama mata pelajaran wajib diisi').max(100, 'Nama maksimal 100 karakter'),
  description: z.string().trim().max(500, 'Deskripsi maksimal 500 karakter').optional().default(''),
});

/** Schema for updating an existing Subject (all fields optional) */
export const UpdateSubjectSchema = CreateSubjectSchema.partial();

// ── Inferred TypeScript Types ─────────────────────────────

/** Zod-inferred input type for creation */
export type CreateSubjectInput = z.infer<typeof CreateSubjectSchema>;

/** Zod-inferred input type for update */
export type UpdateSubjectInput = z.infer<typeof UpdateSubjectSchema>;

/** Entity returned by service (Prisma model) */
export type SubjectEntity = Subject;

// ── Validation Helpers ────────────────────────────────────

/** Validate create input. Returns { success, data, errors } */
export function validateCreateSubject(input: unknown) {
  return CreateSubjectSchema.safeParse(input);
}

/** Validate update input. Returns { success, data, errors } */
export function validateUpdateSubject(input: unknown) {
  return UpdateSubjectSchema.safeParse(input);
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
