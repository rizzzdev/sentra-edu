import { defineType, defineField } from 'sanity';

export const attendanceRecordSchema = defineType({
  name: 'attendanceRecord',
  title: 'Presensi',
  type: 'document',
  fields: [
    defineField({ name: 'enrollment', title: 'Pendaftaran', type: 'reference', to: [{ type: 'enrollment' }], validation: (r) => r.required() }),
    defineField({ name: 'tentor', title: 'Tentor', type: 'reference', to: [{ type: 'user' }], validation: (r) => r.required() }),
    defineField({ name: 'sessionDate', title: 'Tanggal Sesi', type: 'date' }),
    defineField({ name: 'startTime', title: 'Jam Mulai', type: 'string' }),
    defineField({ name: 'endTime', title: 'Jam Selesai', type: 'string' }),
    defineField({ name: 'topic', title: 'Topik', type: 'string' }),
    defineField({ name: 'studentNotes', title: 'Catatan', type: 'text' }),
    defineField({
      name: 'status', title: 'Status', type: 'string',
      options: { list: [
        { title: 'Diajukan', value: 'SUBMITTED' },
        { title: 'Disetujui', value: 'APPROVED' },
        { title: 'Ditolak', value: 'REJECTED' }
      ]},
      initialValue: 'SUBMITTED'
    }),
    defineField({ name: 'latitudeCheckIn', title: 'Latitude', type: 'number' }),
    defineField({ name: 'longitudeCheckIn', title: 'Longitude', type: 'number' }),
    defineField({ name: 'isRadiusValid', title: 'Radius Valid', type: 'boolean' }),
    defineField({ name: 'proofPhotoUrl', title: 'Bukti Foto', type: 'url' }),
    defineField({ name: 'studentConfirmed', title: 'Dikonfirmasi Siswa', type: 'boolean' }),
    defineField({ name: 'studentRating', title: 'Rating', type: 'number' }),
    defineField({ name: 'studentFeedback', title: 'Feedback', type: 'text' }),
    defineField({ name: 'reviewNotes', title: 'Catatan Review', type: 'text' })
  ]
});
