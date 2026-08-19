import { z } from 'zod';

export const StudentMasterSchema = z.object({
  id: z.string().optional(),
  fullName: z
    .string({ required_error: 'Nama lengkap siswa wajib diisi.' })
    .trim()
    .min(3, 'Nama lengkap minimal 3 karakter.'),
  email: z
    .string({ required_error: 'Email siswa wajib diisi.' })
    .trim()
    .email('Format email tidak valid.'),
  phone: z.string().trim().default(''),
  school: z.string().trim().default(''),
  address: z.string().trim().default(''),
  waliUserId: z.string().optional(),
});

export const WaliMasterSchema = z.object({
  id: z.string().optional(),
  fullName: z
    .string({ required_error: 'Nama lengkap wali murid wajib diisi.' })
    .trim()
    .min(3, 'Nama lengkap minimal 3 karakter.'),
  email: z
    .string({ required_error: 'Email wali murid wajib diisi.' })
    .trim()
    .email('Format email tidak valid.'),
  phone: z.string().trim().default(''),
  occupation: z.string().trim().default(''),
  address: z.string().trim().default(''),
});

export const MagicLinkSchema = z.object({
  title: z
    .string({ required_error: 'Judul magic link wajib diisi.' })
    .trim()
    .min(3, 'Judul minimal 3 karakter.'),
  daysValid: z
    .number({ required_error: 'Masa kadaluarsa wajib diisi.' })
    .int()
    .min(1, 'Masa kadaluarsa minimal 1 hari.')
    .max(365, 'Masa kadaluarsa maksimal 365 hari.'),
  targetRole: z.enum(['STUDENT', 'TENTOR']),
  classId: z.string().optional(),
  packageId: z.string().optional(),
});
