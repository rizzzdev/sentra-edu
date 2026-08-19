/**
 * Security utilities for SentraEdu BFF
 */

// ── Rate Limiter ─────────────────────────────────────────
// Simple in-memory rate limiter (per-IP)

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

interface RateLimitConfig {
  windowMs: number;   // time window in ms
  maxRequests: number; // max requests per window
}

const RATE_LIMITS: Record<string, RateLimitConfig> = {
  login: { windowMs: 15 * 60 * 1000, maxRequests: 5 },      // 5 attempts per 15 min
  register: { windowMs: 60 * 60 * 1000, maxRequests: 10 },   // 10 per hour
  default: { windowMs: 60 * 1000, maxRequests: 60 }          // 60 per minute
};

export function checkRateLimit(ip: string, endpoint: string): { allowed: boolean; remaining: number } {
  const config = RATE_LIMITS[endpoint] || RATE_LIMITS.default;
  const key = `${ip}:${endpoint}`;
  const now = Date.now();

  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + config.windowMs });
    return { allowed: true, remaining: config.maxRequests - 1 };
  }

  if (entry.count >= config.maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: config.maxRequests - entry.count };
}

// Cleanup old entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (now > entry.resetAt) rateLimitStore.delete(key);
    }
  }, 5 * 60 * 1000);
}

// ── Input Sanitizer (XSS prevention) ─────────────────────

const HTML_ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;'
};

export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return input;
  return input.replace(/[&<>"'/]/g, (char) => HTML_ESCAPE_MAP[char] || char);
}

export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized = { ...obj };
  for (const [key, value] of Object.entries(sanitized)) {
    if (typeof value === 'string') {
      (sanitized as any)[key] = sanitizeInput(value);
    }
  }
  return sanitized;
}

// ── Input Validators ─────────────────────────────────────

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidId(id: string): boolean {
  return /^[a-zA-Z0-9_-]{1,50}$/.test(id);
}

export function isNonEmptyString(value: any, maxLength: number = 500): boolean {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= maxLength;
}

export function isValidRole(role: string): boolean {
  return ['SUPER_ADMIN', 'TENTOR', 'STUDENT', 'WALI_MURID'].includes(role);
}

export function isValidStatus(status: string, validStatuses: string[]): boolean {
  return validStatuses.includes(status);
}

// ── CSRF Token ───────────────────────────────────────────

const CSRF_SECRET = 'sentraedu-csrf-default-secret';

export function generateCsrfToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
}

export function validateCsrfToken(token: string, expected: string): boolean {
  if (!token || !expected) return false;
  return token === expected;
}

// ── Response Helpers ─────────────────────────────────────

import { json } from '@sveltejs/kit';

export function forbiddenResponse(message: string = 'Akses ditolak.') {
  return json({ error: true, statusCode: 403, message, data: null }, { status: 403 });
}

export function rateLimitedResponse() {
  return json(
    { error: true, statusCode: 429, message: 'Terlalu banyak percobaan. Silakan coba lagi dalam beberapa menit.', data: null },
    { status: 429, headers: { 'Retry-After': '900' } }
  );
}

export function badRequestResponse(message: string) {
  return json({ error: true, statusCode: 400, message, data: null }, { status: 400 });
}

export function unauthorizedResponse(message: string = 'Tidak terautentikasi.') {
  return json({ error: true, statusCode: 401, message, data: null }, { status: 401 });
}

// ── Content-Type Check ───────────────────────────────────

export function isJsonRequest(request: Request): boolean {
  const contentType = request.headers.get('content-type');
  return !!contentType && contentType.includes('application/json');
}

// ── Auth Helpers ─────────────────────────────────────────

import type { Cookies } from '@sveltejs/kit';

export function getSessionUser(cookies: Cookies): { id: string; email: string; fullName: string; role: string } | null {
  const session = cookies.get('session');
  const sessionUser = cookies.get('session_user');
  if (!session || !sessionUser) return null;

  // Validate session token format (UUID)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(session)) return null;

  // Validate session_user JSON structure
  try {
    const user = JSON.parse(sessionUser);
    if (!user.id || !user.email || !user.role) return null;
    // Validate role is a known value
    const validRoles = ['SUPER_ADMIN', 'TENTOR', 'STUDENT', 'WALI_MURID'];
    if (!validRoles.includes(user.role)) return null;
    return user;
  } catch {
    return null;
  }
}

export function requireAdmin(cookies: Cookies): { allowed: boolean; user: any; error?: any } {
  const user = getSessionUser(cookies);
  if (!user) return { allowed: false, user: null, error: unauthorizedResponse() };
  if (user.role !== 'SUPER_ADMIN') return { allowed: false, user, error: forbiddenResponse('Hanya admin yang dapat melakukan aksi ini.') };
  return { allowed: true, user };
}
