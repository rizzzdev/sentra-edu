/**
 * Domain types + Zod validation schemas for Job
 * Used by both service layer (server) and UI components (client).
 */

import { z } from 'zod';
import type { Job } from '$generated/prisma/client';

// ── Zod Schemas ──────────────────────────────────────────

/** Schema for creating a new Job */
export const CreateJobSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(3, 'Judul minimal 3 karakter').max(120, 'Judul maksimal 120 karakter'),
  classId: z.string().optional(),
  subjectId: z.string().optional(),
  packageId: z.string().optional(),
  jobMode: z.enum(['OFFLINE', 'ONLINE']).default('OFFLINE'),
  tentorFee: z.number().min(0, 'Honor tidak boleh negatif').optional(),
  transportAllowance: z.number().min(0, 'Tunjangan transport tidak boleh negatif').optional(),
  scheduleDays: z.array(z.string()).optional(),
  scheduleTime: z.string().trim().optional(),
  location: z.string().trim().max(500).optional(),
  notes: z.string().trim().max(1000).optional(),
});

/** Schema for updating an existing Job (all fields optional) */
export const UpdateJobSchema = CreateJobSchema.partial();

// ── Inferred TypeScript Types ─────────────────────────────

/** Zod-inferred input type for creation */
export type CreateJobInput = z.infer<typeof CreateJobSchema>;

/** Zod-inferred input type for update */
export type UpdateJobInput = z.infer<typeof UpdateJobSchema>;

/** Entity returned by service (Prisma model) */
export type JobEntity = Job;

// ── Validation Helpers ────────────────────────────────────

/** Validate create input. Returns { success, data, errors } */
export function validateCreateJob(input: unknown) {
  return CreateJobSchema.safeParse(input);
}

/** Validate update input. Returns { success, data, errors } */
export function validateUpdateJob(input: unknown) {
  return UpdateJobSchema.safeParse(input);
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
