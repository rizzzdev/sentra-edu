import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { sql } from '$lib/server/db';
import { mapUserRow } from '$lib/server/api-helpers';
import bcrypt from 'bcryptjs';
import { isValidEmail, sanitizeInput, checkRateLimit } from '$lib/server/security';

function getClientIp(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || '127.0.0.1';
}

/** POST /api/auth/login — login with bcrypt + session cookie */
export const POST: RequestHandler = async ({ request, cookies }) => {
  try {
    // 1. Rate limit check
    const ip = getClientIp(request);
    const { allowed, remaining } = checkRateLimit(ip, 'login');
    if (!allowed) {
      return json(
        { error: true, statusCode: 429, message: 'Terlalu banyak percobaan login. Silakan coba lagi dalam 15 menit.', data: null },
        { status: 429, headers: { 'Retry-After': '900', 'X-RateLimit-Remaining': '0' } }
      );
    }

    // 2. Parse + validate input
    let body: any;
    try {
      body = await request.json();
    } catch {
      return json({ error: true, statusCode: 400, message: 'Request body harus JSON.', data: null }, { status: 400 });
    }

    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (!email || !password) {
      return json({ error: true, statusCode: 400, message: 'Email dan password wajib diisi.', data: null }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return json({ error: true, statusCode: 400, message: 'Format email tidak valid.', data: null }, { status: 400 });
    }

    if (password.length > 128) {
      return json({ error: true, statusCode: 400, message: 'Password terlalu panjang.', data: null }, { status: 400 });
    }

    // 3. Find user
    const rows = await sql`SELECT * FROM users WHERE email = ${email} AND deleted_at IS NULL LIMIT 1`;

    if (rows.length === 0) {
      // Use same error message to prevent email enumeration
      return json(
        { error: true, statusCode: 401, message: 'Email atau password salah.', data: null },
        { status: 401, headers: { 'X-RateLimit-Remaining': String(remaining) } }
      );
    }

    const user = rows[0];

    // 4. Verify password with bcrypt
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return json(
        { error: true, statusCode: 401, message: 'Email atau password salah.', data: null },
        { status: 401, headers: { 'X-RateLimit-Remaining': String(remaining) } }
      );
    }

    // 5. Check account active
    if (user.is_active === false) {
      return json(
        { error: true, statusCode: 403, message: 'Akun belum aktif. Hubungi admin.', data: null },
        { status: 403 }
      );
    }

    // 6. Create session
    const sessionToken = crypto.randomUUID();
    const sessionExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    cookies.set('session', sessionToken, {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      expires: sessionExpiry
    });

    cookies.set('session_user', JSON.stringify({
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role
    }), {
      path: '/',
      httpOnly: false,
      secure: true,
      sameSite: 'lax',
      expires: sessionExpiry
    });

    // 7. Log login activity
    await sql`INSERT INTO notifications (id, user_id, title, message, icon) VALUES (${crypto.randomUUID()}, ${user.id}, 'Login', 'Anda baru saja login ke sistem.', 'login')`;

    return json({
      error: false,
      statusCode: 200,
      message: 'Login berhasil.',
      data: mapUserRow(user)
    }, {
      headers: { 'X-RateLimit-Remaining': String(remaining) }
    });
  } catch (err_raw) { const err = err_raw as Error;
    console.error('[API] /api/auth/login error:', err.message);
    return json({ error: true, statusCode: 500, message: 'Terjadi kesalahan server.', data: null }, { status: 500 });
  }
};
