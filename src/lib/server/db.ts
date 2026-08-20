/**
 * Database Adapter
 *
 * Automatically detects the PostgreSQL driver based on DATABASE_URL:
 * - Local (localhost / 127.0.0.1 / ::1) → uses `pg` Pool (TCP connection)
 * - Remote/Neon (.neon.tech / .neon.branch / other) → uses `neon()` HTTP driver
 *
 * Both drivers expose the same `sql` tagged-template interface:
 *   const rows = await sql`SELECT * FROM users WHERE id = ${id}`;
 *   const rows = await sql.query('SELECT count(*) FROM users');
 */

import { Pool, type QueryResult, type QueryResultRow } from 'pg';
import { neon } from '@neondatabase/serverless';
import { DATABASE_URL } from '$env/static/private';

// ── Detect driver ────────────────────────────────────────
function isLocalDatabase(url: string): boolean {
	try {
		const parsed = new URL(url);
		const host = parsed.hostname.toLowerCase();
		return (
			host === 'localhost' ||
			host === '127.0.0.1' ||
			host === '::1' ||
			host === '[::1]'
		);
	} catch {
		return false;
	}
}

const useLocalPg = isLocalDatabase(DATABASE_URL);

// ── Build sql interface ──────────────────────────────────

/**
 * The neon() function returns a tagged-template executor:
 *   sql`SELECT ...`  →  Promise<Row[]>
 *   sql.query(sql, params?)  →  Promise<Row[]>
 *
 * We replicate this exact API using pg.Pool for local PostgreSQL.
 */
export type SqlParam = string | number | boolean | string[] | number[] | Date | null | undefined;

export let sql: {
	(strings: TemplateStringsArray, ...values: SqlParam[]): Promise<QueryResultRow[]>;
	query(text: string, values?: SqlParam[]): Promise<QueryResultRow[]>;
};

if (useLocalPg) {
	console.log('[DB] Using local PostgreSQL (pg driver)');
	const pool = new Pool({
		connectionString: DATABASE_URL,
		max: 20,
		idleTimeoutMillis: 30000,
		connectionTimeoutMillis: 5000
	});

	pool.on('error', (err) => {
		console.error('[DB] Unexpected pool error:', err.message);
	});

	const localSql = function localSql(
		strings: TemplateStringsArray,
		...values: SqlParam[]
	): Promise<QueryResultRow[]> {
		let query = '';
		const params: SqlParam[] = [];
		let paramIndex = 1;

		for (let stringIndex = 0; stringIndex < strings.length; stringIndex++) {
			query += strings[stringIndex];
			if (stringIndex < values.length) {
				query += `$${paramIndex}`;
				params.push(values[stringIndex]);
				paramIndex++;
			}
		}

		return pool.query(query, params).then((result: QueryResult) => result.rows);
	};

	localSql.query = function query(text: string, values?: SqlParam[]): Promise<QueryResultRow[]> {
		return pool.query(text, values).then((result: QueryResult) => result.rows);
	};

	sql = localSql;
} else {
	console.log('[DB] Using Neon PostgreSQL (HTTP driver)');
	const neonClient = neon(DATABASE_URL);
	const remoteSql = function remoteSql(strings: TemplateStringsArray, ...values: SqlParam[]): Promise<QueryResultRow[]> {
		return neonClient(strings, ...values) as Promise<QueryResultRow[]>;
	};
	remoteSql.query = function query(text: string, values?: SqlParam[]): Promise<QueryResultRow[]> {
		return neonClient.query(text, values) as Promise<QueryResultRow[]>;
	};
	sql = remoteSql;
}

// ── Schema initialization ────────────────────────────────

/**
 * Initialize database tables.
 * Run once on first server start.
 */
