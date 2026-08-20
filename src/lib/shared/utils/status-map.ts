/**
 * SentraEdu — Status Label Mapping (Bahasa Indonesia)
 *
 * Single source of truth for translating internal status keys
 * into user-facing Indonesian labels across the entire UI.
 */

// ── User Roles ──────────────────────────────────────────────
export const ROLE_LABEL: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  TENTOR: 'Tentor',
  STUDENT: 'Siswa',
  WALI_MURID: 'Wali Murid'
};

// ── Enrollment Status ───────────────────────────────────────
export const ENROLLMENT_STATUS_LABEL: Record<string, string> = {
  ACTIVE: 'Aktif',
  PENDING: 'Menunggu',
  COMPLETED: 'Selesai',
  CANCELLED: 'Dibatalkan'
};

// ── Job Status ──────────────────────────────────────────────
export const JOB_STATUS_LABEL: Record<string, string> = {
  AVAILABLE: 'Tersedia',
  NEGOTIATING: 'Negosiasi',
  ASSIGNED: 'Ditugaskan',
  CANCELLED: 'Dibatalkan'
};

// ── Job Type ────────────────────────────────────────────────
export const JOB_TYPE_LABEL: Record<string, string> = {
  REGULAR: 'Reguler',
  TEMPORARY_REPLACEMENT: 'Pengganti Sementara'
};

// ── Job Mode ────────────────────────────────────────────────
export const JOB_MODE_LABEL: Record<string, string> = {
  OFFLINE: 'Luring',
  ONLINE: 'Daring'
};

// ── Application Status ──────────────────────────────────────
export const APPLICATION_STATUS_LABEL: Record<string, string> = {
  PENDING: 'Menunggu',
  UNDER_REVIEW: 'Ditinjau',
  ACCEPTED: 'Diterima',
  REJECTED: 'Ditolak'
};

// ── Attendance Status ───────────────────────────────────────
export const ATTENDANCE_STATUS_LABEL: Record<string, string> = {
  SUBMITTED: 'Diajukan',
  APPROVED: 'Disetujui',
  REJECTED: 'Ditolak'
};

// ── Invoice Status ──────────────────────────────────────────
export const INVOICE_STATUS_LABEL: Record<string, string> = {
  UNPAID: 'Belum Dibayar',
  PAID: 'Lunas',
  OVERDUE: 'Jatuh Tempo'
};

// ── Payroll / Claim Status ──────────────────────────────────
export const PAYROLL_STATUS_LABEL: Record<string, string> = {
  DRAFT: 'Draf',
  REQUESTED: 'Diajukan',
  PAID: 'Dibayar',
  REJECTED: 'Ditolak'
};

// ── Candidate / Recruitment Status ──────────────────────────
export const CANDIDATE_STATUS_LABEL: Record<string, string> = {
  REGISTERED: 'Terdaftar',
  TEST_SCHEDULED: 'Ujian Terjadwal',
  TESTED: 'Selesai Ujian',
  INTERVIEW_SCHEDULED: 'Wawancara Terjadwal',
  INTERVIEWED: 'Selesai Wawancara',
  ACCEPTED: 'Diterima',
  REJECTED: 'Ditolak',
  INTERVIEW: 'Wawancara',
  MICROTEACHING: 'Microteaching'
};

// ── Package Mode ────────────────────────────────────────────
export const PACKAGE_MODE_LABEL: Record<string, string> = {
  PRIVATE: 'Privat',
  KELOMPOK: 'Kelompok'
};

// ── Package Period ──────────────────────────────────────────
export const PACKAGE_PERIOD_LABEL: Record<string, string> = {
  BULANAN: 'Bulanan',
  HARIAN: 'Harian'
};

// ── User Active Status ──────────────────────────────────────
export const USER_ACTIVE_LABEL: Record<string, string> = {
  true: 'Aktif',
  false: 'Belum Aktif'
};

// ── Generic Badge CSS Class Map ─────────────────────────────
// Maps status keys to their corresponding badge CSS class
export const STATUS_BADGE_CLASS: Record<string, string> = {
  // Positive / Done
  ACTIVE: 'b-available',
  APPROVED: 'b-approved',
  ACCEPTED: 'b-accepted',
  PAID: 'b-paid',
  COMPLETED: 'b-approved',

  // In Progress / Pending
  PENDING: 'b-pending',
  SUBMITTED: 'b-submitted',
  REQUESTED: 'b-requested',
  AVAILABLE: 'b-available',
  NEGOTIATING: 'b-negotiating',
  UNDER_REVIEW: 'b-negotiating',
  DRAFT: 'b-neutral',

  // Scheduled
  ASSIGNED: 'b-assigned',
  TEST_SCHEDULED: 'b-tested',
  INTERVIEW_SCHEDULED: 'b-interviewed',
  TESTED: 'b-tested',
  INTERVIEWED: 'b-interviewed',
  INTERVIEW: 'b-interviewed',
  MICROTEACHING: 'b-tested',
  REGISTERED: 'b-neutral',

  // Negative / Cancelled
  REJECTED: 'b-rejected',
  CANCELLED: 'b-cancelled',
  OVERDUE: 'b-unpaid',

  // Neutral
  Menunggu: 'b-pending',
  Dibatalkan: 'b-rejected'
};

// ── Schedule Days (1 hari 1 mapping) ────────────────────────
export const DAY_LABEL: Record<string, string> = {
  MONDAY: 'Senin',
  TUESDAY: 'Selasa',
  WEDNESDAY: 'Rabu',
  THURSDAY: 'Kamis',
  FRIDAY: 'Jumat',
  SATURDAY: 'Sabtu',
  SUNDAY: 'Minggu'
};

export const DAY_OPTIONS = [
  { value: 'MONDAY', label: 'Senin' },
  { value: 'TUESDAY', label: 'Selasa' },
  { value: 'WEDNESDAY', label: 'Rabu' },
  { value: 'THURSDAY', label: 'Kamis' },
  { value: 'FRIDAY', label: 'Jumat' },
  { value: 'SATURDAY', label: 'Sabtu' },
  { value: 'SUNDAY', label: 'Minggu' }
];

// ── Helper Functions ────────────────────────────────────────

/** Get the Indonesian label for any status key. Falls back to the raw key. */
export function getStatusLabel(
  status: string,
  mapping: Record<string, string> = {}
): string {
  return mapping[status] ?? status;
}

/** Get the badge CSS class for a status key. Falls back to 'b-neutral'. */
export function getStatusBadgeClass(status: string): string {
  return STATUS_BADGE_CLASS[status] ?? 'b-neutral';
}

/** Get the Indonesian label for a day key. */
export function getDayLabel(day: string): string {
  return DAY_LABEL[day] ?? day;
}

/** Format an array of day keys into Indonesian labels for UI display */
export function getScheduleDaysList(days: string[] | undefined | null): string[] {
  if (!days || !Array.isArray(days) || days.length === 0) return ['—'];
  const mapped = days
    .map((dayKey) => (typeof dayKey === 'string' ? (DAY_LABEL[dayKey] ?? dayKey) : ''))
    .filter(Boolean);
  return mapped.length > 0 ? mapped : ['—'];
}
