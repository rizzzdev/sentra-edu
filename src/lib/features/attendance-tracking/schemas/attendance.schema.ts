import { z } from 'zod';

export const AttendanceSchema = z.object({
  enrollmentId: z.string().min(1, 'Program les wajib dipilih'),
  sessionDate: z.string().min(1, 'Tanggal sesi wajib diisi'),
  startTime: z.string().min(1, 'Waktu mulai wajib diisi'),
  endTime: z.string().min(1, 'Waktu selesai wajib diisi'),
  topic: z.string().trim().min(3, 'Materi pembelajaran minimal 3 karakter'),
  studentNotes: z.string().trim().min(3, 'Catatan perkembangan siswa wajib diisi'),
  latitudeCheckIn: z.number().nullable().optional(),
  longitudeCheckIn: z.number().nullable().optional(),
  isRadiusValid: z.boolean().default(true),
  proofPhotoUrl: z.string().optional()
});

export type AttendanceInput = z.infer<typeof AttendanceSchema>;
