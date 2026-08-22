import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { userService, notificationService, checkRateLimit, isValidEmail } from '$lib/server';

function getClientIp(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || '127.0.0.1';
}

export const POST: RequestHandler = async ({ request, cookies }) => {
  try {
    const ip = getClientIp(request);
    const { allowed, remaining } = checkRateLimit(ip, 'login');
    if (!allowed) {
      return json(
        { error: true, statusCode: 429, message: 'Terlalu banyak percobaan login. Silakan coba lagi dalam 15 menit.', data: null },
        { status: 429, headers: { 'Retry-After': '900', 'X-RateLimit-Remaining': '0' } }
      );
    }

    let body: { email?: string; password?: string };
    try { body = (await request.json()) as any; } catch {
      return json({ error: true, statusCode: 400, message: 'Request body harus JSON.', data: null }, { status: 400 });
    }

    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (!email || !password) return json({ error: true, statusCode: 400, message: 'Email dan password wajib diisi.', data: null }, { status: 400 });
    if (!isValidEmail(email)) return json({ error: true, statusCode: 400, message: 'Format email tidak valid.', data: null }, { status: 400 });
    if (password.length > 128) return json({ error: true, statusCode: 400, message: 'Password terlalu panjang.', data: null }, { status: 400 });

    const userResult = await userService.findByEmail(email);
    if (userResult.error || !userResult.data) {
      return json({ error: true, statusCode: 401, message: 'Email atau password salah.', data: null }, { status: 401, headers: { 'X-RateLimit-Remaining': String(remaining) } });
    }

    const user = userResult.data as any;
    const passwordMatch = await userService.verifyPassword(password, user.password || '');
    if (!passwordMatch) {
      return json({ error: true, statusCode: 401, message: 'Email atau password salah.', data: null }, { status: 401, headers: { 'X-RateLimit-Remaining': String(remaining) } });
    }

    if (user.isActive === false) {
      return json({ error: true, statusCode: 403, message: 'Akun belum aktif. Hubungi admin.', data: null }, { status: 403 });
    }

    const sessionToken = crypto.randomUUID();
    const sessionExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const isSecure = request.headers.get('x-forwarded-proto') === 'https' || (typeof location !== 'undefined' && location.protocol === 'https:');

    cookies.set('session', sessionToken, { path: '/', httpOnly: true, secure: isSecure, sameSite: 'lax', expires: sessionExpiry });
    cookies.set('session_user', JSON.stringify({ id: user.id, email: user.email, fullName: user.fullName, role: user.role }), { path: '/', httpOnly: false, secure: isSecure, sameSite: 'lax', expires: sessionExpiry });

    // Log login
    await notificationService.create({
      userId: user.id, title: 'Login', message: 'Anda baru saja login ke sistem.', icon: 'login'
    });

    const { password: _, ...safeUser } = user;
    return json({ error: false, statusCode: 200, message: 'Login berhasil.', data: safeUser }, { headers: { 'X-RateLimit-Remaining': String(remaining) } });
  } catch {
    return json({ error: true, statusCode: 500, message: 'Terjadi kesalahan server.', data: null }, { status: 500 });
  }
};
