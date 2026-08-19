import { defineType, defineField } from 'sanity';

export const subjectSchema = defineType({
  name: 'subject',
  title: 'Mata Pelajaran',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Nama', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'description', title: 'Deskripsi', type: 'text' })
  ]
});
