import { defineType, defineField } from 'sanity';

export const enrollmentSchema = defineType({
  name: 'enrollment',
  title: 'Pendaftaran',
  type: 'document',
  fields: [
    defineField({ name: 'student', title: 'Siswa', type: 'reference', to: [{ type: 'user' }], validation: (r) => r.required() }),
    defineField({ name: 'subject', title: 'Mata Pelajaran', type: 'reference', to: [{ type: 'subject' }], validation: (r) => r.required() }),
    defineField({ name: 'classLevel', title: 'Kelas', type: 'reference', to: [{ type: 'classLevel' }], validation: (r) => r.required() }),
    defineField({ name: 'packagePlan', title: 'Paket', type: 'reference', to: [{ type: 'packagePlan' }], validation: (r) => r.required() }),
    defineField({ name: 'tentor', title: 'Tentor', type: 'reference', to: [{ type: 'user' }], weak: true }),
    defineField({ name: 'scheduleDay', title: 'Jadwal Hari', type: 'string' }),
    defineField({ name: 'scheduleTime', title: 'Jadwal Jam', type: 'string' }),
    defineField({
      name: 'status', title: 'Status', type: 'string',
      options: { list: [
        { title: 'Aktif', value: 'ACTIVE' },
        { title: 'Menunggu', value: 'PENDING' },
        { title: 'Selesai', value: 'COMPLETED' },
        { title: 'Dibatalkan', value: 'CANCELLED' }
      ]},
      initialValue: 'ACTIVE'
    }),
    defineField({ name: 'address', title: 'Alamat', type: 'text' }),
    defineField({ name: 'latitude', title: 'Latitude', type: 'number' }),
    defineField({ name: 'longitude', title: 'Longitude', type: 'number' }),
    defineField({ name: 'waliUser', title: 'Wali Murid', type: 'reference', to: [{ type: 'user' }], weak: true })
  ]
});
