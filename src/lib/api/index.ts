/**
 * $lib/api — Client-side Stores, API Client & Shared Envelope Types
 * Browser-safe (zero server imports, zero private env).
 *
 * Usage:
 *   import { userStore, subjectStore, api, type ApiResponse } from '$lib/api';
 */

// ── Types & Response Envelope Helpers ────────────────────
export type { ApiResponse, Pagination } from './types';
export { successResponse, errorResponse, calculatePagination } from './types';

// ── Client Fetch Helpers ─────────────────────────────────
export { api } from './client';
export { apiRequest } from './request';

// ── Client Stores (subscribable, fetch on demand) ────────
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
