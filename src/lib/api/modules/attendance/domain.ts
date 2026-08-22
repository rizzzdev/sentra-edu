/**
 * Domain types + Zod validation schemas for Attendance
 * Used by both service layer (server) and UI components (client).
 */

import { z } from 'zod';
import type { Attendance } from '$generated/prisma/client';

// ── Zod Schemas ──────────────────────────────────────────

/** Schema for creating a new Attendance */
export const CreateAttendanceSchema = z.object({
  id: z.string().optional(),
  enrollmentId: z.string().min(1, 'Program les wajib dipilih'),
  tentorId: z.string().min(1, 'Tentor wajib dipilih'),
  sessionDate: z.union([z.string(), z.date()]).transform((val) => typeof val === 'string' ? new Date(val) : val),
  startTime: z.string().min(1, 'Waktu mulai wajib diisi'),
  endTime: z.string().min(1, 'Waktu selesai wajib diisi'),
  topic: z.string().trim().min(3, 'Materi pembelajaran minimal 3 karakter').max(500, 'Materi maksimal 500 karakter'),
  studentNotes: z.string().trim().max(1000, 'Catatan maksimal 1000 karakter').optional().default(''),
  status: z.enum(['SUBMITTED', 'APPROVED', 'REJECTED']).optional().default('SUBMITTED'),
  latitudeCheckIn: z.number().nullable().optional(),
  longitudeCheckIn: z.number().nullable().optional(),
  isRadiusValid: z.boolean().default(true),
});

/** Schema for updating an existing Attendance (all fields optional) */
export const UpdateAttendanceSchema = CreateAttendanceSchema.partial();

// ── Inferred TypeScript Types ─────────────────────────────

/** Zod-inferred input type for creation */
export type CreateAttendanceInput = z.infer<typeof CreateAttendanceSchema>;

/** Zod-inferred input type for update */
export type UpdateAttendanceInput = z.infer<typeof UpdateAttendanceSchema>;

/** Entity returned by service (Prisma model) */
export type AttendanceEntity = Attendance;

// ── Validation Helpers ────────────────────────────────────

/** Validate create input. Returns { success, data, errors } */
export function validateCreateAttendance(input: unknown) {
  return CreateAttendanceSchema.safeParse(input);
}

/** Validate update input. Returns { success, data, errors } */
export function validateUpdateAttendance(input: unknown) {
  return UpdateAttendanceSchema.safeParse(input);
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
