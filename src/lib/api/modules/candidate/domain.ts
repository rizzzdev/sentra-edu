/**
 * Domain types + Zod validation schemas for Candidate
 * Used by both service layer (server) and UI components (client).
 */

import { z } from 'zod';
import type { Candidate } from '$generated/prisma/client';

// ── Zod Schemas ──────────────────────────────────────────

/** Schema for creating a new Candidate */
export const CreateCandidateSchema = z.object({
  id: z.string().optional(),
  fullName: z.string().trim().min(1, 'Nama lengkap wajib diisi').max(100, 'Nama maksimal 100 karakter'),
  email: z.string().trim().min(1, 'Email wajib diisi').email('Format email tidak valid'),
  phone: z.string().trim().min(1, 'Nomor telepon wajib diisi').max(20, 'Nomor telepon maksimal 20 karakter'),
  education: z.string().trim().max(100).optional().default(''),
  experienceYears: z.number().min(0, 'Pengalaman tidak boleh negatif').optional().default(0),
  subjectIds: z.array(z.string()).optional().default([]),
  levelIds: z.array(z.string()).optional().default([]),
  cvUrl: z.string().nullable().optional(),
  source: z.string().nullable().optional(),
  status: z.enum(['REGISTERED', 'TEST_SCHEDULED', 'TESTED', 'INTERVIEW_SCHEDULED', 'INTERVIEWED', 'ACCEPTED', 'REJECTED', 'INTERVIEW', 'MICROTEACHING']).optional().default('REGISTERED'),
  notes: z.string().trim().max(1000).optional().default(''),
  interviewDate: z.union([z.string(), z.date()]).nullable().optional(),
});

/** Schema for updating an existing Candidate (all fields optional) */
export const UpdateCandidateSchema = CreateCandidateSchema.partial();

// ── Inferred TypeScript Types ─────────────────────────────

/** Zod-inferred input type for creation */
export type CreateCandidateInput = z.infer<typeof CreateCandidateSchema>;

/** Zod-inferred input type for update */
export type UpdateCandidateInput = z.infer<typeof UpdateCandidateSchema>;

/** Entity returned by service (Prisma model) */
export type CandidateEntity = Candidate;

// ── Validation Helpers ────────────────────────────────────

/** Validate create input. Returns { success, data, errors } */
export function validateCreateCandidate(input: unknown) {
  return CreateCandidateSchema.safeParse(input);
}

/** Validate update input. Returns { success, data, errors } */
export function validateUpdateCandidate(input: unknown) {
  return UpdateCandidateSchema.safeParse(input);
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
