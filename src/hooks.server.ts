import type { Handle } from '@sveltejs/kit';
import { checkRateLimit } from '$lib/api';

function getClientIp(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || '127.0.0.1';
}

export const handle: Handle = async ({ event, resolve }) => {
  // 1. Rate limiting for auth endpoints
  const path = event.url.pathname;
  const ip = getClientIp(event.request);

  if (path === '/api/auth/login') {
    const { allowed } = checkRateLimit(ip, 'login');
    if (!allowed) {
      return new Response(JSON.stringify({
        error: true, statusCode: 429,
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
        error: true, statusCode: 429,
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
        error: true, statusCode: 429,
        message: 'Terlalu banyak permintaan. Silakan coba lagi.',
        data: null
      }), {
        status: 429,
        headers: { 'Content-Type': 'application/json', 'Retry-After': '60' }
      });
    }
  }

  // 2. Security headers
  const response = await resolve(event);

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

  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self)');

  if (event.url.protocol === 'https:') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  return response;
};
