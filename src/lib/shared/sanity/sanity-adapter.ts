import { sanityClientLive } from './sanityClient';
import type {
  DatabaseSchema,
  User,
  Subject,
  EducationLevel,
  ClassLevel,
  PackagePlan,
  Enrollment,
  JobPost,
  JobApplication,
  AttendanceRecord,
  InvoiceRecord,
  PayrollClaim,
  RecruitmentCandidate,
  NotificationItem,
  MagicLinkRegistration
} from '$lib/shared/types/common.types';

// ── Helpers ──────────────────────────────────────────────

/** Convert Sanity document _id to our id format */
function mapId(doc: any): string {
  return doc._id?.replace('drafts.', '') || doc._id;
}

/** Convert Sanity date fields to our format */
function mapTimestamps(doc: any): { createdAt: string; updatedAt: string; deletedAt: null } {
  return {
    createdAt: doc._createdAt || new Date().toISOString(),
    updatedAt: doc._updatedAt || new Date().toISOString(),
    deletedAt: null
  };
}

/** Resolve Sanity reference to get the _id string */
function refId(ref: any): string | undefined {
  if (!ref) return undefined;
  if (typeof ref === 'string') return ref;
  return ref._ref?.replace('drafts.', '') || undefined;
}

/** Resolve array of references to id array */
function refArray(refs: any[] | undefined): string[] {
  if (!refs) return [];
  return refs.map((r) => refId(r)).filter(Boolean) as string[];
}

// ── Fetch helpers ────────────────────────────────────────

async function fetchAll<T>(type: string, filter?: string): Promise<T[]> {
  const q = `*[_type == "${type}" ${filter || ''}] | order(_createdAt desc)`;
  return await sanityClientLive.fetch(q);
}

async function fetchById(type: string, id: string): Promise<any> {
  const q = `*[_type == "${type}" && _id == $id][0]`;
  return await sanityClientLive.fetch(q, { id });
}

async function createDoc(type: string, data: any): Promise<any> {
  const doc = { _type: type, ...data };
  const result = await sanityClientLive.create(doc);
  return result;
}

async function updateDoc(id: string, data: any): Promise<any> {
  const result = await sanityClientLive.patch(id).set(data).commit();
  return result;
}

async function deleteDoc(id: string): Promise<void> {
  await sanityClientLive.delete(id);
}

// ── Map Sanity documents to app types ────────────────────

function mapUser(doc: any): User {
  return {
    id: mapId(doc),
    email: doc.email || '',
    password: doc.password,
    fullName: doc.fullName || '',
    phone: doc.phone || '',
    role: doc.role || 'STUDENT',
    position: doc.position,
    education: doc.education,
    experienceYears: doc.experienceYears,
    subjectIds: refArray(doc.subjectIds),
    levelIds: refArray(doc.levelIds),
    school: doc.school,
    address: doc.address,
    occupation: doc.occupation,
    waliUserId: refId(doc.waliUser),
    isActive: doc.isActive,
    candidateStatus: doc.candidateStatus,
    ...mapTimestamps(doc)
  };
}

function mapSubject(doc: any): Subject {
  return {
    id: mapId(doc),
    name: doc.name || '',
    description: doc.description || '',
    ...mapTimestamps(doc)
  };
}

function mapEducationLevel(doc: any): EducationLevel {
  return {
    id: mapId(doc),
    levelName: doc.levelName || '',
    description: doc.description || '',
    ...mapTimestamps(doc)
  };
}

function mapClassLevel(doc: any): ClassLevel {
  return {
    id: mapId(doc),
    className: doc.className || '',
    educationLevelId: refId(doc.educationLevel) || '',
    baseRatePer90Min: doc.baseRatePer90Min || 0,
    description: doc.description || '',
    ...mapTimestamps(doc)
  };
}

