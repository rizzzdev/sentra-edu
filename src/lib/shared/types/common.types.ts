// Standard API Response Envelope (PRD Section 10.0)
export interface ApiResponse<T> {
  error: boolean;
  statusCode: number;
  message: string;
  data: T | null;
  pagination?: Pagination;
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalData: number;
  dataPerPage: number;
}

// User & Role Domain Types
export type UserRole = 'SUPER_ADMIN' | 'TENTOR' | 'STUDENT' | 'WALI_MURID';

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface User extends BaseEntity {
  email: string;
  password?: string;
  fullName: string;
  phone: string;
  role: UserRole;
  position?: string;
  department?: string;
  education?: string;
  experienceYears?: number;
  subjectIds?: string[];
  levelIds?: string[];
  school?: string;
  address?: string;
  occupation?: string;
  waliUserId?: string;
  isActive?: boolean;
  candidateStatus?: CandidateStatus;
}

export interface EducationLevel extends BaseEntity {
  levelName: string;
  description: string;
}

export interface ClassLevel extends BaseEntity {
  className: string;
  educationLevelId: string;
  baseRatePer90Min: number;
  description: string;
}

export interface Subject extends BaseEntity {
  name: string;
  description: string;
}

export interface PackagePlan extends BaseEntity {
  name: string;
  mode: 'PRIVATE' | 'KELOMPOK';
  period: 'BULANAN' | 'HARIAN';
  price: number;
  sessionsPerPeriod: number;
  maxStudents: number;
  tentorFee: number;
  description: string;
  active: boolean;
}

export interface Enrollment extends BaseEntity {
  studentId: string;
  subjectId: string;
  classId: string;
  packageId: string;
  tentorId: string | null;
  scheduleDay: string;
  scheduleTime: string;
  status: 'ACTIVE' | 'PENDING' | 'COMPLETED' | 'CANCELLED';
  address?: string;
  latitude?: number;
  longitude?: number;
  waliUserId?: string;
}

export type StudentEnrollment = Enrollment;

export type JobMode = 'OFFLINE' | 'ONLINE';
export type JobStatus = 'AVAILABLE' | 'NEGOTIATING' | 'ASSIGNED' | 'CANCELLED';

export interface JobPost extends BaseEntity {
  title: string;
  classId: string;
  classIds?: string[];
  subjectId: string;
  subjectIds?: string[];
  packageId?: string;
  jobMode: JobMode;
  mode?: JobMode;
  tentorFee: number;
  transportAllowance?: number;
  sessionDurationMinutes: number;
  scheduleDays: string[];
  scheduleTime: string;
  scheduleEndTime?: string;
  schedulePreference?: string;
  studentCount: number;
  studentId: string | null;
  studentIds?: string[];
  studentName?: string;
  studentNames?: string[];
  location: string;
  latitude: number | null;
  longitude: number | null;
  status: JobStatus;
  assignedTentorId: string | null;
  enrollmentId: string | null;
  notes?: string;
  additionalNotes?: string;
  jobType?: string;
}

export type JobPosting = JobPost;

export type ApplicationStatus = 'PENDING' | 'UNDER_REVIEW' | 'ACCEPTED' | 'REJECTED';

export interface JobApplication extends BaseEntity {
  jobId: string;
  tentorId: string;
  status: ApplicationStatus;
  appliedAt: string;
  notes?: string;
}

export type AttendanceStatus = 'SUBMITTED' | 'APPROVED' | 'REJECTED';

export interface AttendanceRecord extends BaseEntity {
  enrollmentId: string;
  tentorId: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  topic: string;
  studentNotes: string;
  status: AttendanceStatus;
  latitudeCheckIn: number | null;
  longitudeCheckIn: number | null;
  isRadiusValid: boolean;
  proofPhotoUrl?: string;
  studentConfirmed: boolean;
  studentRating?: number;
  studentFeedback?: string;
  reviewNotes?: string;
}

export type InvoiceStatus = 'UNPAID' | 'PAID' | 'OVERDUE';

export interface InvoiceRecord extends BaseEntity {
  enrollmentId: string;
  invoiceNumber: string;
  amount: number;
  dueDate: string;
  status: InvoiceStatus;
  paidAt: string | null;
  paymentProofUrl: string | null;
  periodMonth: number;
  periodYear: number;
  notes?: string;
}

export type PayrollStatus = 'DRAFT' | 'REQUESTED' | 'PAID' | 'REJECTED';

export interface PayrollClaim extends BaseEntity {
  tentorId: string;
  claimNumber: string;
  periodStart: string;
  periodEnd: string;
  periodMonth?: number;
  periodYear?: number;
  totalAmount: number;
  attendanceIds: string[];
  status: PayrollStatus;
  paidAt: string | null;
  transferProofUrl: string | null;
  rejectionReason?: string;
}

export type CandidateStatus =
  | 'REGISTERED'
  | 'TEST_SCHEDULED'
  | 'TESTED'
  | 'INTERVIEW_SCHEDULED'
  | 'INTERVIEWED'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'INTERVIEW'
  | 'MICROTEACHING';

export interface RecruitmentCandidate extends BaseEntity {
  fullName: string;
  email: string;
  phone: string;
  education: string;
  experienceYears: number;
  subjectIds: string[];
  levelIds: string[];
  cvUrl?: string;
  status: CandidateStatus;
  notes?: string;
  interviewDate?: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  icon: string;
  read: boolean;
  createdAt: string;
}

export interface MagicLinkRegistration extends BaseEntity {
  token: string;
  title: string;
  daysValid: number;
  expiresAt: string;
  usedCount: number;
  active: boolean;
  targetRole?: 'STUDENT' | 'TENTOR';
  classId?: string;
  packageId?: string;
  createdBy?: string;
}

export interface DatabaseSchema {
  version: number;
  seededAt: string;
  isLoaded?: boolean;
  educationLevels: EducationLevel[];
  classes: ClassLevel[];
  subjects: Subject[];
  packages: PackagePlan[];
  users: User[];
  enrollments: Enrollment[];
  jobs: JobPost[];
  applications: JobApplication[];
  attendances: AttendanceRecord[];
  invoices: InvoiceRecord[];
  payrollClaims: PayrollClaim[];
  candidates: RecruitmentCandidate[];
  notifications: NotificationItem[];
  magicLinks?: MagicLinkRegistration[];
}

