/**
 * Domain types + Zod validation schemas for PayrollClaim
 * Used by both service layer (server) and UI components (client).
 */

import { z } from 'zod';
import type { PayrollClaim } from '$generated/prisma/client';

// ── Zod Schemas ──────────────────────────────────────────

/** Schema for creating a new PayrollClaim */
export const CreatePayrollClaimSchema = z.object({
  id: z.string().optional(),
  claimNumber: z.string().optional().default(() => 'PAY-' + Date.now()),
  tentorId: z.string().min(1, 'Tentor wajib dipilih'),
  periodStart: z.union([z.string(), z.date()]).transform((val) => typeof val === 'string' ? new Date(val) : val),
  periodEnd: z.union([z.string(), z.date()]).transform((val) => typeof val === 'string' ? new Date(val) : val),
  periodMonth: z.number().optional().nullable(),
  periodYear: z.number().optional().nullable(),
  totalAmount: z.number().min(0, 'Total jumlah tidak boleh negatif'),
  attendanceIds: z.array(z.string()).default([]),
  status: z.enum(['DRAFT', 'REQUESTED', 'PAID', 'REJECTED']).optional().default('REQUESTED'),
});

/** Schema for updating an existing PayrollClaim (all fields optional) */
export const UpdatePayrollClaimSchema = CreatePayrollClaimSchema.partial();

// ── Inferred TypeScript Types ─────────────────────────────

/** Zod-inferred input type for creation */
export type CreatePayrollClaimInput = z.infer<typeof CreatePayrollClaimSchema>;

/** Zod-inferred input type for update */
export type UpdatePayrollClaimInput = z.infer<typeof UpdatePayrollClaimSchema>;

/** Entity returned by service (Prisma model) */
export type PayrollClaimEntity = PayrollClaim;

// ── Validation Helpers ────────────────────────────────────

/** Validate create input. Returns { success, data, errors } */
export function validateCreatePayrollClaim(input: unknown) {
  return CreatePayrollClaimSchema.safeParse(input);
}

/** Validate update input. Returns { success, data, errors } */
export function validateUpdatePayrollClaim(input: unknown) {
  return UpdatePayrollClaimSchema.safeParse(input);
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