function mapPackagePlan(doc: any): PackagePlan {
  return {
    id: mapId(doc),
    name: doc.name || '',
    mode: doc.mode || 'PRIVATE',
    period: doc.period || 'BULANAN',
    price: doc.price || 0,
    sessionsPerPeriod: doc.sessionsPerPeriod || 1,
    maxStudents: doc.maxStudents || 1,
    tentorFee: doc.tentorFee || 0,
    description: doc.description || '',
    active: doc.active !== false,
    ...mapTimestamps(doc)
  };
}

function mapEnrollment(doc: any): Enrollment {
  return {
    id: mapId(doc),
    studentId: refId(doc.student) || '',
    subjectId: refId(doc.subject) || '',
    classId: refId(doc.classLevel) || '',
    packageId: refId(doc.packageId) || refId(doc.packagePlan) || '',
    tentorId: refId(doc.tentor) || null,
    scheduleDay: doc.scheduleDay || '',
    scheduleTime: doc.scheduleTime || '',
    status: doc.status || 'ACTIVE',
    address: doc.address,
    latitude: doc.latitude,
    longitude: doc.longitude,
    waliUserId: refId(doc.waliUser),
    ...mapTimestamps(doc)
  };
}

function mapJobPost(doc: any): JobPost {
  return {
    id: mapId(doc),
    title: doc.title || '',
    classId: refId(doc.classLevel) || '',
    subjectId: refId(doc.subject) || '',
    packageId: refId(doc.packagePlan),
    jobType: doc.jobType || 'REGULAR',
    jobMode: doc.jobMode || 'OFFLINE',
    tentorFee: doc.tentorFee || 0,
    sessionDurationMinutes: doc.sessionDurationMinutes || 90,
    scheduleDays: doc.scheduleDays || [],
    scheduleTime: doc.scheduleTime || '',
    studentCount: doc.studentCount || 1,
    location: doc.location || '',
    latitude: doc.latitude,
    longitude: doc.longitude,
    status: doc.status || 'AVAILABLE',
    assignedTentorId: refId(doc.assignedTentor) || null,
    studentId: refId(doc.student) || null,
    enrollmentId: refId(doc.enrollment) || null,
    notes: doc.notes,
    ...mapTimestamps(doc)
  };
}

function mapJobApplication(doc: any): JobApplication {
  return {
    id: mapId(doc),
    jobId: refId(doc.job) || '',
    tentorId: refId(doc.tentor) || '',
    status: doc.status || 'PENDING',
    appliedAt: doc.appliedAt || new Date().toISOString(),
    notes: doc.notes,
    ...mapTimestamps(doc)
  };
}

function mapAttendanceRecord(doc: any): AttendanceRecord {
  return {
    id: mapId(doc),
    enrollmentId: refId(doc.enrollment) || '',
    tentorId: refId(doc.tentor) || '',
    sessionDate: doc.sessionDate || '',
    startTime: doc.startTime || '',
    endTime: doc.endTime || '',
    topic: doc.topic || '',
    studentNotes: doc.studentNotes || '',
    status: doc.status || 'SUBMITTED',
    latitudeCheckIn: doc.latitudeCheckIn,
    longitudeCheckIn: doc.longitudeCheckIn,
    isRadiusValid: doc.isRadiusValid || false,
    proofPhotoUrl: doc.proofPhotoUrl,
    studentConfirmed: doc.studentConfirmed || false,
    studentRating: doc.studentRating,
    studentFeedback: doc.studentFeedback,
    reviewNotes: doc.reviewNotes,
    ...mapTimestamps(doc)
  };
}

function mapInvoiceRecord(doc: any): InvoiceRecord {
  return {
    id: mapId(doc),
    enrollmentId: refId(doc.enrollment) || '',
    invoiceNumber: doc.invoiceNumber || '',
    amount: doc.amount || 0,
    dueDate: doc.dueDate || '',
    status: doc.status || 'UNPAID',
    paidAt: doc.paidAt || null,
    paymentProofUrl: doc.paymentProofUrl || null,
    periodMonth: doc.periodMonth || 1,
    periodYear: doc.periodYear || new Date().getFullYear(),
    notes: doc.notes,
    ...mapTimestamps(doc)
  };
}

