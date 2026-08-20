import { sql } from './db';
import type { DatabaseSchema, User } from '$lib/shared/types/common.types';
import { generateEntityId } from '$lib/shared/utils/id-generator';

// ── Row → App Type Mappers ───────────────────────────────

export type DatabaseRow = Record<string, string | number | boolean | string[] | null | undefined>;

function mapUserRow(row: DatabaseRow) {
  return {
    id: String(row.id),
    email: String(row.email),
    password: row.password ? String(row.password) : undefined,
    fullName: String(row.full_name),
    phone: String(row.phone || ''),
    role: row.role as User['role'],
    position: row.position ? String(row.position) : undefined,
    education: row.education ? String(row.education) : undefined,
    experienceYears: row.experience_years ? Number(row.experience_years) : undefined,
    subjectIds: (row.subject_ids as string[]) || [],
    levelIds: (row.level_ids as string[]) || [],
    school: row.school ? String(row.school) : undefined,
    address: row.address ? String(row.address) : undefined,
    latitude: row.latitude ? Number(row.latitude) : null,
    longitude: row.longitude ? Number(row.longitude) : null,
    occupation: row.occupation ? String(row.occupation) : undefined,
    waliUserId: row.wali_user_id ? String(row.wali_user_id) : undefined,
    isActive: row.is_active !== false,
    candidateStatus: row.candidate_status as User['candidateStatus'],
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    deletedAt: row.deleted_at ? String(row.deleted_at) : null
  };
}

function mapLevelRow(row: DatabaseRow) {
  return {
    id: String(row.id),
    levelName: String(row.level_name),
    description: String(row.description || ''),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    deletedAt: row.deleted_at ? String(row.deleted_at) : null
  };
}

function mapClassRow(row: DatabaseRow) {
  return {
    id: String(row.id),
    className: String(row.class_name),
    educationLevelId: String(row.education_level_id),
    baseRatePer90Min: Number(row.base_rate_per_90min) || 0,
    description: String(row.description || ''),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    deletedAt: row.deleted_at ? String(row.deleted_at) : null
  };
}

function mapSubjectRow(row: DatabaseRow) {
  return {
    id: String(row.id),
    name: String(row.name),
    description: String(row.description || ''),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    deletedAt: row.deleted_at ? String(row.deleted_at) : null
  };
}

function mapPackageRow(row: DatabaseRow) {
  return {
    id: String(row.id),
    name: String(row.name),
    mode: row.mode as 'PRIVATE' | 'KELOMPOK',
    period: row.period as 'BULANAN' | 'HARIAN',
    price: Number(row.price) || 0,
    sessionsPerPeriod: Number(row.sessions_per_period) || 1,
    maxStudents: Number(row.max_students) || 1,
    tentorFee: Number(row.tentor_fee) || 0,
    description: String(row.description || ''),
    active: row.active !== false,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    deletedAt: row.deleted_at ? String(row.deleted_at) : null
  };
}

function mapEnrollmentRow(row: DatabaseRow) {
  return {
    id: String(row.id),
    studentId: String(row.student_id),
    subjectId: String(row.subject_id),
    classId: String(row.class_id),
    packageId: String(row.package_id),
    tentorId: row.tentor_id ? String(row.tentor_id) : null,
    scheduleDay: String(row.schedule_day || ''),
    scheduleTime: String(row.schedule_time || ''),
    status: row.status as 'ACTIVE' | 'PENDING' | 'COMPLETED' | 'CANCELLED',
    address: row.address ? String(row.address) : undefined,
    latitude: row.latitude ? Number(row.latitude) : undefined,
    longitude: row.longitude ? Number(row.longitude) : undefined,
    waliUserId: row.wali_user_id ? String(row.wali_user_id) : undefined,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    deletedAt: row.deleted_at ? String(row.deleted_at) : null
  };
}

function mapJobRow(row: DatabaseRow) {
  return {
    id: String(row.id),
    title: String(row.title),
    classId: String(row.class_id || ''),
    subjectId: String(row.subject_id || ''),
    packageId: row.package_id ? String(row.package_id) : undefined,
    jobMode: (row.job_mode || 'OFFLINE') as 'OFFLINE' | 'ONLINE',
    mode: (row.job_mode || 'OFFLINE') as 'OFFLINE' | 'ONLINE',
    tentorFee: Number(row.tentor_fee) || 0,
    sessionDurationMinutes: Number(row.session_duration_minutes) || 90,
    scheduleDays: (row.schedule_days as string[]) || [],
    scheduleTime: String(row.schedule_time || ''),
    studentCount: Number(row.student_count) || 1,
    location: String(row.location || ''),
    latitude: row.latitude !== null && row.latitude !== undefined ? Number(row.latitude) : null,
    longitude: row.longitude !== null && row.longitude !== undefined ? Number(row.longitude) : null,
    status: (row.status || 'AVAILABLE') as 'AVAILABLE' | 'NEGOTIATING' | 'ASSIGNED' | 'CANCELLED',
    assignedTentorId: row.assigned_tentor_id ? String(row.assigned_tentor_id) : null,
    studentId: row.student_id ? String(row.student_id) : null,
    enrollmentId: row.enrollment_id ? String(row.enrollment_id) : null,
    notes: String(row.notes || ''),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    deletedAt: row.deleted_at ? String(row.deleted_at) : null
  };
}

