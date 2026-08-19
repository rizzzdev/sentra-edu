import { defineType, defineField } from 'sanity';

export const magicLinkSchema = defineType({
  name: 'magicLink',
  title: 'Magic Link',
  type: 'document',
  fields: [
    defineField({ name: 'token', title: 'Token', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'title', title: 'Judul', type: 'string' }),
    defineField({ name: 'daysValid', title: 'Berlaku (hari)', type: 'number' }),
    defineField({ name: 'expiresAt', title: 'Kadaluarsa', type: 'datetime' }),
    defineField({ name: 'usedCount', title: 'Digunakan', type: 'number', initialValue: 0 }),
    defineField({ name: 'active', title: 'Aktif', type: 'boolean', initialValue: true }),
    defineField({
      name: 'targetRole', title: 'Target Role', type: 'string',
      options: { list: [{ title: 'Siswa', value: 'STUDENT' }, { title: 'Tentor', value: 'TENTOR' }] }
    }),
    defineField({ name: 'classLevel', title: 'Kelas', type: 'reference', to: [{ type: 'classLevel' }], weak: true }),
    defineField({ name: 'packagePlan', title: 'Paket', type: 'reference', to: [{ type: 'packagePlan' }], weak: true }),
    defineField({ name: 'createdBy', title: 'Dibuat Oleh', type: 'reference', to: [{ type: 'user' }], weak: true })
  ]
});