function mapPayrollClaim(doc: any): PayrollClaim {
  return {
    id: mapId(doc),
    tentorId: refId(doc.tentor) || '',
    claimNumber: doc.claimNumber || '',
    periodStart: doc.periodStart || '',
    periodEnd: doc.periodEnd || '',
    periodMonth: doc.periodMonth,
    periodYear: doc.periodYear,
    totalAmount: doc.totalAmount || 0,
    attendanceIds: refArray(doc.attendances),
    status: doc.status || 'REQUESTED',
    paidAt: doc.paidAt || null,
    transferProofUrl: doc.transferProofUrl || null,
    rejectionReason: doc.rejectionReason,
    ...mapTimestamps(doc)
  };
}

function mapRecruitmentCandidate(doc: any): RecruitmentCandidate {
  return {
    id: mapId(doc),
    fullName: doc.fullName || '',
    email: doc.email || '',
    phone: doc.phone || '',
    education: doc.education || '',
    experienceYears: doc.experienceYears || 0,
    subjectIds: refArray(doc.subjectIds),
    levelIds: refArray(doc.levelIds),
    cvUrl: doc.cvUrl,
    status: doc.status || 'REGISTERED',
    notes: doc.notes,
    interviewDate: doc.interviewDate,
    ...mapTimestamps(doc)
  };
}

function mapNotification(doc: any): NotificationItem {
  return {
    id: mapId(doc),
    userId: refId(doc.user) || '',
    title: doc.title || '',
    message: doc.message || '',
    icon: doc.icon || 'notifications',
    read: doc.read || false,
    createdAt: doc._createdAt || new Date().toISOString()
  };
}

function mapMagicLink(doc: any): MagicLinkRegistration {
  return {
    id: mapId(doc),
    token: doc.token || '',
    title: doc.title || '',
    daysValid: doc.daysValid || 7,
    expiresAt: doc.expiresAt || '',
    usedCount: doc.usedCount || 0,
    active: doc.active !== false,
    targetRole: doc.targetRole,
    classId: refId(doc.classLevel),
    packageId: refId(doc.packagePlan),
    createdBy: refId(doc.createdBy),
    ...mapTimestamps(doc)
  };
}

// ── Public API ───────────────────────────────────────────

