import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { sql } from '$lib/server/db';
import { mapUserRow } from '$lib/server/api-helpers';

/** POST /api/auth/login */
export const POST: RequestHandler = async ({ request }) => {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return json({ error: true, statusCode: 400, message: 'Email dan password wajib diisi.', data: null }, { status: 400 });
    }

    const rows = await sql`SELECT * FROM users WHERE email = ${email.toLowerCase().trim()} AND deleted_at IS NULL LIMIT 1`;

    if (rows.length === 0) {
      return json({ error: true, statusCode: 401, message: 'Email atau password salah.', data: null }, { status: 401 });
    }

    const user = rows[0];

    if (user.password !== password) {
      return json({ error: true, statusCode: 401, message: 'Email atau password salah.', data: null }, { status: 401 });
    }

    if (user.is_active === false) {
      return json({ error: true, statusCode: 403, message: 'Akun belum aktif. Hubungi admin untuk mengaktifkan akun Anda.', data: null }, { status: 403 });
    }

    return json({
      error: false,
      statusCode: 200,
      message: 'Login berhasil.',
      data: mapUserRow(user)
    });
  } catch (err: any) {
    console.error('[API] /api/auth/login error:', err.message);
    return json({ error: true, statusCode: 500, message: err.message, data: null }, { status: 500 });
  }
};
