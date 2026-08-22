/**
 * Domain types + Zod validation schemas for JobApplication
 * Used by both service layer (server) and UI components (client).
 */

import { z } from 'zod';
import type { JobApplication } from '$generated/prisma/client';

// ── Zod Schemas ──────────────────────────────────────────

/** Schema for creating a new JobApplication */
export const CreateJobApplicationSchema = z.object({
  id: z.string().optional(),
  jobId: z.string().min(1, 'Lowongan wajib dipilih'),
  tentorId: z.string().min(1, 'Tentor wajib dipilih'),
  status: z.enum(['PENDING', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED']).optional().default('PENDING'),
  appliedAt: z.union([z.string(), z.date()]).optional().default(() => new Date()),
  notes: z.string().trim().max(500, 'Catatan maksimal 500 karakter').optional().default(''),
});

/** Schema for updating an existing JobApplication (all fields optional) */
export const UpdateJobApplicationSchema = CreateJobApplicationSchema.partial();

// ── Inferred TypeScript Types ─────────────────────────────

/** Zod-inferred input type for creation */
export type CreateJobApplicationInput = z.infer<typeof CreateJobApplicationSchema>;

/** Zod-inferred input type for update */
export type UpdateJobApplicationInput = z.infer<typeof UpdateJobApplicationSchema>;

/** Entity returned by service (Prisma model) */
export type JobApplicationEntity = JobApplication;

// ── Validation Helpers ────────────────────────────────────

/** Validate create input. Returns { success, data, errors } */
export function validateCreateJobApplication(input: unknown) {
  return CreateJobApplicationSchema.safeParse(input);
}

/** Validate update input. Returns { success, data, errors } */
export function validateUpdateJobApplication(input: unknown) {
  return UpdateJobApplicationSchema.safeParse(input);
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
