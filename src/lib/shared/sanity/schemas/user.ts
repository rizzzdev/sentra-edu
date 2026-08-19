import { defineType, defineField } from 'sanity';

export const userSchema = defineType({
  name: 'user',
  title: 'User',
  type: 'document',
  fields: [
    defineField({ name: 'email', title: 'Email', type: 'string', validation: (r) => r.required().email() }),
    defineField({ name: 'password', title: 'Password', type: 'string' }),
    defineField({ name: 'fullName', title: 'Nama Lengkap', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'phone', title: 'Telepon', type: 'string' }),
    defineField({
      name: 'role', title: 'Role', type: 'string',
      options: { list: [
        { title: 'Super Admin', value: 'SUPER_ADMIN' },
        { title: 'Tentor', value: 'TENTOR' },
        { title: 'Siswa', value: 'STUDENT' },
        { title: 'Wali Murid', value: 'WALI_MURID' }
      ]}
    }),
    defineField({ name: 'position', title: 'Jabatan', type: 'string' }),
    defineField({ name: 'education', title: 'Pendidikan', type: 'string' }),
    defineField({ name: 'experienceYears', title: 'Pengalaman (tahun)', type: 'number' }),
    defineField({ name: 'subjectIds', title: 'Mata Pelajaran', type: 'array', of: [{ type: 'reference', to: [{ type: 'subject' }] }] }),
    defineField({ name: 'levelIds', title: 'Jenjang', type: 'array', of: [{ type: 'reference', to: [{ type: 'educationLevel' }] }] }),
    defineField({ name: 'school', title: 'Sekolah', type: 'string' }),
    defineField({ name: 'address', title: 'Alamat', type: 'text' }),
    defineField({ name: 'occupation', title: 'Pekerjaan', type: 'string' }),
    defineField({ name: 'waliUser', title: 'Wali Murid', type: 'reference', to: [{ type: 'user' }], weak: true }),
    defineField({ name: 'isActive', title: 'Aktif', type: 'boolean', initialValue: true }),
    defineField({
      name: 'candidateStatus', title: 'Status Kandidat', type: 'string',
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
      ]}
    })
  ],
  orderings: [{ title: 'Nama', name: 'fullNameAsc', by: [{ field: 'fullName', direction: 'asc' }] }]
});
