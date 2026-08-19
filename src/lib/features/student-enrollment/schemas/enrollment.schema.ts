import { z } from 'zod';

export const EnrollmentSchema = z.object({
  studentId: z.string().min(1, 'Siswa wajib dipilih'),
  subjectId: z.string().min(1, 'Mata pelajaran wajib dipilih'),
  classId: z.string().min(1, 'Kelas wajib dipilih'),
  packageId: z.string().min(1, 'Paket les wajib dipilih'),
  tentorId: z.string().nullable().optional(),
  scheduleDay: z.string().min(1, 'Hari jadwal wajib diisi'),
  scheduleTime: z.string().min(1, 'Waktu jadwal wajib diisi'),
  address: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional()
});

export type EnrollmentInput = z.infer<typeof EnrollmentSchema>;
