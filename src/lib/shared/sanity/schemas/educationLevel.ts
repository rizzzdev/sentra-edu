import { defineType, defineField } from 'sanity';

export const educationLevelSchema = defineType({
  name: 'educationLevel',
  title: 'Jenjang Pendidikan',
  type: 'document',
  fields: [
    defineField({ name: 'levelName', title: 'Nama Jenjang', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'description', title: 'Deskripsi', type: 'text' })
  ]
});
