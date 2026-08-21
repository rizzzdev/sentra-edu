/**
 * Domain types + Zod validation schemas for Invoice
 * Used by both service layer (server) and UI components (client).
 */

import { z } from 'zod';
import type { Invoice } from '$generated/prisma/client';

// ── Zod Schemas ──────────────────────────────────────────

/** Schema for creating a new Invoice */
export const CreateInvoiceSchema = z.object({
  enrollmentId: z.string().min(1, 'Pendaftaran wajib dipilih'),
  amount: z.number().min(0, 'Jumlah tagihan tidak boleh negatif'),
  dueDate: z.string().min(1, 'Tanggal jatuh tempo wajib diisi'),
  periodMonth: z.number().min(1, 'Bulan periode tidak valid').max(12, 'Bulan periode tidak valid'),
  periodYear: z.number().min(2020, 'Tahun periode tidak valid'),
  notes: z.string().trim().max(500).optional().default(''),
});

/** Schema for updating an existing Invoice (all fields optional) */
export const UpdateInvoiceSchema = CreateInvoiceSchema.partial();

// ── Inferred TypeScript Types ─────────────────────────────

/** Zod-inferred input type for creation */
export type CreateInvoiceInput = z.infer<typeof CreateInvoiceSchema>;

/** Zod-inferred input type for update */
export type UpdateInvoiceInput = z.infer<typeof UpdateInvoiceSchema>;

/** Entity returned by service (Prisma model) */
export type InvoiceEntity = Invoice;

// ── Validation Helpers ────────────────────────────────────

/** Validate create input. Returns { success, data, errors } */
export function validateCreateInvoice(input: unknown) {
  return CreateInvoiceSchema.safeParse(input);
}

/** Validate update input. Returns { success, data, errors } */
export function validateUpdateInvoice(input: unknown) {
  return UpdateInvoiceSchema.safeParse(input);
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
