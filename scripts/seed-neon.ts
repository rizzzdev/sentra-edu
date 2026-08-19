/**
 * Neon Seed Script
 * Jalankan: npx tsx scripts/seed-neon.ts
 *
 * Memuat master data + 1 akun admin ke Neon PostgreSQL.
 */

import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import { randomUUID } from 'crypto';

dotenv.config();

const sql = neon(process.env.DATABASE_URL!);

const ts = new Date().toISOString();
const defaultTs = '2026-08-20T08:00:00.000Z';

function genId(prefix: string): string {
  return `${prefix}-${randomUUID().split('-')[0]}`;
}

async function tableCount(table: string): Promise<number> {
  const result = await sql.query(`SELECT count(*) as cnt FROM ${table}`);
  return Number(result[0].cnt);
}

async function seed() {
  console.log('🌱 Mulai seed data ke Neon PostgreSQL...\n');

  // ── 1. Education Levels ──
  console.log('📚 Jenjang Pendidikan:');
  const levels = [
    { id: 'lv-tk', levelName: 'TK', description: 'Calistung & kecerdasan dasar' },
    { id: 'lv-sd', levelName: 'SD', description: 'Pendampingan belajar SD' },
    { id: 'lv-smp', levelName: 'SMP', description: 'Persiapan ujian & masuk SMA' },
    { id: 'lv-sma', levelName: 'SMA', description: 'Persiapan UTBK / PTN' },
    { id: 'lv-khs', levelName: 'ALUMNI/KHUSUS', description: 'Mahasiswa & kursus khusus' }
  ];
  const countLevels = await tableCount('education_levels');
  if (countLevels === 0) {
    for (const l of levels) {
      await sql`INSERT INTO education_levels (id, level_name, description, created_at, updated_at) VALUES (${l.id}, ${l.levelName}, ${l.description}, ${defaultTs}, ${defaultTs})`;
      console.log(`  ✅ ${l.levelName}`);
    }
  } else {
    console.log(`  ⏭  ${countLevels} jenjang sudah ada.`);
  }

  // ── 2. Classes ──
  console.log('\n🏫 Kelas:');
  const classes = [
    { id: 'cl-sd-1', className: 'Kelas 1 SD', educationLevelId: 'lv-sd', baseRate: 110000, desc: '' },
    { id: 'cl-sd-6', className: 'Kelas 6 SD', educationLevelId: 'lv-sd', baseRate: 110000, desc: 'Persiapan ujian akhir SD' },
    { id: 'cl-smp-7', className: 'Kelas 7 SMP', educationLevelId: 'lv-smp', baseRate: 125000, desc: '' },
    { id: 'cl-smp-9', className: 'Kelas 9 SMP', educationLevelId: 'lv-smp', baseRate: 125000, desc: 'Persiapan ujian & masuk SMA' },
    { id: 'cl-sma-10', className: 'Kelas 10 SMA', educationLevelId: 'lv-sma', baseRate: 140000, desc: '' },
    { id: 'cl-sma-12', className: 'Kelas 12 SMA', educationLevelId: 'lv-sma', baseRate: 150000, desc: 'Persiapan UTBK / ujian akhir' }
  ];
  const countClasses = await tableCount('classes');
  if (countClasses === 0) {
    for (const c of classes) {
      await sql`INSERT INTO classes (id, class_name, education_level_id, base_rate_per_90min, description, created_at, updated_at) VALUES (${c.id}, ${c.className}, ${c.educationLevelId}, ${c.baseRate}, ${c.desc}, ${defaultTs}, ${defaultTs})`;
      console.log(`  ✅ ${c.className}`);
    }
  } else {
    console.log(`  ⏭  ${countClasses} kelas sudah ada.`);
  }

  // ── 3. Subjects ──
  console.log('\n📖 Mata Pelajaran:');
  const subjects = [
    { id: 'sj-mtk', name: 'Matematika', desc: 'Matematika dasar hingga lanjutan' },
    { id: 'sj-ing', name: 'Bahasa Inggris', desc: 'Grammar, speaking & TOEFL' },
    { id: 'sj-fis', name: 'Fisika', desc: 'Fisika SMP / SMA' },
    { id: 'sj-kim', name: 'Kimia', desc: 'Kimia SMA' },
    { id: 'sj-bio', name: 'Biologi', desc: 'Biologi SMA' },
    { id: 'sj-bindo', name: 'Bahasa Indonesia', desc: 'Bahasa Indonesia & sastra' }
  ];
  const countSubjects = await tableCount('subjects');
  if (countSubjects === 0) {
    for (const s of subjects) {
      await sql`INSERT INTO subjects (id, name, description, created_at, updated_at) VALUES (${s.id}, ${s.name}, ${s.desc}, ${defaultTs}, ${defaultTs})`;
      console.log(`  ✅ ${s.name}`);
    }
  } else {
    console.log(`  ⏭  ${countSubjects} mata pelajaran sudah ada.`);
  }

  // ── 4. Packages ──
  console.log('\n📦 Paket Les:');
  const packages = [
    { id: 'pkg-bulanan-private', name: 'Paket Bulanan Private', mode: 'PRIVATE', period: 'BULANAN', price: 1600000, sessions: 8, maxStu: 1, fee: 150000, desc: 'Les privat 1 guru 1 siswa, 8 pertemuan/bulan.' },
    { id: 'pkg-bulanan-kelompok', name: 'Paket Bulanan Kelompok', mode: 'KELOMPOK', period: 'BULANAN', price: 900000, sessions: 8, maxStu: 5, fee: 60000, desc: 'Les kelompok kecil (maks 5 siswa), 8 pertemuan/bulan.' },
    { id: 'pkg-harian-private', name: 'Paket Harian Private', mode: 'PRIVATE', period: 'HARIAN', price: 175000, sessions: 1, maxStu: 1, fee: 125000, desc: 'Les privat sekali pertemuan (90 menit).' },
    { id: 'pkg-intensif-utbk', name: 'Paket Intensif UTBK Private', mode: 'PRIVATE', period: 'BULANAN', price: 2400000, sessions: 12, maxStu: 1, fee: 180000, desc: 'Intensif persiapan UTBK, 12 pertemuan/bulan.' }
  ];
  const countPkgs = await tableCount('packages');
  if (countPkgs === 0) {
    for (const p of packages) {
      await sql`INSERT INTO packages (id, name, mode, period, price, sessions_per_period, max_students, tentor_fee, description, active, created_at, updated_at) VALUES (${p.id}, ${p.name}, ${p.mode}, ${p.period}, ${p.price}, ${p.sessions}, ${p.maxStu}, ${p.fee}, ${p.desc}, true, ${defaultTs}, ${defaultTs})`;
      console.log(`  ✅ ${p.name}`);
    }
  } else {
    console.log(`  ⏭  ${countPkgs} paket sudah ada.`);
  }

  // ── 5. Admin Account ──
  console.log('\n👤 Akun Admin:');
  const countUsers = await tableCount('users');
  if (countUsers === 0) {
    await sql`INSERT INTO users (id, email, password, full_name, phone, role, position, is_active, created_at, updated_at) VALUES ('u-admin', ${process.env.ADMIN_EMAIL || 'super@admin.com'}, ${process.env.ADMIN_PASSWORD || 'superadmin123'}, 'Admin Pusat', '0812-0000-0001', 'SUPER_ADMIN', 'Manajer Operasional Pusat', true, ${defaultTs}, ${defaultTs})`;
    console.log(`  ✅ Admin Pusat (${process.env.ADMIN_EMAIL || 'super@admin.com'})`);
  } else {
    console.log(`  ⏭  ${countUsers} user sudah ada.`);
  }

  console.log('\n🎉 Seed data selesai!');
  console.log('─────────────────────────────');
  console.log(`Database: Neon PostgreSQL`);
  console.log(`Admin   : ${process.env.ADMIN_EMAIL || 'super@admin.com'}`);
}

seed().catch((err) => {
  console.error('\n❌ Seed gagal:', err.message);
  process.exit(1);
});