export const sanityAdapter = {
  /**
   * Load entire database — fetches all collections in parallel.
   * Used to hydrate the Svelte store.
   */
  async loadDatabase(): Promise<DatabaseSchema> {
    const [
      users, subjects, eduLevels, classes, packages,
      enrollments, jobs, applications, attendances,
      invoices, payrollClaims, candidates, notifications, magicLinks
    ] = await Promise.all([
      fetchAll<any>('user'),
      fetchAll<any>('subject'),
      fetchAll<any>('educationLevel'),
      fetchAll<any>('classLevel'),
      fetchAll<any>('packagePlan'),
      fetchAll<any>('enrollment'),
      fetchAll<any>('jobPost'),
      fetchAll<any>('jobApplication'),
      fetchAll<any>('attendanceRecord'),
      fetchAll<any>('invoiceRecord'),
      fetchAll<any>('payrollClaim'),
      fetchAll<any>('recruitmentCandidate'),
      fetchAll<any>('notification'),
      fetchAll<any>('magicLink')
    ]);

    return {
      version: 14,
      seededAt: new Date().toISOString(),
      educationLevels: eduLevels.map(mapEducationLevel),
      classes: classes.map(mapClassLevel),
      subjects: subjects.map(mapSubject),
      packages: packages.map(mapPackagePlan),
      users: users.map(mapUser),
      enrollments: enrollments.map(mapEnrollment),
      jobs: jobs.map(mapJobPost),
      applications: applications.map(mapJobApplication),
      attendances: attendances.map(mapAttendanceRecord),
      invoices: invoices.map(mapInvoiceRecord),
      payrollClaims: payrollClaims.map(mapPayrollClaim),
      candidates: candidates.map(mapRecruitmentCandidate),
      notifications: notifications.map(mapNotification),
      magicLinks: magicLinks.map(mapMagicLink)
    };
  },

  // ── Generic CRUD ──

  async create(type: string, data: any): Promise<any> {
    return createDoc(type, data);
  },

  async update(id: string, data: any): Promise<any> {
    return updateDoc(id, data);
  },

  async softDelete(id: string): Promise<void> {
    await deleteDoc(id);
  },

  // ── Entity-specific create helpers ──

  async createUser(data: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>): Promise<User> {
    const doc = await createDoc('user', {
      email: data.email,
      password: data.password,
      fullName: data.fullName,
      phone: data.phone || '',
      role: data.role || 'STUDENT',
      position: data.position,
      education: data.education,
      experienceYears: data.experienceYears,
      subjectIds: (data.subjectIds || []).map((id) => ({ _type: 'reference', _ref: id })),
      levelIds: (data.levelIds || []).map((id) => ({ _type: 'reference', _ref: id })),
      school: data.school,
      address: data.address,
      occupation: data.occupation,
      waliUser: data.waliUserId ? { _type: 'reference', _ref: data.waliUserId, _weak: true } : undefined,
      isActive: data.isActive ?? true,
      candidateStatus: data.candidateStatus
    });
    return mapUser(doc);
  },

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const patch: any = {};
    if (data.email !== undefined) patch.email = data.email;
    if (data.password !== undefined) patch.password = data.password;
    if (data.fullName !== undefined) patch.fullName = data.fullName;
    if (data.phone !== undefined) patch.phone = data.phone;
    if (data.role !== undefined) patch.role = data.role;
    if (data.position !== undefined) patch.position = data.position;
    if (data.education !== undefined) patch.education = data.education;
    if (data.experienceYears !== undefined) patch.experienceYears = data.experienceYears;
    if (data.school !== undefined) patch.school = data.school;
    if (data.address !== undefined) patch.address = data.address;
    if (data.occupation !== undefined) patch.occupation = data.occupation;
    if (data.isActive !== undefined) patch.isActive = data.isActive;
    if (data.candidateStatus !== undefined) patch.candidateStatus = data.candidateStatus;
    if (data.subjectIds !== undefined) patch.subjectIds = data.subjectIds.map((sid) => ({ _type: 'reference', _ref: sid }));
    if (data.levelIds !== undefined) patch.levelIds = data.levelIds.map((lid) => ({ _type: 'reference', _ref: lid }));
    if (data.waliUserId !== undefined) patch.waliUser = data.waliUserId ? { _type: 'reference', _ref: data.waliUserId, _weak: true } : null;
    const result = await updateDoc(id, patch);
    return mapUser(result);
  },

  async deleteUser(id: string): Promise<void> {
    await deleteDoc(id);
  },

  async activateUser(id: string): Promise<void> {
    await updateDoc(id, { isActive: true });
  },

  // ── Subject ──

  async createSubject(name: string, description: string): Promise<Subject> {
    const doc = await createDoc('subject', { name, description });
    return mapSubject(doc);
  },

  async updateSubject(id: string, name: string, description: string): Promise<Subject> {
    const result = await updateDoc(id, { name, description });
    return mapSubject(result);
  },

  async deleteSubject(id: string): Promise<void> {
    await deleteDoc(id);
  },

  // ── Education Level ──

  async createEducationLevel(levelName: string, description: string): Promise<EducationLevel> {
    const doc = await createDoc('educationLevel', { levelName, description });
    return mapEducationLevel(doc);
  },

  async updateEducationLevel(id: string, levelName: string, description: string): Promise<EducationLevel> {
    const result = await updateDoc(id, { levelName, description });
    return mapEducationLevel(result);
  },

  async deleteEducationLevel(id: string): Promise<void> {
    await deleteDoc(id);
  },

  // ── Class Level ──

  async createClassLevel(data: { className: string; educationLevelId: string; baseRatePer90Min: number; description: string }): Promise<ClassLevel> {
    const doc = await createDoc('classLevel', {
      className: data.className,
      educationLevel: { _type: 'reference', _ref: data.educationLevelId },
      baseRatePer90Min: data.baseRatePer90Min,
      description: data.description
    });
    return mapClassLevel(doc);
  },

  async updateClassLevel(id: string, data: { className: string; educationLevelId: string; baseRatePer90Min: number; description: string }): Promise<ClassLevel> {
    const result = await updateDoc(id, {
      className: data.className,
      educationLevel: { _type: 'reference', _ref: data.educationLevelId },
      baseRatePer90Min: data.baseRatePer90Min,
      description: data.description
    });
    return mapClassLevel(result);
  },

  async deleteClassLevel(id: string): Promise<void> {
    await deleteDoc(id);
  },

  // ── Package Plan ──

  async createPackagePlan(data: Omit<PackagePlan, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>): Promise<PackagePlan> {
    const doc = await createDoc('packagePlan', data);
    return mapPackagePlan(doc);
  },

  async updatePackagePlan(id: string, data: Partial<PackagePlan>): Promise<PackagePlan> {
    const result = await updateDoc(id, data);
    return mapPackagePlan(result);
  },

  async deletePackagePlan(id: string): Promise<void> {
    await deleteDoc(id);
  },

  // ── Enrollment ──

  async createEnrollment(data: Omit<Enrollment, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>): Promise<Enrollment> {
    const doc = await createDoc('enrollment', {
      student: { _type: 'reference', _ref: data.studentId },
      subject: { _type: 'reference', _ref: data.subjectId },
      classLevel: { _type: 'reference', _ref: data.classId },
      packagePlan: { _type: 'reference', _ref: data.packageId },
      tentor: data.tentorId ? { _type: 'reference', _ref: data.tentorId, _weak: true } : undefined,
      scheduleDay: data.scheduleDay,
      scheduleTime: data.scheduleTime,
      status: data.status,
      address: data.address,
      latitude: data.latitude,
      longitude: data.longitude,
      waliUser: data.waliUserId ? { _type: 'reference', _ref: data.waliUserId, _weak: true } : undefined
    });
    return mapEnrollment(doc);
  },

  async deleteEnrollment(id: string): Promise<void> {
    await deleteDoc(id);
  },

  // ── Job Post ──

  async createJobPost(data: Omit<JobPost, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>): Promise<JobPost> {
    const doc = await createDoc('jobPost', {
      title: data.title,
      classLevel: { _type: 'reference', _ref: data.classId },
      subject: { _type: 'reference', _ref: data.subjectId },
      packagePlan: data.packageId ? { _type: 'reference', _ref: data.packageId } : undefined,
      jobType: data.jobType,
      jobMode: data.jobMode,
      tentorFee: data.tentorFee,
      sessionDurationMinutes: data.sessionDurationMinutes,
      scheduleDays: data.scheduleDays,
      scheduleTime: data.scheduleTime,
      studentCount: data.studentCount,
      location: data.location,
      latitude: data.latitude,
      longitude: data.longitude,
      status: data.status,
      assignedTentor: data.assignedTentorId ? { _type: 'reference', _ref: data.assignedTentorId, _weak: true } : undefined,
      student: data.studentId ? { _type: 'reference', _ref: data.studentId, _weak: true } : undefined,
      enrollment: data.enrollmentId ? { _type: 'reference', _ref: data.enrollmentId, _weak: true } : undefined,
      notes: data.notes
    });
    return mapJobPost(doc);
  },

  async updateJobPost(id: string, data: Partial<JobPost>): Promise<JobPost> {
    const patch: any = {};
    if (data.title !== undefined) patch.title = data.title;
    if (data.classId !== undefined) patch.classLevel = { _type: 'reference', _ref: data.classId };
    if (data.subjectId !== undefined) patch.subject = { _type: 'reference', _ref: data.subjectId };
    if (data.status !== undefined) patch.status = data.status;
    if (data.assignedTentorId !== undefined) patch.assignedTentor = data.assignedTentorId ? { _type: 'reference', _ref: data.assignedTentorId, _weak: true } : null;
    if (data.tentorFee !== undefined) patch.tentorFee = data.tentorFee;
    if (data.notes !== undefined) patch.notes = data.notes;
    const result = await updateDoc(id, patch);
    return mapJobPost(result);
  },

  async deleteJob(id: string): Promise<void> {
    await deleteDoc(id);
  },

  // ── Job Application ──

  async createJobApplication(data: { jobId: string; tentorId: string; notes?: string }): Promise<JobApplication> {
    const doc = await createDoc('jobApplication', {
      job: { _type: 'reference', _ref: data.jobId },
      tentor: { _type: 'reference', _ref: data.tentorId },
      status: 'PENDING',
      appliedAt: new Date().toISOString(),
      notes: data.notes || ''
    });
    return mapJobApplication(doc);
  },

  // ── Attendance ──

  async createAttendance(data: Omit<AttendanceRecord, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>): Promise<AttendanceRecord> {
    const doc = await createDoc('attendanceRecord', {
      enrollment: { _type: 'reference', _ref: data.enrollmentId },
      tentor: { _type: 'reference', _ref: data.tentorId },
      sessionDate: data.sessionDate,
      startTime: data.startTime,
      endTime: data.endTime,
      topic: data.topic,
      studentNotes: data.studentNotes,
      status: data.status,
      latitudeCheckIn: data.latitudeCheckIn,
      longitudeCheckIn: data.longitudeCheckIn,
      isRadiusValid: data.isRadiusValid,
      proofPhotoUrl: data.proofPhotoUrl,
      studentConfirmed: data.studentConfirmed,
      reviewNotes: data.reviewNotes
    });
    return mapAttendanceRecord(doc);
  },

  async updateAttendance(id: string, data: Partial<AttendanceRecord>): Promise<AttendanceRecord> {
    const patch: any = {};
    if (data.status !== undefined) patch.status = data.status;
    if (data.reviewNotes !== undefined) patch.reviewNotes = data.reviewNotes;
    if (data.studentConfirmed !== undefined) patch.studentConfirmed = data.studentConfirmed;
    if (data.studentRating !== undefined) patch.studentRating = data.studentRating;
    if (data.studentFeedback !== undefined) patch.studentFeedback = data.studentFeedback;
    const result = await updateDoc(id, patch);
    return mapAttendanceRecord(result);
  },

  // ── Invoice ──

  async createInvoice(data: Omit<InvoiceRecord, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>): Promise<InvoiceRecord> {
    const doc = await createDoc('invoiceRecord', {
      enrollment: { _type: 'reference', _ref: data.enrollmentId },
      invoiceNumber: data.invoiceNumber,
      amount: data.amount,
      dueDate: data.dueDate,
      status: data.status,
      periodMonth: data.periodMonth,
      periodYear: data.periodYear,
      notes: data.notes
    });
    return mapInvoiceRecord(doc);
  },

  async updateInvoice(id: string, data: Partial<InvoiceRecord>): Promise<InvoiceRecord> {
    const patch: any = {};
    if (data.status !== undefined) patch.status = data.status;
    if (data.paidAt !== undefined) patch.paidAt = data.paidAt;
    if (data.paymentProofUrl !== undefined) patch.paymentProofUrl = data.paymentProofUrl;
    const result = await updateDoc(id, patch);
    return mapInvoiceRecord(result);
  },

  async deleteInvoice(id: string): Promise<void> {
    await deleteDoc(id);
  },

  // ── Payroll Claim ──

  async createPayrollClaim(data: Omit<PayrollClaim, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>): Promise<PayrollClaim> {
    const doc = await createDoc('payrollClaim', {
      tentor: { _type: 'reference', _ref: data.tentorId },
      claimNumber: data.claimNumber,
      periodStart: data.periodStart,
      periodEnd: data.periodEnd,
      periodMonth: data.periodMonth,
      periodYear: data.periodYear,
      totalAmount: data.totalAmount,
      attendances: (data.attendanceIds || []).map((aid) => ({ _type: 'reference', _ref: aid })),
      status: data.status,
      transferProofUrl: data.transferProofUrl
    });
    return mapPayrollClaim(doc);
  },

  async updatePayrollClaim(id: string, data: Partial<PayrollClaim>): Promise<PayrollClaim> {
    const patch: any = {};
    if (data.status !== undefined) patch.status = data.status;
    if (data.paidAt !== undefined) patch.paidAt = data.paidAt;
    if (data.transferProofUrl !== undefined) patch.transferProofUrl = data.transferProofUrl;
    if (data.rejectionReason !== undefined) patch.rejectionReason = data.rejectionReason;
    const result = await updateDoc(id, patch);
    return mapPayrollClaim(result);
  },

  // ── Candidate ──

  async createCandidate(data: Omit<RecruitmentCandidate, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>): Promise<RecruitmentCandidate> {
    const doc = await createDoc('recruitmentCandidate', {
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      education: data.education,
      experienceYears: data.experienceYears,
      subjectIds: (data.subjectIds || []).map((id) => ({ _type: 'reference', _ref: id })),
      levelIds: (data.levelIds || []).map((id) => ({ _type: 'reference', _ref: id })),
      cvUrl: data.cvUrl,
      status: data.status || 'REGISTERED',
      notes: data.notes,
      interviewDate: data.interviewDate
    });
    return mapRecruitmentCandidate(doc);
  },

  async updateCandidate(id: string, data: Partial<RecruitmentCandidate>): Promise<RecruitmentCandidate> {
    const patch: any = {};
    if (data.status !== undefined) patch.status = data.status;
    if (data.notes !== undefined) patch.notes = data.notes;
    if (data.interviewDate !== undefined) patch.interviewDate = data.interviewDate;
    const result = await updateDoc(id, patch);
    return mapRecruitmentCandidate(result);
  },

  // ── Notification ──

  async createNotification(data: Omit<NotificationItem, 'id' | 'createdAt'>): Promise<NotificationItem> {
    const doc = await createDoc('notification', {
      user: { _type: 'reference', _ref: data.userId },
      title: data.title,
      message: data.message,
      icon: data.icon,
      read: data.read
    });
    return mapNotification(doc);
  },

  async markNotificationRead(id: string): Promise<void> {
    await updateDoc(id, { read: true });
  },

  // ── Magic Link ──

  async createMagicLink(data: Omit<MagicLinkRegistration, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>): Promise<MagicLinkRegistration> {
    const doc = await createDoc('magicLink', {
      token: data.token,
      title: data.title,
      daysValid: data.daysValid,
      expiresAt: data.expiresAt,
      usedCount: data.usedCount,
      active: data.active,
      targetRole: data.targetRole,
      classLevel: data.classId ? { _type: 'reference', _ref: data.classId, _weak: true } : undefined,
      packagePlan: data.packageId ? { _type: 'reference', _ref: data.packageId, _weak: true } : undefined,
      createdBy: data.createdBy ? { _type: 'reference', _ref: data.createdBy, _weak: true } : undefined
    });
    return mapMagicLink(doc);
  },

  async updateMagicLink(id: string, data: Partial<MagicLinkRegistration>): Promise<MagicLinkRegistration> {
    const patch: any = {};
    if (data.active !== undefined) patch.active = data.active;
    if (data.usedCount !== undefined) patch.usedCount = data.usedCount;
    const result = await updateDoc(id, patch);
    return mapMagicLink(result);
  },

  async deleteMagicLink(id: string): Promise<void> {
    await deleteDoc(id);
  }
};
