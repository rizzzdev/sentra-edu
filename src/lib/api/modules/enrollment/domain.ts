/**
 * Domain types + Zod validation schemas for Enrollment
 * Used by both service layer (server) and UI components (client).
 */

import { z } from 'zod';
import type { Enrollment } from '$generated/prisma/client';

// ── Zod Schemas ──────────────────────────────────────────

/** Schema for creating a new Enrollment */
export const CreateEnrollmentSchema = z.object({
  studentId: z.string().min(1, 'Siswa wajib dipilih'),
  subjectId: z.string().min(1, 'Mata pelajaran wajib dipilih'),
  classId: z.string().min(1, 'Kelas wajib dipilih'),
  packageId: z.string().min(1, 'Paket les wajib dipilih'),
  tentorId: z.string().optional(),
  scheduleDay: z.string().trim().optional().default(''),
  scheduleTime: z.string().trim().optional().default(''),
  address: z.string().trim().max(500).optional(),
  parentId: z.string().optional(),
});

/** Schema for updating an existing Enrollment (all fields optional) */
export const UpdateEnrollmentSchema = CreateEnrollmentSchema.partial();

// ── Inferred TypeScript Types ─────────────────────────────

/** Zod-inferred input type for creation */
export type CreateEnrollmentInput = z.infer<typeof CreateEnrollmentSchema>;

/** Zod-inferred input type for update */
export type UpdateEnrollmentInput = z.infer<typeof UpdateEnrollmentSchema>;

/** Entity returned by service (Prisma model) */
export type EnrollmentEntity = Enrollment;

// ── Validation Helpers ────────────────────────────────────

/** Validate create input. Returns { success, data, errors } */
export function validateCreateEnrollment(input: unknown) {
  return CreateEnrollmentSchema.safeParse(input);
}

/** Validate update input. Returns { success, data, errors } */
export function validateUpdateEnrollment(input: unknown) {
  return UpdateEnrollmentSchema.safeParse(input);
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
