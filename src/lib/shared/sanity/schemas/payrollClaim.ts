import { defineType, defineField } from 'sanity';

export const payrollClaimSchema = defineType({
  name: 'payrollClaim',
  title: 'Klaim Honor',
  type: 'document',
  fields: [
    defineField({ name: 'tentor', title: 'Tentor', type: 'reference', to: [{ type: 'user' }], validation: (r) => r.required() }),
    defineField({ name: 'claimNumber', title: 'No. Klaim', type: 'string' }),
    defineField({ name: 'periodStart', title: 'Mulai Periode', type: 'date' }),
    defineField({ name: 'periodEnd', title: 'Akhir Periode', type: 'date' }),
    defineField({ name: 'periodMonth', title: 'Bulan', type: 'number' }),
    defineField({ name: 'periodYear', title: 'Tahun', type: 'number' }),
    defineField({ name: 'totalAmount', title: 'Total', type: 'number' }),
    defineField({ name: 'attendances', title: 'Presensi', type: 'array', of: [{ type: 'reference', to: [{ type: 'attendanceRecord' }] }] }),
    defineField({
      name: 'status', title: 'Status', type: 'string',
      options: { list: [
        { title: 'Draf', value: 'DRAFT' },
        { title: 'Diajukan', value: 'REQUESTED' },
        { title: 'Dibayar', value: 'PAID' },
        { title: 'Ditolak', value: 'REJECTED' }
      ]},
      initialValue: 'REQUESTED'
    }),
    defineField({ name: 'paidAt', title: 'Tanggal Bayar', type: 'datetime' }),
    defineField({ name: 'transferProofUrl', title: 'Bukti Transfer', type: 'url' }),
    defineField({ name: 'rejectionReason', title: 'Alasan Penolakan', type: 'text' })
  ]
});
