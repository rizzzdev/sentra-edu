import { defineType, defineField } from 'sanity';

export const notificationSchema = defineType({
  name: 'notification',
  title: 'Notifikasi',
  type: 'document',
  fields: [
    defineField({ name: 'user', title: 'User', type: 'reference', to: [{ type: 'user' }], validation: (r) => r.required() }),
    defineField({ name: 'title', title: 'Judul', type: 'string' }),
    defineField({ name: 'message', title: 'Pesan', type: 'text' }),
    defineField({ name: 'icon', title: 'Icon', type: 'string' }),
    defineField({ name: 'read', title: 'Sudah Dibaca', type: 'boolean', initialValue: false })
  ]
});
