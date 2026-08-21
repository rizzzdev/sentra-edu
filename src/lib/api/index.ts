/**
 * $lib/api — Domain → Repository → Service Architecture
 *
 * Usage:
 *   import { subjectService, userService, requireAdmin, successResponse } from '$lib/api'
 */

// ── Types ───────────────────────────────────────────────
export type { ApiResponse, Pagination } from './types';
export { successResponse, errorResponse, calculatePagination } from './types';

// ── Services ────────────────────────────────────────────
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

// ── Repositories (for direct data access when needed) ───
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

// ── Client Stores (fetch on demand + refetch after mutation) ──
export { subjectStore } from './modules/subject';
export { educationLevelStore } from './modules/education-level';
export { classStore } from './modules/class';
export { packageStore } from './modules/package';
export { userStore } from './modules/user';
export { enrollmentStore } from './modules/enrollment';
export { jobStore } from './modules/job';
export { attendanceStore } from './modules/attendance';
export { invoiceStore } from './modules/invoice';
export { payrollStore } from './modules/payroll';
export { candidateStore } from './modules/candidate';
export { applicationStore } from './modules/application';
export { notificationStore } from './modules/notification';
export { magicLinkStore } from './modules/magic-link';

// ── Prisma Client (only for edge cases) ─────────────────
export { prisma } from './prisma';

// ── Cache ───────────────────────────────────────────────
export { getCached, setCache, invalidateCache } from './cache';

// ── Security ────────────────────────────────────────────
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
  requireAdmin
} from './security';
