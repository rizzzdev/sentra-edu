/**
 * Domain types + Zod validation schemas for Notification
 * Used by both service layer (server) and UI components (client).
 */

import { z } from 'zod';
import type { Notification } from '$generated/prisma/client';

// ── Zod Schemas ──────────────────────────────────────────

/** Schema for creating a new Notification */
export const CreateNotificationSchema = z.object({
  userId: z.string().min(1, 'Target pengguna wajib diisi'),
  title: z.string().trim().min(1, 'Judul notifikasi wajib diisi').max(100, 'Judul maksimal 100 karakter'),
  message: z.string().trim().min(1, 'Pesan notifikasi wajib diisi').max(500, 'Pesan maksimal 500 karakter'),
  icon: z.string().trim().optional().default('notifications'),
});

/** Schema for updating an existing Notification (all fields optional) */
export const UpdateNotificationSchema = CreateNotificationSchema.partial();

// ── Inferred TypeScript Types ─────────────────────────────

/** Zod-inferred input type for creation */
export type CreateNotificationInput = z.infer<typeof CreateNotificationSchema>;

/** Zod-inferred input type for update */
export type UpdateNotificationInput = z.infer<typeof UpdateNotificationSchema>;

/** Entity returned by service (Prisma model) */
export type NotificationEntity = Notification;

// ── Validation Helpers ────────────────────────────────────

/** Validate create input. Returns { success, data, errors } */
export function validateCreateNotification(input: unknown) {
  return CreateNotificationSchema.safeParse(input);
}

/** Validate update input. Returns { success, data, errors } */
export function validateUpdateNotification(input: unknown) {
  return UpdateNotificationSchema.safeParse(input);
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