function mapApplicationRow(row: DatabaseRow) {
  return {
    id: String(row.id),
    jobId: String(row.job_id),
    tentorId: String(row.tentor_id),
    status: (row.status || 'PENDING') as 'PENDING' | 'UNDER_REVIEW' | 'ACCEPTED' | 'REJECTED',
    appliedAt: String(row.applied_at || row.created_at),
    notes: String(row.notes || ''),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    deletedAt: row.deleted_at ? String(row.deleted_at) : null
  };
}

function mapAttendanceRow(row: DatabaseRow) {
  return {
    id: String(row.id),
    enrollmentId: String(row.enrollment_id),
    tentorId: String(row.tentor_id),
    sessionDate: String(row.session_date),
    startTime: String(row.start_time || ''),
    endTime: String(row.end_time || ''),
    topic: String(row.topic || ''),
    studentNotes: String(row.student_notes || ''),
    status: (row.status || 'SUBMITTED') as 'SUBMITTED' | 'APPROVED' | 'REJECTED',
    latitudeCheckIn: row.latitude_check_in !== null && row.latitude_check_in !== undefined ? Number(row.latitude_check_in) : null,
    longitudeCheckIn: row.longitude_check_in !== null && row.longitude_check_in !== undefined ? Number(row.longitude_check_in) : null,
    isRadiusValid: Boolean(row.is_radius_valid),
    proofPhotoUrl: row.proof_photo_url ? String(row.proof_photo_url) : undefined,
    studentConfirmed: Boolean(row.student_confirmed),
    studentRating: row.student_rating ? Number(row.student_rating) : undefined,
    studentFeedback: row.student_feedback ? String(row.student_feedback) : undefined,
    reviewNotes: row.review_notes ? String(row.review_notes) : undefined,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    deletedAt: row.deleted_at ? String(row.deleted_at) : null
  };
}

function mapInvoiceRow(row: DatabaseRow) {
  return {
    id: String(row.id),
    enrollmentId: String(row.enrollment_id),
    invoiceNumber: String(row.invoice_number),
    amount: Number(row.amount) || 0,
    dueDate: String(row.due_date),
    status: (row.status || 'UNPAID') as 'UNPAID' | 'PAID' | 'OVERDUE',
    paidAt: row.paid_at ? String(row.paid_at) : null,
    paymentProofUrl: row.payment_proof_url ? String(row.payment_proof_url) : null,
    periodMonth: Number(row.period_month) || 1,
    periodYear: Number(row.period_year) || 2026,
    notes: row.notes ? String(row.notes) : undefined,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    deletedAt: row.deleted_at ? String(row.deleted_at) : null
  };
}

function mapPayrollRow(row: DatabaseRow) {
  return {
    id: String(row.id),
    tentorId: String(row.tentor_id),
    claimNumber: String(row.claim_number),
    periodStart: String(row.period_start),
    periodEnd: String(row.period_end),
    periodMonth: row.period_month ? Number(row.period_month) : undefined,
    periodYear: row.period_year ? Number(row.period_year) : undefined,
    totalAmount: Number(row.total_amount) || 0,
    attendanceIds: (row.attendance_ids as string[]) || [],
    status: (row.status || 'DRAFT') as 'DRAFT' | 'REQUESTED' | 'PAID' | 'REJECTED',
    paidAt: row.paid_at ? String(row.paid_at) : null,
    transferProofUrl: row.transfer_proof_url ? String(row.transfer_proof_url) : null,
    rejectionReason: row.rejection_reason ? String(row.rejection_reason) : undefined,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    deletedAt: row.deleted_at ? String(row.deleted_at) : null
  };
}

function mapCandidateRow(row: DatabaseRow) {
  return {
    id: String(row.id),
    fullName: String(row.full_name),
    email: String(row.email),
    phone: String(row.phone || ''),
    education: String(row.education || ''),
    experienceYears: Number(row.experience_years) || 0,
    subjectIds: (row.subject_ids as string[]) || [],
    levelIds: (row.level_ids as string[]) || [],
    cvUrl: row.cv_url ? String(row.cv_url) : undefined,
    source: row.source ? String(row.source) : undefined,
    status: (row.status || 'REGISTERED') as 'REGISTERED' | 'TEST_SCHEDULED' | 'TESTED' | 'INTERVIEW_SCHEDULED' | 'INTERVIEWED' | 'ACCEPTED' | 'REJECTED' | 'INTERVIEW' | 'MICROTEACHING',
    notes: row.notes ? String(row.notes) : undefined,
    interviewDate: row.interview_date ? String(row.interview_date) : undefined,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    deletedAt: row.deleted_at ? String(row.deleted_at) : null
  };
}

function mapNotificationRow(row: DatabaseRow) {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    title: String(row.title || ''),
    message: String(row.message || ''),
    icon: String(row.icon || 'notifications'),
    read: Boolean(row.read),
    createdAt: String(row.created_at)
  };
}

function mapMagicLinkRow(row: DatabaseRow) {
  return {
    id: String(row.id),
    token: String(row.token),
    title: String(row.title || ''),
    daysValid: Number(row.days_valid) || 7,
    expiresAt: String(row.expires_at),
    usedCount: Number(row.used_count) || 0,
    active: row.active !== false,
    targetRole: (row.target_role as 'STUDENT' | 'TENTOR') || undefined,
    classId: row.class_id ? String(row.class_id) : undefined,
    packageId: row.package_id ? String(row.package_id) : undefined,
    createdBy: row.created_by ? String(row.created_by) : undefined,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    deletedAt: row.deleted_at ? String(row.deleted_at) : null
  };
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
