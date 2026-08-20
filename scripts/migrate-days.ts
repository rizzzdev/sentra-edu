import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config({ override: true });

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL tidak ditemukan di .env');
  process.exit(1);
}

const pool = new Pool({ connectionString: DATABASE_URL });

const DAY_CONVERSION: Record<string, string> = {
  'senin': 'MONDAY',
  'selasa': 'TUESDAY',
  'rabu': 'WEDNESDAY',
  'kamis': 'THURSDAY',
  'jumat': 'FRIDAY',
  'sabtu': 'SATURDAY',
  'minggu': 'SUNDAY',
  'monday': 'MONDAY',
  'tuesday': 'TUESDAY',
  'wednesday': 'WEDNESDAY',
  'thursday': 'THURSDAY',
  'friday': 'FRIDAY',
  'saturday': 'SATURDAY',
  'sunday': 'SUNDAY',
  'mon': 'MONDAY',
  'tue': 'TUESDAY',
  'wed': 'WEDNESDAY',
  'thu': 'THURSDAY',
  'fri': 'FRIDAY',
  'sat': 'SATURDAY',
  'sun': 'SUNDAY'
};

function normalizeDay(day: string): string {
  const clean = day.trim().toLowerCase();
  return DAY_CONVERSION[clean] || day.trim().toUpperCase();
}

function normalizeDayArray(days: string | string[] | null | undefined): string[] {
  if (!days) return ['MONDAY'];
  if (Array.isArray(days)) {
    return days.map((d) => normalizeDay(String(d))).filter(Boolean);
  }
  if (typeof days === 'string') {
    // might be comma-separated
    return days.split(/[,&]/).map((d) => normalizeDay(d)).filter(Boolean);
  }
  return ['MONDAY'];
}

async function run() {
  console.log('🔄 Memeriksa dan memperbarui data hari di database...');

  // 1. Update jobs.schedule_days
  const jobsRes = await pool.query('SELECT id, title, schedule_days FROM jobs WHERE deleted_at IS NULL');
  console.log(`📦 Ditemukan ${jobsRes.rows.length} data lowongan.`);

  let updatedJobsCount = 0;
  for (const row of jobsRes.rows) {
    const original = row.schedule_days;
    const normalized = normalizeDayArray(original);
    
    // Check if changed
    const origStr = Array.isArray(original) ? original.join(',') : String(original);
    const normStr = normalized.join(',');
    if (origStr !== normStr) {
      await pool.query('UPDATE jobs SET schedule_days = $1, updated_at = NOW() WHERE id = $2', [normalized, row.id]);
      console.log(`  ✅ Job [${row.id}] "${row.title}": [${origStr}] ➔ [${normStr}]`);
      updatedJobsCount++;
    }
  }

  // 2. Update enrollments.schedule_day
  const enrRes = await pool.query('SELECT id, schedule_day FROM enrollments WHERE deleted_at IS NULL');
  console.log(`📋 Ditemukan ${enrRes.rows.length} data enrollment.`);

  let updatedEnrCount = 0;
  for (const row of enrRes.rows) {
    if (!row.schedule_day) continue;
    const normalizedArr = normalizeDayArray(row.schedule_day);
    const normalizedStr = normalizedArr.join(', ');
    if (row.schedule_day !== normalizedStr && normalizedArr.length > 0) {
      await pool.query('UPDATE enrollments SET schedule_day = $1, updated_at = NOW() WHERE id = $2', [normalizedArr[0], row.id]);
      console.log(`  ✅ Enrollment [${row.id}]: "${row.schedule_day}" ➔ "${normalizedArr[0]}"`);
      updatedEnrCount++;
    }
  }

  console.log(`\n🎉 Selesai! ${updatedJobsCount} lowongan dan ${updatedEnrCount} enrollment berhasil distandarkan ke bahasa Inggris.`);
}

run()
  .catch((err) => {
    console.error('❌ Terjadi kesalahan:', err.message);
    process.exit(1);
  })
  .finally(() => pool.end());
