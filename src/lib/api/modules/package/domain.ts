/**
 * Domain types + Zod validation schemas for Package
 * Used by both service layer (server) and UI components (client).
 */

import { z } from 'zod';
import type { Package } from '$generated/prisma/client';

// ── Zod Schemas ──────────────────────────────────────────

/** Schema for creating a new Package */
export const CreatePackageSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, 'Nama paket wajib diisi').max(100, 'Nama paket maksimal 100 karakter'),
  mode: z.enum(['PRIVATE', 'KELOMPOK'], { required_error: 'Mode paket wajib dipilih' }),
  period: z.enum(['BULANAN', 'HARIAN'], { required_error: 'Periode wajib dipilih' }),
  price: z.number().min(0, 'Harga tidak boleh negatif'),
  sessionsPerPeriod: z.number().min(1, 'Sesi per periode minimal 1'),
  maxStudents: z.number().min(1, 'Kapasitas siswa minimal 1'),
  tentorFee: z.number().min(0, 'Honor tentor tidak boleh negatif').default(0),
  description: z.string().trim().max(500, 'Deskripsi maksimal 500 karakter').optional().default(''),
  active: z.boolean().default(true),
});

/** Schema for updating an existing Package (all fields optional) */
export const UpdatePackageSchema = CreatePackageSchema.partial();

// ── Inferred TypeScript Types ─────────────────────────────

/** Zod-inferred input type for creation */
export type CreatePackageInput = z.infer<typeof CreatePackageSchema>;

/** Zod-inferred input type for update */
export type UpdatePackageInput = z.infer<typeof UpdatePackageSchema>;

/** Entity returned by service (Prisma model) */
export type PackageEntity = Package;

// ── Validation Helpers ────────────────────────────────────

/** Validate create input. Returns { success, data, errors } */
export function validateCreatePackage(input: unknown) {
  return CreatePackageSchema.safeParse(input);
}

/** Validate update input. Returns { success, data, errors } */
export function validateUpdatePackage(input: unknown) {
  return UpdatePackageSchema.safeParse(input);
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
