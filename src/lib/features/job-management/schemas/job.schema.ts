import { z } from 'zod';

export const JobPostSchema = z.object({
  title: z.string().trim().min(3, 'Judul minimal 3 karakter').max(120, 'Judul maksimal 120 karakter'),
  classId: z.string().optional(),
  classIds: z.array(z.string()).optional(),
  subjectId: z.string().optional(),
  subjectIds: z.array(z.string()).optional(),
  packageId: z.string().optional(),
  jobMode: z.enum(['OFFLINE', 'ONLINE']).default('OFFLINE'),
  mode: z.enum(['OFFLINE', 'ONLINE']).optional(),
  tentorFee: z.number().optional(),
  transportAllowance: z.number().optional(),
  sessionDurationMinutes: z.number().positive('Durasi sesi harus valid').default(90),
  scheduleDays: z.array(z.string()).min(1, 'Pilih minimal 1 hari jadwal'),
  scheduleTime: z.string().min(1, 'Jam les wajib diisi'),
  studentCount: z.number().min(1, 'Jumlah siswa minimal 1').default(1),
  location: z.string().optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  notes: z.string().optional()
});

export type JobPostInput = z.infer<typeof JobPostSchema>;
