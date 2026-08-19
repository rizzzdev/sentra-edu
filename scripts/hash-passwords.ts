import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();
const sql = neon(process.env.DATABASE_URL!);

async function fix() {
  const rows = await sql`SELECT id, email, password FROM users`;
  for (const r of rows) {
    if (r.password && !r.password.startsWith('$2')) {
      const hashed = await bcrypt.hash(r.password, 10);
      await sql`UPDATE users SET password = ${hashed} WHERE id = ${r.id}`;
      console.log('✅ Hashed:', r.email, '→', hashed.substring(0, 15) + '...');
    } else if (r.password) {
      console.log('⏭ Already hashed:', r.email);
    }
  }
  console.log('\nDone!');
}

fix().catch((e) => { console.error('Error:', e.message); process.exit(1); });
