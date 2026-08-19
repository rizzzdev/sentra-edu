import { defineType, defineField } from 'sanity';

export const jobApplicationSchema = defineType({
  name: 'jobApplication',
  title: 'Lamaran',
  type: 'document',
  fields: [
    defineField({ name: 'job', title: 'Lowongan', type: 'reference', to: [{ type: 'jobPost' }], validation: (r) => r.required() }),
    defineField({ name: 'tentor', title: 'Tentor', type: 'reference', to: [{ type: 'user' }], validation: (r) => r.required() }),
    defineField({
      name: 'status', title: 'Status', type: 'string',
      options: { list: [
        { title: 'Menunggu', value: 'PENDING' },
        { title: 'Ditinjau', value: 'UNDER_REVIEW' },
        { title: 'Diterima', value: 'ACCEPTED' },
        { title: 'Ditolak', value: 'REJECTED' }
      ]},
      initialValue: 'PENDING'
    }),
    defineField({ name: 'appliedAt', title: 'Tanggal Lamar', type: 'datetime' }),
    defineField({ name: 'notes', title: 'Catatan', type: 'text' })
  ]
});
