import { defineType, defineField } from 'sanity';

export const jobPostSchema = defineType({
  name: 'jobPost',
  title: 'Lowongan Les',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Judul', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'classLevel', title: 'Kelas', type: 'reference', to: [{ type: 'classLevel' }] }),
    defineField({ name: 'subject', title: 'Mata Pelajaran', type: 'reference', to: [{ type: 'subject' }] }),
    defineField({ name: 'packagePlan', title: 'Paket', type: 'reference', to: [{ type: 'packagePlan' }] }),
    defineField({
      name: 'jobType', title: 'Tipe', type: 'string',
      options: { list: [{ title: 'Reguler', value: 'REGULAR' }, { title: 'Pengganti Sementara', value: 'TEMPORARY_REPLACEMENT' }] }
    }),
    defineField({
      name: 'jobMode', title: 'Mode', type: 'string',
      options: { list: [{ title: 'Offline', value: 'OFFLINE' }, { title: 'Online', value: 'ONLINE' }] }
    }),
    defineField({ name: 'tentorFee', title: 'Fee Tentor', type: 'number' }),
    defineField({ name: 'sessionDurationMinutes', title: 'Durasi (menit)', type: 'number' }),
    defineField({ name: 'scheduleDays', title: 'Hari', type: 'array', of: [{ type: 'string' }] }),
    defineField({ name: 'scheduleTime', title: 'Jam', type: 'string' }),
    defineField({ name: 'studentCount', title: 'Jumlah Siswa', type: 'number' }),
    defineField({ name: 'location', title: 'Lokasi', type: 'string' }),
    defineField({ name: 'latitude', title: 'Latitude', type: 'number' }),
    defineField({ name: 'longitude', title: 'Longitude', type: 'number' }),
    defineField({
      name: 'status', title: 'Status', type: 'string',
      options: { list: [
        { title: 'Tersedia', value: 'AVAILABLE' },
        { title: 'Negosiasi', value: 'NEGOTIATING' },
        { title: 'Ditugaskan', value: 'ASSIGNED' },
        { title: 'Dibatalkan', value: 'CANCELLED' }
      ]},
      initialValue: 'AVAILABLE'
    }),
    defineField({ name: 'assignedTentor', title: 'Tentor', type: 'reference', to: [{ type: 'user' }], weak: true }),
    defineField({ name: 'student', title: 'Siswa', type: 'reference', to: [{ type: 'user' }], weak: true }),
    defineField({ name: 'enrollment', title: 'Pendaftaran', type: 'reference', to: [{ type: 'enrollment' }], weak: true }),
    defineField({ name: 'notes', title: 'Catatan', type: 'text' })
  ]
});
