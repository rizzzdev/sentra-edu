import { sql } from './db';
import type { DatabaseSchema } from '$lib/shared/types/common.types';
import { generateEntityId } from '$lib/shared/utils/id-generator';

// ── Row → App Type Mappers ───────────────────────────────

function mapUserRow(r: any) {
  return {
    id: r.id, email: r.email, password: r.password, fullName: r.full_name,
    phone: r.phone || '', role: r.role, position: r.position, education: r.education,
    experienceYears: r.experience_years, subjectIds: r.subject_ids || [], levelIds: r.level_ids || [],
    school: r.school, address: r.address, occupation: r.occupation,
    waliUserId: r.wali_user_id, isActive: r.is_active, candidateStatus: r.candidate_status,
    createdAt: r.created_at, updatedAt: r.updated_at, deletedAt: r.deleted_at
  };
}

function mapLevelRow(r: any) {
  return { id: r.id, levelName: r.level_name, description: r.description || '', createdAt: r.created_at, updatedAt: r.updated_at, deletedAt: r.deleted_at };
}

function mapClassRow(r: any) {
  return { id: r.id, className: r.class_name, educationLevelId: r.education_level_id, baseRatePer90Min: r.base_rate_per_90min, description: r.description || '', createdAt: r.created_at, updatedAt: r.updated_at, deletedAt: r.deleted_at };
}

function mapSubjectRow(r: any) {
  return { id: r.id, name: r.name, description: r.description || '', createdAt: r.created_at, updatedAt: r.updated_at, deletedAt: r.deleted_at };
}

function mapPackageRow(r: any) {
  return { id: r.id, name: r.name, mode: r.mode, period: r.period, price: r.price, sessionsPerPeriod: r.sessions_per_period, maxStudents: r.max_students, tentorFee: r.tentor_fee, description: r.description || '', active: r.active, createdAt: r.created_at, updatedAt: r.updated_at, deletedAt: r.deleted_at };
}

function mapEnrollmentRow(r: any) {
  return { id: r.id, studentId: r.student_id, subjectId: r.subject_id, classId: r.class_id, packageId: r.package_id, tentorId: r.tentor_id, scheduleDay: r.schedule_day, scheduleTime: r.schedule_time, status: r.status, address: r.address, latitude: r.latitude, longitude: r.longitude, waliUserId: r.wali_user_id, createdAt: r.created_at, updatedAt: r.updated_at, deletedAt: r.deleted_at };
}

function mapJobRow(r: any) {
  return { id: r.id, title: r.title, classId: r.class_id, subjectId: r.subject_id, packageId: r.package_id, jobType: r.job_type, jobMode: r.job_mode, tentorFee: r.tentor_fee, sessionDurationMinutes: r.session_duration_minutes, scheduleDays: r.schedule_days || [], scheduleTime: r.schedule_time, studentCount: r.student_count, location: r.location, latitude: r.latitude, longitude: r.longitude, status: r.status, assignedTentorId: r.assigned_tentor_id, studentId: r.student_id, enrollmentId: r.enrollment_id, notes: r.notes, createdAt: r.created_at, updatedAt: r.updated_at, deletedAt: r.deleted_at };
}

function mapApplicationRow(r: any) {
  return { id: r.id, jobId: r.job_id, tentorId: r.tentor_id, status: r.status, appliedAt: r.applied_at, notes: r.notes, createdAt: r.created_at, updatedAt: r.updated_at, deletedAt: r.deleted_at };
}

function mapAttendanceRow(r: any) {
  return { id: r.id, enrollmentId: r.enrollment_id, tentorId: r.tentor_id, sessionDate: r.session_date, startTime: r.start_time, endTime: r.end_time, topic: r.topic, studentNotes: r.student_notes, status: r.status, latitudeCheckIn: r.latitude_check_in, longitudeCheckIn: r.longitude_check_in, isRadiusValid: r.is_radius_valid, proofPhotoUrl: r.proof_photo_url, studentConfirmed: r.student_confirmed, studentRating: r.student_rating, studentFeedback: r.student_feedback, reviewNotes: r.review_notes, createdAt: r.created_at, updatedAt: r.updated_at, deletedAt: r.deleted_at };
}

function mapInvoiceRow(r: any) {
  return { id: r.id, enrollmentId: r.enrollment_id, invoiceNumber: r.invoice_number, amount: r.amount, dueDate: r.due_date, status: r.status, paidAt: r.paid_at, paymentProofUrl: r.payment_proof_url, periodMonth: r.period_month, periodYear: r.period_year, notes: r.notes, createdAt: r.created_at, updatedAt: r.updated_at, deletedAt: r.deleted_at };
}

