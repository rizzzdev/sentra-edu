/**
 * Sanity Seed Script
 * Jalankan: npx tsx scripts/seed-sanity.ts
 *
 * Memuat master data + 1 akun admin ke Sanity.
 * Aman dijalankan berulang kali — skip jika data sudah ada.
 */

import { createClient } from '@sanity/client';
import * as dotenv from 'dotenv';

dotenv.config();

const client = createClient({
  projectId: process.env.PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2026-08-20',
  useCdn: false,
  token: process.env.SANITY_AUTH_TOKEN!
});

// ── Helpers ──────────────────────────────────────────────

async function getExistingIds(type: string, nameField: string): Promise<Map<string, string>> {
  const docs = await client.fetch<any[]>(`*[_type == "${type}"]{ _id, ${nameField} }`);
  const map = new Map<string, string>();
  for (const doc of docs) {
    const name = doc[nameField];
    if (name) map.set(name, doc._id.replace('drafts.', ''));
  }
  return map;
}

async function createIfEmpty(type: string, doc: any, key?: string): Promise<string | null> {
  const nameField = Object.keys(doc).find((k) => ['levelName', 'className', 'name', 'fullName', 'email'].includes(k));
  const fieldValue = nameField ? doc[nameField] : undefined;

  if (fieldValue) {
    const existing = await getExistingIds(type, nameField!);
    if (existing.has(fieldValue)) {
      const id = existing.get(fieldValue)!;
      console.log(`  ⏭  ${type} "${fieldValue}" sudah ada (${id}).`);
      return id;
    }
  } else {
    const count = await client.fetch<number>(`count(*[_type == "${type}"])`);
    if (count > 0) {
      console.log(`  ⏭  ${type} sudah ada, skip.`);
      return null;
    }
  }

  const result = await client.create(doc);
  console.log(`  ✅ ${type}: ${fieldValue || result._id}`);
  return result._id;
}

// ── Seed Data ────────────────────────────────────────────

