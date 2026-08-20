/**
 * Local PostgreSQL Seed Script
 * Jalankan: npx tsx scripts/seed-local.ts
 *
 * Seed admin user saja ke database PostgreSQL lokal.
 */

import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config({ override: true });

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL || !DATABASE_URL.includes('localhost')) {
	console.error('❌ DATABASE_URL harus mengarah ke PostgreSQL lokal (localhost)');
	process.exit(1);
}

const pool = new Pool({ connectionString: DATABASE_URL });

async function initTables() {
	console.log('🔧 Membuat tabel...');

	await pool.query(`
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
		)
	`);
	console.log('  ✅ users');
}

async function createAdminUser() {
	const email = process.env.ADMIN_EMAIL || 'super@admin.com';
	const password = process.env.ADMIN_PASSWORD || 'superadmin123';
	const hashedPassword = await bcrypt.hash(password, 10);

	const result = await pool.query(
		`
		INSERT INTO users (id, email, password, full_name, phone, role, position, is_active, created_at, updated_at)
		VALUES ('u-admin', $1, $2, 'Super Admin', '0812-0000-0001', 'SUPER_ADMIN', 'Manajer Operasional Pusat', true, NOW(), NOW())
		ON CONFLICT (email) DO UPDATE
		SET password = $2, role = 'SUPER_ADMIN', is_active = true, updated_at = NOW()
		RETURNING id, email, full_name, role
		`,
		[email, hashedPassword]
	);

	return result.rows[0];
}

async function seed() {
	console.log('🌱 Seeding admin user ke PostgreSQL lokal...\n');

	await initTables();
	const user = await createAdminUser();
	console.log('  ✅ Admin user:');
	console.log(`   Email    : ${user.email}`);
	console.log(`   Name     : ${user.full_name}`);
	console.log(`   Role     : ${user.role}`);
	console.log(`\n🎉 Seed selesai!`);
	console.log(`   Login dengan: ${user.email} / ${process.env.ADMIN_PASSWORD || 'superadmin123'}`);
}

seed()
	.catch((err) => {
		console.error('\n❌ Seed gagal:', err.message);
		process.exit(1);
	})
	.finally(() => pool.end());