function mapPayrollRow(r: any) {
  return { id: r.id, tentorId: r.tentor_id, claimNumber: r.claim_number, periodStart: r.period_start, periodEnd: r.period_end, periodMonth: r.period_month, periodYear: r.period_year, totalAmount: r.total_amount, attendanceIds: r.attendance_ids || [], status: r.status, paidAt: r.paid_at, transferProofUrl: r.transfer_proof_url, rejectionReason: r.rejection_reason, createdAt: r.created_at, updatedAt: r.updated_at, deletedAt: r.deleted_at };
}

function mapCandidateRow(r: any) {
  return { id: r.id, fullName: r.full_name, email: r.email, phone: r.phone, education: r.education, experienceYears: r.experience_years, subjectIds: r.subject_ids || [], levelIds: r.level_ids || [], cvUrl: r.cv_url, status: r.status, notes: r.notes, interviewDate: r.interview_date, createdAt: r.created_at, updatedAt: r.updated_at, deletedAt: r.deleted_at };
}

function mapNotificationRow(r: any) {
  return { id: r.id, userId: r.user_id, title: r.title, message: r.message, icon: r.icon, read: r.read, createdAt: r.created_at };
}

function mapMagicLinkRow(r: any) {
  return { id: r.id, token: r.token, title: r.title, daysValid: r.days_valid, expiresAt: r.expires_at, usedCount: r.used_count, active: r.active, targetRole: r.target_role, classId: r.class_id, packageId: r.package_id, createdBy: r.created_by, createdAt: r.created_at, updatedAt: r.updated_at, deletedAt: r.deleted_at };
}

// ── Load Full Database ───────────────────────────────────

export async function loadFullDatabase(): Promise<DatabaseSchema> {
  const [users, levels, classes, subjects, packages, enrollments, jobs, applications, attendances, invoices, payrollClaims, candidates, notifications, magicLinks] = await Promise.all([
    sql`SELECT * FROM users WHERE deleted_at IS NULL ORDER BY created_at DESC`,
    sql`SELECT * FROM education_levels WHERE deleted_at IS NULL`,
    sql`SELECT * FROM classes WHERE deleted_at IS NULL`,
    sql`SELECT * FROM subjects WHERE deleted_at IS NULL`,
    sql`SELECT * FROM packages WHERE deleted_at IS NULL`,
    sql`SELECT * FROM enrollments WHERE deleted_at IS NULL ORDER BY created_at DESC`,
    sql`SELECT * FROM jobs WHERE deleted_at IS NULL ORDER BY created_at DESC`,
    sql`SELECT * FROM applications WHERE deleted_at IS NULL ORDER BY created_at DESC`,
    sql`SELECT * FROM attendances WHERE deleted_at IS NULL ORDER BY created_at DESC`,
    sql`SELECT * FROM invoices WHERE deleted_at IS NULL ORDER BY created_at DESC`,
    sql`SELECT * FROM payroll_claims WHERE deleted_at IS NULL ORDER BY created_at DESC`,
    sql`SELECT * FROM candidates WHERE deleted_at IS NULL ORDER BY created_at DESC`,
    sql`SELECT * FROM notifications ORDER BY created_at DESC`,
    sql`SELECT * FROM magic_links WHERE deleted_at IS NULL ORDER BY created_at DESC`
  ]);

  return {
    version: 14,
    seededAt: new Date().toISOString(),
    users: users.map(mapUserRow),
    educationLevels: levels.map(mapLevelRow),
    classes: classes.map(mapClassRow),
    subjects: subjects.map(mapSubjectRow),
    packages: packages.map(mapPackageRow),
    enrollments: enrollments.map(mapEnrollmentRow),
    jobs: jobs.map(mapJobRow),
    applications: applications.map(mapApplicationRow),
    attendances: attendances.map(mapAttendanceRow),
    invoices: invoices.map(mapInvoiceRow),
    payrollClaims: payrollClaims.map(mapPayrollRow),
    candidates: candidates.map(mapCandidateRow),
    notifications: notifications.map(mapNotificationRow),
    magicLinks: magicLinks.map(mapMagicLinkRow)
  };
}

// ── Generic CRUD helpers ─────────────────────────────────

export { mapUserRow, mapLevelRow, mapClassRow, mapSubjectRow, mapPackageRow, mapEnrollmentRow, mapJobRow, mapApplicationRow, mapAttendanceRow, mapInvoiceRow, mapPayrollRow, mapCandidateRow, mapNotificationRow, mapMagicLinkRow, generateEntityId };
