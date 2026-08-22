import type { Cookies } from '@sveltejs/kit';
import type { User } from '$lib/shared/types';

// ── Rate Limiter ─────────────────────────────────────────
// Simple in-memory rate limiter (per-IP)

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

interface RateLimitConfig {
  windowMs: number;   // time window in ms
  maxRequests: number; // max requests per window
}

const RATE_LIMITS: Record<string, RateLimitConfig> = {
  login: { windowMs: 15 * 60 * 1000, maxRequests: 10 },      // 10 attempts per 15 min
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

export function sanitizeObject<T extends Record<string, string | number | boolean | string[] | null | undefined>>(obj: T): T {
  const sanitized = { ...obj };
  for (const key of Object.keys(sanitized)) {
    const value = sanitized[key];
    if (typeof value === 'string') {
      (sanitized as Record<string, string | number | boolean | string[] | null | undefined>)[key] = sanitizeInput(value);
    }
  }
  return sanitized;
}

// ── Input Validators ─────────────────────────────────────

export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string' || email.length > 254) return false;
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
}

export function isValidId(id: string): boolean {
  return /^[a-zA-Z0-9_-]{1,50}$/.test(id);
}

export function isNonEmptyString(value: string | number | boolean | null | undefined, maxLength: number = 500): boolean {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= maxLength;
}

export function isValidRole(role: string): boolean {
  return ['SUPER_ADMIN', 'TENTOR', 'STUDENT', 'PARENT'].includes(role);
}

export function isValidStatus(status: string, validStatuses: string[]): boolean {
  return validStatuses.includes(status);
}

// ── CSRF Token ───────────────────────────────────────────

export function generateCsrfToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function validateCsrfToken(cookieToken: string | undefined, headerToken: string | null): boolean {
  if (!cookieToken || !headerToken) return false;
  if (cookieToken.length !== headerToken.length) return false;
  // Constant-time comparison
  let match = 0;
  for (let i = 0; i < cookieToken.length; i++) {
    match |= cookieToken.charCodeAt(i) ^ headerToken.charCodeAt(i);
  }
  return match === 0;
}

// ── Error Responses ──────────────────────────────────────

export function forbiddenResponse(message: string = 'Akses ditolak.'): Response {
  return new Response(JSON.stringify({
    error: true,
    statusCode: 403,
    message,
    data: null
  }), {
    status: 403,
    headers: { 'Content-Type': 'application/json' }
  });
}

export function rateLimitedResponse(message: string = 'Terlalu banyak permintaan. Coba lagi nanti.', retryAfter: number = 60): Response {
  return new Response(JSON.stringify({
    error: true,
    statusCode: 429,
    message,
    data: null
  }), {
    status: 429,
    headers: {
      'Content-Type': 'application/json',
      'Retry-After': String(retryAfter)
    }
  });
}

export function badRequestResponse(message: string = 'Permintaan tidak valid.'): Response {
  return new Response(JSON.stringify({
    error: true,
    statusCode: 400,
    message,
    data: null
  }), {
    status: 400,
    headers: { 'Content-Type': 'application/json' }
  });
}

export function unauthorizedResponse(message: string = 'Autentikasi diperlukan.'): Response {
  return new Response(JSON.stringify({
    error: true,
    statusCode: 401,
    message,
    data: null
  }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' }
  });
}

// ── Content-Type Verification ────────────────────────────

export function isJsonRequest(request: Request): boolean {
  const contentType = request.headers.get('content-type');
  return !!contentType && contentType.includes('application/json');
}

// ── Cookie Helpers ───────────────────────────────────────

export function getSessionUser(cookies: Cookies): User | null {
  const sessionUser = cookies.get('session_user');
  if (!sessionUser) return null;
  try {
    return JSON.parse(decodeURIComponent(sessionUser)) as User;
  } catch {
    try {
      return JSON.parse(sessionUser) as User;
    } catch {
      return null;
    }
  }
}

export function requireAdmin(cookies: Cookies): { allowed: boolean; user?: User; error?: Response } {
  const user = getSessionUser(cookies);
  if (!user) {
    return { allowed: false, error: unauthorizedResponse('Silakan login terlebih dahulu.') };
  }
  if (user.role !== 'SUPER_ADMIN') {
    return { allowed: false, error: forbiddenResponse('Akses hanya untuk Super Admin.') };
  }
  return { allowed: true, user };
}

export function requireAuthenticated(cookies: Cookies): { allowed: boolean; user?: User; error?: Response } {
  const user = getSessionUser(cookies);
  if (!user) {
    return { allowed: false, error: unauthorizedResponse('Silakan login terlebih dahulu.') };
  }
  return { allowed: true, user };
}

export function requireAdminOrTentor(cookies: Cookies): { allowed: boolean; user?: User; error?: Response } {
  const user = getSessionUser(cookies);
  if (!user) {
    return { allowed: false, error: unauthorizedResponse('Silakan login terlebih dahulu.') };
  }
  if (user.role !== 'SUPER_ADMIN' && user.role !== 'TENTOR') {
    return { allowed: false, error: forbiddenResponse('Akses hanya untuk Admin atau Tentor.') };
  }
  return { allowed: true, user };
}