export async function initDatabase() {
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
      school TEXT,
      address TEXT,
      occupation TEXT,
      wali_user_id TEXT REFERENCES users(id),
      is_active BOOLEAN DEFAULT TRUE,
      candidate_status TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      deleted_at TIMESTAMPTZ
    );

    CREATE TABLE IF NOT EXISTS education_levels (
      id TEXT PRIMARY KEY,
      level_name TEXT NOT NULL,
      description TEXT DEFAULT '',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      deleted_at TIMESTAMPTZ
    );

    CREATE TABLE IF NOT EXISTS classes (
      id TEXT PRIMARY KEY,
      class_name TEXT NOT NULL,
      education_level_id TEXT REFERENCES education_levels(id),
      base_rate_per_90min INTEGER DEFAULT 0,
      description TEXT DEFAULT '',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      deleted_at TIMESTAMPTZ
    );

    CREATE TABLE IF NOT EXISTS subjects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      deleted_at TIMESTAMPTZ
    );

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
    );

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
    );

    CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      class_id TEXT REFERENCES classes(id),
      class_ids TEXT[] DEFAULT '{}',
      subject_id TEXT REFERENCES subjects(id),
      subject_ids TEXT[] DEFAULT '{}',
      package_id TEXT REFERENCES packages(id),
      job_mode TEXT DEFAULT 'OFFLINE',
      tentor_fee INTEGER DEFAULT 0,
      transport_allowance INTEGER DEFAULT 0,
      session_duration_minutes INTEGER DEFAULT 90,
      schedule_days TEXT[] DEFAULT '{}',
      schedule_time TEXT DEFAULT '',
      schedule_end_time TEXT DEFAULT '',
      student_count INTEGER DEFAULT 1,
      location TEXT DEFAULT '',
      latitude DOUBLE PRECISION,
      longitude DOUBLE PRECISION,
      status TEXT DEFAULT 'AVAILABLE',
      assigned_tentor_id TEXT REFERENCES users(id),
      student_id TEXT REFERENCES users(id),
      student_ids TEXT[] DEFAULT '{}',
      student_names TEXT[] DEFAULT '{}',
      enrollment_id TEXT REFERENCES enrollments(id),
      notes TEXT DEFAULT '',
      additional_notes TEXT DEFAULT '',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      deleted_at TIMESTAMPTZ
    );

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
    );

    CREATE TABLE IF NOT EXISTS attendances (
      id TEXT PRIMARY KEY,
      job_id TEXT REFERENCES jobs(id),
      enrollment_id TEXT REFERENCES enrollments(id),
      tentor_id TEXT REFERENCES users(id),
      subject_ids TEXT[] DEFAULT '{}',
      class_ids TEXT[] DEFAULT '{}',
      student_ids TEXT[] DEFAULT '{}',
      student_names TEXT[] DEFAULT '{}',
      session_date DATE,
      start_time TEXT DEFAULT '',
      end_time TEXT DEFAULT '',
      duration_minutes INTEGER DEFAULT 90,
      sessions_count DOUBLE PRECISION DEFAULT 1,
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
    );

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
    );

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
    );

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
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id),
      title TEXT DEFAULT '',
      message TEXT DEFAULT '',
      icon TEXT DEFAULT 'notifications',
      read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

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
    );

    ALTER TABLE jobs DROP COLUMN IF EXISTS job_type;
    ALTER TABLE attendances ADD COLUMN IF NOT EXISTS job_id TEXT REFERENCES jobs(id);
    ALTER TABLE attendances ADD COLUMN IF NOT EXISTS subject_ids TEXT[] DEFAULT '{}';
    ALTER TABLE attendances ADD COLUMN IF NOT EXISTS class_ids TEXT[] DEFAULT '{}';
    ALTER TABLE attendances ADD COLUMN IF NOT EXISTS student_ids TEXT[] DEFAULT '{}';
    ALTER TABLE attendances ADD COLUMN IF NOT EXISTS student_names TEXT[] DEFAULT '{}';
    ALTER TABLE attendances ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 90;
    ALTER TABLE attendances ADD COLUMN IF NOT EXISTS sessions_count DOUBLE PRECISION DEFAULT 1;
  `;
}
