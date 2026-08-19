import { z } from 'zod';

export const InvoiceSchema = z.object({
  enrollmentId: z.string().min(1, 'Program les siswa wajib dipilih'),
  amount: z.number().positive('Nominal tagihan harus lebih dari 0'),
  dueDate: z.string().min(1, 'Jatuh tempo wajib diisi'),
  periodMonth: z.number().min(1).max(12),
  periodYear: z.number().min(2024),
  notes: z.string().optional()
});

export type InvoiceInput = z.infer<typeof InvoiceSchema>;
