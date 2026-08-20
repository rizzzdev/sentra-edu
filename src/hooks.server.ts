import type { Handle } from '@sveltejs/kit';
import { initDatabase } from '$lib/server/db';
import { checkRateLimit } from '$lib/server/security';

let dbInitialized = false;

function getClientIp(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || '127.0.0.1';
}

export const handle: Handle = async ({ event, resolve }) => {
  // 1. Init DB tables on first request (schema only, no data seeding)
  if (!dbInitialized) {
    try {
      await initDatabase();
      dbInitialized = true;
      console.log('[SentraEdu] Database tables initialized.');
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

  if (path === '/api/geocode') {
    const { allowed } = checkRateLimit(ip, 'default');
    if (!allowed) {
      return new Response(JSON.stringify({
        error: true,
        statusCode: 429,
        message: 'Terlalu banyak permintaan pencarian lokasi. Silakan coba lagi.',
        data: []
      }), {
        status: 429,
        headers: { 'Content-Type': 'application/json', 'Retry-After': '60' }
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
    "connect-src 'self' https://nominatim.openstreetmap.org https://photon.komoot.io https://*.google.com https://*.openstreetmap.org; " +
    "object-src 'none'; " +
    "base-uri 'self'; " +
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
