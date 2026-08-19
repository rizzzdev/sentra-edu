import { defineType, defineField } from 'sanity';

export const invoiceRecordSchema = defineType({
  name: 'invoiceRecord',
  title: 'Tagihan',
  type: 'document',
  fields: [
    defineField({ name: 'enrollment', title: 'Pendaftaran', type: 'reference', to: [{ type: 'enrollment' }], validation: (r) => r.required() }),
    defineField({ name: 'invoiceNumber', title: 'No. Invoice', type: 'string' }),
    defineField({ name: 'amount', title: 'Jumlah', type: 'number' }),
    defineField({ name: 'dueDate', title: 'Jatuh Tempo', type: 'date' }),
    defineField({
      name: 'status', title: 'Status', type: 'string',
      options: { list: [
        { title: 'Belum Dibayar', value: 'UNPAID' },
        { title: 'Lunas', value: 'PAID' },
        { title: 'Jatuh Tempo', value: 'OVERDUE' }
      ]},
      initialValue: 'UNPAID'
    }),
    defineField({ name: 'paidAt', title: 'Tanggal Bayar', type: 'datetime' }),
    defineField({ name: 'paymentProofUrl', title: 'Bukti Bayar', type: 'url' }),
    defineField({ name: 'periodMonth', title: 'Bulan', type: 'number' }),
    defineField({ name: 'periodYear', title: 'Tahun', type: 'number' }),
    defineField({ name: 'notes', title: 'Catatan', type: 'text' })
  ]
});
