/**
 * Neon Init Script
 * Jalankan: npx tsx scripts/init-neon.ts
 *
 * Membuat semua tabel di Neon PostgreSQL.
 */

import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL!);

async function init() {
  console.log('🔧 Membuat tabel di Neon PostgreSQL...\n');

  await sql`
    CREATE TABLE IF NOT EXISTS education_levels (
      id TEXT PRIMARY KEY,
      level_name TEXT NOT NULL,
      description TEXT DEFAULT '',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      deleted_at TIMESTAMPTZ
    )`;

  await sql`
    CREATE TABLE IF NOT EXISTS classes (
      id TEXT PRIMARY KEY,
      class_name TEXT NOT NULL,
      education_level_id TEXT REFERENCES education_levels(id),
      base_rate_per_90min INTEGER DEFAULT 0,
      description TEXT DEFAULT '',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      deleted_at TIMESTAMPTZ
    )`;

  await sql`
    CREATE TABLE IF NOT EXISTS subjects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      deleted_at TIMESTAMPTZ
    )`;

  await sql`
    CREATE TABLE IF NOT EXISTS packages (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      mode TEXT DEFAULT 'PRIVATE',
      period TEXT DEFAULT 'BULANAN',
      price INTEGER DEFAULT 0,
      sessions_per_period INTEGER DEFAULT 1,
      max_students INTEGER DEFAULT 1,
      tentor_fee INTEGER DEFAULT 0,
      description TEXT DEFAULT '',
      active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      deleted_at TIMESTAMPTZ
    )`;

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password TEXT,
      full_name TEXT NOT NULL,
      phone TEXT DEFAULT '',
      role TEXT NOT NULL DEFAULT 'STUDENT',
      position TEXT,
      education TEXT,
      experience_years INTEGER,
      subject_ids TEXT[] DEFAULT '{}',
      level_ids TEXT[] DEFAULT '{}',
      school TEXT,
      address TEXT,
      occupation TEXT,
      wali_user_id TEXT REFERENCES users(id),
      is_active BOOLEAN DEFAULT TRUE,
      candidate_status TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      deleted_at TIMESTAMPTZ
    )`;

  await sql`
    CREATE TABLE IF NOT EXISTS enrollments (
      id TEXT PRIMARY KEY,
      student_id TEXT REFERENCES users(id),
      subject_id TEXT REFERENCES subjects(id),
      class_id TEXT REFERENCES classes(id),
      package_id TEXT REFERENCES packages(id),
      tentor_id TEXT REFERENCES users(id),
      schedule_day TEXT DEFAULT '',
      schedule_time TEXT DEFAULT '',
      status TEXT DEFAULT 'ACTIVE',
      address TEXT,
      latitude DOUBLE PRECISION,
      longitude DOUBLE PRECISION,
      wali_user_id TEXT REFERENCES users(id),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      deleted_at TIMESTAMPTZ
    )`;

  await sql`
    CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      class_id TEXT REFERENCES classes(id),
      subject_id TEXT REFERENCES subjects(id),
      package_id TEXT REFERENCES packages(id),
      job_mode TEXT DEFAULT 'OFFLINE',
      tentor_fee INTEGER DEFAULT 0,
      session_duration_minutes INTEGER DEFAULT 90,
      schedule_days TEXT[] DEFAULT '{}',
      schedule_time TEXT DEFAULT '',
      student_count INTEGER DEFAULT 1,
      location TEXT DEFAULT '',
      latitude DOUBLE PRECISION,
      longitude DOUBLE PRECISION,
      status TEXT DEFAULT 'AVAILABLE',
      assigned_tentor_id TEXT REFERENCES users(id),
      student_id TEXT REFERENCES users(id),
      enrollment_id TEXT REFERENCES enrollments(id),
      notes TEXT DEFAULT '',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      deleted_at TIMESTAMPTZ
    )`;

  await sql`ALTER TABLE jobs DROP COLUMN IF EXISTS job_type;`;

  await sql`
    CREATE TABLE IF NOT EXISTS applications (
      id TEXT PRIMARY KEY,
      job_id TEXT REFERENCES jobs(id),
      tentor_id TEXT REFERENCES users(id),
      status TEXT DEFAULT 'PENDING',
      applied_at TIMESTAMPTZ DEFAULT NOW(),
      notes TEXT DEFAULT '',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      deleted_at TIMESTAMPTZ
    )`;

  await sql`
    CREATE TABLE IF NOT EXISTS attendances (
      id TEXT PRIMARY KEY,
      enrollment_id TEXT REFERENCES enrollments(id),
      tentor_id TEXT REFERENCES users(id),
      session_date DATE,
      start_time TEXT DEFAULT '',
      end_time TEXT DEFAULT '',
      topic TEXT DEFAULT '',
      student_notes TEXT DEFAULT '',
      status TEXT DEFAULT 'SUBMITTED',
      latitude_check_in DOUBLE PRECISION,
      longitude_check_in DOUBLE PRECISION,
      is_radius_valid BOOLEAN DEFAULT FALSE,
      proof_photo_url TEXT,
      student_confirmed BOOLEAN DEFAULT FALSE,
      student_rating INTEGER,
      student_feedback TEXT,
      review_notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      deleted_at TIMESTAMPTZ
    )`;

  await sql`
    CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY,
      enrollment_id TEXT REFERENCES enrollments(id),
      invoice_number TEXT NOT NULL,
      amount INTEGER DEFAULT 0,
      due_date DATE,
      status TEXT DEFAULT 'UNPAID',
      paid_at TIMESTAMPTZ,
      payment_proof_url TEXT,
      period_month INTEGER,
      period_year INTEGER,
      notes TEXT DEFAULT '',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      deleted_at TIMESTAMPTZ
    )`;

  await sql`
    CREATE TABLE IF NOT EXISTS payroll_claims (
      id TEXT PRIMARY KEY,
      tentor_id TEXT REFERENCES users(id),
      claim_number TEXT NOT NULL,
      period_start DATE,
      period_end DATE,
      period_month INTEGER,
      period_year INTEGER,
      total_amount INTEGER DEFAULT 0,
      attendance_ids TEXT[] DEFAULT '{}',
      status TEXT DEFAULT 'REQUESTED',
      paid_at TIMESTAMPTZ,
      transfer_proof_url TEXT,
      rejection_reason TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      deleted_at TIMESTAMPTZ
    )`;

  await sql`
    CREATE TABLE IF NOT EXISTS candidates (
      id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT DEFAULT '',
      education TEXT DEFAULT '',
      experience_years INTEGER DEFAULT 0,
      subject_ids TEXT[] DEFAULT '{}',
      level_ids TEXT[] DEFAULT '{}',
      cv_url TEXT,
      status TEXT DEFAULT 'REGISTERED',
      notes TEXT DEFAULT '',
      interview_date TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      deleted_at TIMESTAMPTZ
    )`;

  await sql`
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id),
      title TEXT DEFAULT '',
      message TEXT DEFAULT '',
      icon TEXT DEFAULT 'notifications',
      read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`;

  await sql`
    CREATE TABLE IF NOT EXISTS magic_links (
      id TEXT PRIMARY KEY,
      token TEXT NOT NULL,
      title TEXT DEFAULT '',
      days_valid INTEGER DEFAULT 7,
      expires_at TIMESTAMPTZ,
      used_count INTEGER DEFAULT 0,
      active BOOLEAN DEFAULT TRUE,
      target_role TEXT,
      class_id TEXT REFERENCES classes(id),
      package_id TEXT REFERENCES packages(id),
      created_by TEXT REFERENCES users(id),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      deleted_at TIMESTAMPTZ
    )`;

  console.log('✅ Semua tabel berhasil dibuat!');
}

init().catch((err) => {
  console.error('❌ Init gagal:', err.message);
  process.exit(1);
});