async function seed() {
  console.log('🌱 Mulai seed data ke Sanity...\n');

  // ── 1. Education Levels ──
  console.log('📚 Jenjang Pendidikan:');
  const lvTk = await createIfEmpty('educationLevel', {
    _type: 'educationLevel',
    levelName: 'TK',
    description: 'Calistung & kecerdasan dasar'
  });
  const lvSd = await createIfEmpty('educationLevel', {
    _type: 'educationLevel',
    levelName: 'SD',
    description: 'Pendampingan belajar SD'
  });
  const lvSmp = await createIfEmpty('educationLevel', {
    _type: 'educationLevel',
    levelName: 'SMP',
    description: 'Persiapan ujian & masuk SMA'
  });
  const lvSma = await createIfEmpty('educationLevel', {
    _type: 'educationLevel',
    levelName: 'SMA',
    description: 'Persiapan UTBK / PTN'
  });
  const lvKhs = await createIfEmpty('educationLevel', {
    _type: 'educationLevel',
    levelName: 'ALUMNI/KHUSUS',
    description: 'Mahasiswa & kursus khusus'
  });

  // Resolve refs
  const levels = await getExistingIds('educationLevel', 'levelName');
  const refLv = (name: string) => ({ _type: 'reference' as const, _ref: levels.get(name)! });

  // ── 2. Classes ──
  console.log('\n🏫 Kelas:');
  await createIfEmpty('classLevel', {
    _type: 'classLevel',
    className: 'Kelas 1 SD',
    educationLevel: refLv('SD'),
    baseRatePer90Min: 110000,
    description: ''
  });
  await createIfEmpty('classLevel', {
    _type: 'classLevel',
    className: 'Kelas 6 SD',
    educationLevel: refLv('SD'),
    baseRatePer90Min: 110000,
    description: 'Persiapan ujian akhir SD'
  });
  await createIfEmpty('classLevel', {
    _type: 'classLevel',
    className: 'Kelas 7 SMP',
    educationLevel: refLv('SMP'),
    baseRatePer90Min: 125000,
    description: ''
  });
  await createIfEmpty('classLevel', {
    _type: 'classLevel',
    className: 'Kelas 9 SMP',
    educationLevel: refLv('SMP'),
    baseRatePer90Min: 125000,
    description: 'Persiapan ujian & masuk SMA'
  });
  await createIfEmpty('classLevel', {
    _type: 'classLevel',
    className: 'Kelas 10 SMA',
    educationLevel: refLv('SMA'),
    baseRatePer90Min: 140000,
    description: ''
  });
  await createIfEmpty('classLevel', {
    _type: 'classLevel',
    className: 'Kelas 12 SMA',
    educationLevel: refLv('SMA'),
    baseRatePer90Min: 150000,
    description: 'Persiapan UTBK / ujian akhir'
  });

  // ── 3. Subjects ──
  console.log('\n📖 Mata Pelajaran:');
  await createIfEmpty('subject', {
    _type: 'subject',
    name: 'Matematika',
    description: 'Matematika dasar hingga lanjutan'
  });
  await createIfEmpty('subject', {
    _type: 'subject',
    name: 'Bahasa Inggris',
    description: 'Grammar, speaking & TOEFL'
  });
  await createIfEmpty('subject', {
    _type: 'subject',
    name: 'Fisika',
    description: 'Fisika SMP / SMA'
  });
  await createIfEmpty('subject', {
    _type: 'subject',
    name: 'Kimia',
    description: 'Kimia SMA'
  });
  await createIfEmpty('subject', {
    _type: 'subject',
    name: 'Biologi',
    description: 'Biologi SMA'
  });
  await createIfEmpty('subject', {
    _type: 'subject',
    name: 'Bahasa Indonesia',
    description: 'Bahasa Indonesia & sastra'
  });

  // ── 4. Packages ──
  console.log('\n📦 Paket Les:');
  await createIfEmpty('packagePlan', {
    _type: 'packagePlan',
    name: 'Paket Bulanan Private',
    mode: 'PRIVATE',
    period: 'BULANAN',
    price: 1600000,
    sessionsPerPeriod: 8,
    maxStudents: 1,
    tentorFee: 150000,
    description: 'Les privat 1 guru 1 siswa, 8 pertemuan per bulan (90 menit/sesi).',
    active: true
  });
  await createIfEmpty('packagePlan', {
    _type: 'packagePlan',
    name: 'Paket Bulanan Kelompok',
    mode: 'KELOMPOK',
    period: 'BULANAN',
    price: 900000,
    sessionsPerPeriod: 8,
    maxStudents: 5,
    tentorFee: 60000,
    description: 'Les kelompok kecil (maks 5 siswa), 8 pertemuan per bulan (90 menit/sesi).',
    active: true
  });
  await createIfEmpty('packagePlan', {
    _type: 'packagePlan',
    name: 'Paket Harian Private',
    mode: 'PRIVATE',
    period: 'HARIAN',
    price: 175000,
    sessionsPerPeriod: 1,
    maxStudents: 1,
    tentorFee: 125000,
    description: 'Les privat sekali pertemuan (90 menit) — bayar per sesi.',
    active: true
  });
  await createIfEmpty('packagePlan', {
    _type: 'packagePlan',
    name: 'Paket Intensif UTBK Private (Bulanan)',
    mode: 'PRIVATE',
    period: 'BULANAN',
    price: 2400000,
    sessionsPerPeriod: 12,
    maxStudents: 1,
    tentorFee: 180000,
    description: 'Intensif persiapan UTBK, 12 pertemuan per bulan (90 menit/sesi).',
    active: true
  });

  // ── 5. Admin Account ──
  console.log('\n👤 Akun Admin:');
  await createIfEmpty('user', {
    _type: 'user',
    email: process.env.ADMIN_EMAIL || 'super@admin.com',
    password: process.env.ADMIN_PASSWORD || 'superadmin123',
    fullName: 'Admin Pusat',
    phone: '0812-0000-0001',
    role: 'SUPER_ADMIN',
    position: 'Manajer Operasional Pusat',
    isActive: true
  });

  console.log('\n🎉 Seed data selesai!');
  console.log('─────────────────────────────');
  console.log(`Project : ${process.env.PUBLIC_SANITY_PROJECT_ID}`);
  console.log(`Dataset : ${process.env.PUBLIC_SANITY_DATASET}`);
  console.log(`Admin   : ${process.env.ADMIN_EMAIL || 'super@admin.com'}`);
}

seed().catch((err) => {
  console.error('\n❌ Seed gagal:', err.message);
  process.exit(1);
});
