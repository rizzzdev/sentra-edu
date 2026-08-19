import { z } from 'zod';

export const TentorMasterSchema = z.object({
  id: z.string().optional(),
  fullName: z
    .string({ required_error: 'Nama lengkap tentor wajib diisi.' })
    .trim()
    .min(3, 'Nama lengkap minimal 3 karakter.'),
  email: z
    .string({ required_error: 'Email tentor wajib diisi.' })
    .trim()
    .email('Format email tidak valid.'),
  phone: z.string().trim().default(''),
  education: z.string().trim().default(''),
  subjectIds: z.array(z.string()).default([]),
  address: z.string().trim().default(''),
});
