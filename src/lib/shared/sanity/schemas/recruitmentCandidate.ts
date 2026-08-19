import { defineType, defineField } from 'sanity';

export const recruitmentCandidateSchema = defineType({
  name: 'recruitmentCandidate',
  title: 'Kandidat Rekrutmen',
  type: 'document',
  fields: [
    defineField({ name: 'fullName', title: 'Nama Lengkap', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'email', title: 'Email', type: 'string', validation: (r) => r.required().email() }),
    defineField({ name: 'phone', title: 'Telepon', type: 'string' }),
    defineField({ name: 'education', title: 'Pendidikan', type: 'string' }),
    defineField({ name: 'experienceYears', title: 'Pengalaman (tahun)', type: 'number' }),
    defineField({ name: 'subjectIds', title: 'Mata Pelajaran', type: 'array', of: [{ type: 'reference', to: [{ type: 'subject' }] }] }),
    defineField({ name: 'levelIds', title: 'Jenjang', type: 'array', of: [{ type: 'reference', to: [{ type: 'educationLevel' }] }] }),
    defineField({ name: 'cvUrl', title: 'URL CV', type: 'url' }),
    defineField({
      name: 'status', title: 'Status', type: 'string',
      options: { list: [
        { title: 'Terdaftar', value: 'REGISTERED' },
        { title: 'Ujian Terjadwal', value: 'TEST_SCHEDULED' },
        { title: 'Selesai Ujian', value: 'TESTED' },
        { title: 'Wawancara Terjadwal', value: 'INTERVIEW_SCHEDULED' },
        { title: 'Selesai Wawancara', value: 'INTERVIEWED' },
        { title: 'Diterima', value: 'ACCEPTED' },
        { title: 'Ditolak', value: 'REJECTED' },
        { title: 'Wawancara', value: 'INTERVIEW' },
        { title: 'Microteaching', value: 'MICROTEACHING' }
      ]},
      initialValue: 'REGISTERED'
    }),
    defineField({ name: 'notes', title: 'Catatan', type: 'text' }),
    defineField({ name: 'interviewDate', title: 'Tanggal Wawancara', type: 'datetime' })
  ]
});
