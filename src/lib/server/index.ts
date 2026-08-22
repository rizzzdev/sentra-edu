/**
 * $lib/server — Server-side only modules
 *
 * Usage in server endpoints (+server.ts, hooks.server.ts):
 *   import { userService, requireAdmin, successResponse } from '$lib/server'
 */

// ── Prisma & Database Client ────────────────────────────
export { prisma, getPrisma } from './prisma';

// ── Cache ───────────────────────────────────────────────
export { getCached, setCache, invalidateCache } from './cache';

// ── Security & Authentication ───────────────────────────
export {
  checkRateLimit,
  sanitizeInput,
  sanitizeObject,
  isValidEmail,
  isValidId,
  isNonEmptyString,
  isValidRole,
  isValidStatus,
  generateCsrfToken,
  validateCsrfToken,
  forbiddenResponse,
  rateLimitedResponse,
  badRequestResponse,
  unauthorizedResponse,
  isJsonRequest,
  getSessionUser,
  requireAdmin,
  requireAuthenticated,
  requireAdminOrTentor
} from './security';

// ── Domain Services ─────────────────────────────────────
export { subjectService } from './modules/subject';
export { educationLevelService } from './modules/education-level';
export { classService } from './modules/class';
export { packageService } from './modules/package';
export { userService } from './modules/user';
export { enrollmentService } from './modules/enrollment';
export { jobService } from './modules/job';
export { attendanceService } from './modules/attendance';
export { invoiceService } from './modules/invoice';
export { payrollService } from './modules/payroll';
export { candidateService } from './modules/candidate';
export { applicationService } from './modules/application';
export { notificationService } from './modules/notification';
export { magicLinkService } from './modules/magic-link';

// ── Repositories ────────────────────────────────────────
export { subjectRepository } from './modules/subject';
export { educationLevelRepository } from './modules/education-level';
export { classRepository } from './modules/class';
export { packageRepository } from './modules/package';
export { userRepository } from './modules/user';
export { enrollmentRepository } from './modules/enrollment';
export { jobRepository } from './modules/job';
export { attendanceRepository } from './modules/attendance';
export { invoiceRepository } from './modules/invoice';
export { payrollRepository } from './modules/payroll';
export { candidateRepository } from './modules/candidate';
export { applicationRepository } from './modules/application';
export { notificationRepository } from './modules/notification';
export { magicLinkRepository } from './modules/magic-link';
