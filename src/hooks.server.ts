import type { Handle } from '@sveltejs/kit';
import { initDatabase, sql } from '$lib/server/db';
import { checkRateLimit } from '$lib/server/security';
import bcrypt from 'bcryptjs';
import { ADMIN_EMAIL, ADMIN_PASSWORD } from '$env/static/private';

let dbInitialized = false;

function getClientIp(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || '127.0.0.1';
}

export const handle: Handle = async ({ event, resolve }) => {
  // 1. Init DB tables on first request
  if (!dbInitialized) {
    try {
      await initDatabase();
      dbInitialized = true;
      console.log('[SentraEdu] Neon database initialized.');

      // Seed admin user
      if (ADMIN_EMAIL && ADMIN_PASSWORD) {
        const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
        await sql`
          INSERT INTO users (id, email, password, full_name, role, is_active)
          VALUES ('u-admin', ${ADMIN_EMAIL}, ${hashedPassword}, 'Super Admin', 'SUPER_ADMIN', true)
          ON CONFLICT (email) DO UPDATE 
          SET password = ${hashedPassword}, role = 'SUPER_ADMIN', is_active = true
        `;
        console.log('[SentraEdu] Admin user seeded.');
      }
    } catch (err_raw) { const err = err_raw as Error;
      console.error('[SentraEdu] DB init failed:', err.message);
    }
  }

  // 2. Rate limiting for auth endpoints
  const path = event.url.pathname;
  const ip = getClientIp(event.request);

  if (path === '/api/auth/login') {
    const { allowed } = checkRateLimit(ip, 'login');
    if (!allowed) {
      return new Response(JSON.stringify({
        error: true,
        statusCode: 429,
        message: 'Terlalu banyak percobaan login. Silakan coba lagi dalam 15 menit.',
        data: null
      }), {
        status: 429,
        headers: { 'Content-Type': 'application/json', 'Retry-After': '900' }
      });
    }
  }

  if (path.startsWith('/api/') && event.request.method === 'POST') {
    const { allowed } = checkRateLimit(ip, 'default');
    if (!allowed) {
      return new Response(JSON.stringify({
        error: true,
        statusCode: 429,
        message: 'Terlalu banyak permintaan. Silakan coba lagi.',
        data: null
      }), {
        status: 429,
        headers: { 'Content-Type': 'application/json', 'Retry-After': '60' }
      });
    }
  }

  // 3. Security headers
  const response = await resolve(event);

  // Content Security Policy
  response.headers.set('Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline'; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data: https:; " +
    "connect-src 'self'; " +
    "frame-ancestors 'none';"
  );

  // Other security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self)');

  // Strict Transport Security (only in production)
  if (event.url.protocol === 'https:') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  return response;
};
