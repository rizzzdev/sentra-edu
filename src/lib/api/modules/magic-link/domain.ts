/**
 * Domain types + Zod validation schemas for MagicLink
 * Used by both service layer (server) and UI components (client).
 */

import { z } from 'zod';
import type { MagicLink } from '$generated/prisma/client';

// ── Zod Schemas ──────────────────────────────────────────

/** Schema for creating a new MagicLink */
export const CreateMagicLinkSchema = z.object({
  token: z.string().trim().min(1, 'Token wajib diisi'),
  title: z.string().trim().max(100, 'Judul maksimal 100 karakter').optional().default(''),
  daysValid: z.number().min(1, 'Durasi valid minimal 1 hari').max(365, 'Durasi valid maksimal 365 hari'),
  targetRole: z.enum(['STUDENT', 'TENTOR']).optional().default('STUDENT'),
  classId: z.string().optional(),
  packageId: z.string().optional(),
  createdBy: z.string().optional(),
});

/** Schema for updating an existing MagicLink (all fields optional) */
export const UpdateMagicLinkSchema = CreateMagicLinkSchema.partial();

// ── Inferred TypeScript Types ─────────────────────────────

/** Zod-inferred input type for creation */
export type CreateMagicLinkInput = z.infer<typeof CreateMagicLinkSchema>;

/** Zod-inferred input type for update */
export type UpdateMagicLinkInput = z.infer<typeof UpdateMagicLinkSchema>;

/** Entity returned by service (Prisma model) */
export type MagicLinkEntity = MagicLink;

// ── Validation Helpers ────────────────────────────────────

/** Validate create input. Returns { success, data, errors } */
export function validateCreateMagicLink(input: unknown) {
  return CreateMagicLinkSchema.safeParse(input);
}

/** Validate update input. Returns { success, data, errors } */
export function validateUpdateMagicLink(input: unknown) {
  return UpdateMagicLinkSchema.safeParse(input);
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
