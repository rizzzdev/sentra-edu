import { z } from 'zod';

export const CandidateSchema = z.object({
  fullName: z.string().trim().min(3, 'Nama lengkap minimal 3 karakter'),
  email: z.string().trim().email('Format email tidak valid'),
  phone: z.string().trim().min(8, 'Nomor HP minimal 8 digit'),
  education: z.string().trim().min(2, 'Pendidikan terakhir wajib diisi'),
  experienceYears: z.number().min(0),
  subjectIds: z.array(z.string()).min(1, 'Pilih minimal 1 mata pelajaran'),
  levelIds: z.array(z.string()).min(1, 'Pilih minimal 1 jenjang yang dikuasai'),
  notes: z.string().optional()
});

export type CandidateInput = z.infer<typeof CandidateSchema>;
