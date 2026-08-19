import { defineType, defineField } from 'sanity';

export const packagePlanSchema = defineType({
  name: 'packagePlan',
  title: 'Paket Les',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Nama Paket', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'mode', title: 'Mode', type: 'string',
      options: { list: [{ title: 'Private', value: 'PRIVATE' }, { title: 'Kelompok', value: 'KELOMPOK' }] }
    }),
    defineField({
      name: 'period', title: 'Periode', type: 'string',
      options: { list: [{ title: 'Bulanan', value: 'BULANAN' }, { title: 'Harian', value: 'HARIAN' }] }
    }),
    defineField({ name: 'price', title: 'Harga', type: 'number' }),
    defineField({ name: 'sessionsPerPeriod', title: 'Sesi/Periode', type: 'number' }),
    defineField({ name: 'maxStudents', title: 'Maks Siswa', type: 'number' }),
    defineField({ name: 'tentorFee', title: 'Fee Tentor', type: 'number' }),
    defineField({ name: 'description', title: 'Deskripsi', type: 'text' }),
    defineField({ name: 'active', title: 'Aktif', type: 'boolean', initialValue: true })
  ]
});
