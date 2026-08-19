import { defineType, defineField } from 'sanity';

export const classLevelSchema = defineType({
  name: 'classLevel',
  title: 'Kelas',
  type: 'document',
  fields: [
    defineField({ name: 'className', title: 'Nama Kelas', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'educationLevel', title: 'Jenjang', type: 'reference', to: [{ type: 'educationLevel' }] }),
    defineField({ name: 'baseRatePer90Min', title: 'Tarif Dasar/90min', type: 'number' }),
    defineField({ name: 'description', title: 'Deskripsi', type: 'text' })
  ]
});
