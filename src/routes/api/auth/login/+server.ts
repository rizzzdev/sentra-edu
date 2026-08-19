import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { sql } from '$lib/server/db';
import { mapUserRow } from '$lib/server/api-helpers';
import bcrypt from 'bcryptjs';

/** POST /api/auth/login — login with bcrypt + session cookie */
export const POST: RequestHandler = async ({ request, cookies }) => {
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

    // Verify password with bcrypt
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return json({ error: true, statusCode: 401, message: 'Email atau password salah.', data: null }, { status: 401 });
    }

    if (user.is_active === false) {
      return json({ error: true, statusCode: 403, message: 'Akun belum aktif. Hubungi admin.', data: null }, { status: 403 });
    }

    // Create session token
    const sessionToken = crypto.randomUUID();
    const sessionExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Store session in cookie (httpOnly, secure in production)
    cookies.set('session', sessionToken, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      expires: sessionExpiry
    });

    // Store user ID in a separate readable cookie for client-side auth check
    cookies.set('session_user', JSON.stringify({
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role
    }), {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      expires: sessionExpiry
    });

    // Store session in DB (optional, for session management)
    await sql`INSERT INTO notifications (id, user_id, title, message, icon) VALUES (${crypto.randomUUID()}, ${user.id}, 'Login', 'Anda baru saja login ke sistem.', 'login')`;

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
