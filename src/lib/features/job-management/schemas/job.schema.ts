import { z } from 'zod';

export const JobPostSchema = z.object({
  title: z.string().trim().min(3, 'Judul minimal 3 karakter').max(120, 'Judul maksimal 120 karakter'),
  classId: z.string().min(1, 'Kelas wajib dipilih'),
  subjectId: z.string().min(1, 'Mata pelajaran wajib dipilih'),
  jobType: z.enum(['REGULAR', 'TEMPORARY_REPLACEMENT']),
  jobMode: z.enum(['OFFLINE', 'ONLINE']),
  tentorFee: z.number().positive('Honor tentor harus lebih besar dari 0'),
  sessionDurationMinutes: z.number().positive('Durasi sesi harus valid'),
  scheduleDays: z.array(z.string()).min(1, 'Pilih minimal 1 hari jadwal'),
  scheduleTime: z.string().min(1, 'Jam les wajib diisi'),
  studentCount: z.number().min(1, 'Jumlah siswa minimal 1'),
  location: z.string().min(1, 'Lokasi les wajib diisi'),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  notes: z.string().optional()
});

export type JobPostInput = z.infer<typeof JobPostSchema>;
