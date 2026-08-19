import { writable, get } from 'svelte/store';
import type {
  DatabaseSchema,
  ApiResponse,
  User,
  JobPost,
  JobApplication,
  AttendanceRecord,
  InvoiceRecord,
  PayrollClaim,
  RecruitmentCandidate,
  Subject,
  EducationLevel,
  ClassLevel,
  PackagePlan,
  Enrollment,
  NotificationItem,
  MagicLinkRegistration
} from '$lib/shared/types/common.types';
import { createInitialDatabaseSeed } from '$lib/shared/db/seed-data';
import { generateEntityId } from '$lib/shared/utils/id-generator';

const DATABASE_STORAGE_KEY = 'bms_db_v13';

// ── API helpers ──────────────────────────────────────────

async function apiFetch<T>(path: string, options?: RequestInit): Promise<{ error: boolean; data: T | null; message?: string }> {
  try {
    const res = await fetch(path, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options?.headers }
    });
    return await res.json();
  } catch (err: any) {
    return { error: true, data: null, message: err.message };
  }
}

async function apiPost<T>(path: string, body: any): Promise<{ error: boolean; data: T | null; message?: string }> {
  return apiFetch<T>(path, { method: 'POST', body: JSON.stringify(body) });
}

async function apiDelete(path: string, id: string): Promise<{ error: boolean; data: null; message?: string }> {
  return apiFetch<null>(`${path}?id=${id}`, { method: 'DELETE' });
}

// ── Database load ────────────────────────────────────────

async function loadDatabaseFromApi(): Promise<DatabaseSchema> {
  if (typeof window === 'undefined') {
    return createInitialDatabaseSeed();
  }

  // Try Neon via BFF
  try {
    console.log('[SentraEdu] Loading data from Neon...');
    const res = await apiFetch<{ data: DatabaseSchema }>('/api/db');      if (!res.error && res.data) {
      console.log('[SentraEdu] Neon data loaded successfully.');
      return (res.data as any).data || res.data;
    }
  } catch (err) {
    console.warn('[SentraEdu] Neon load failed:', err);
  }

  // Fallback: localStorage (only if API unavailable)
  try {
    const rawData = localStorage.getItem(DATABASE_STORAGE_KEY);
    if (rawData) {
      const parsedData = JSON.parse(rawData) as DatabaseSchema;
      if (parsedData.users && parsedData.jobs) {
        console.log('[SentraEdu] Falling back to localStorage cache.');
        return parsedData;
      }
    }
  } catch { /* ignore */ }

  return createInitialDatabaseSeed();
}

function createDatabaseStore() {
  const store = writable<DatabaseSchema>(createInitialDatabaseSeed());

  // Async init: load from Neon
  if (typeof window !== 'undefined') {
    loadDatabaseFromApi().then((data) => {
      store.set(data);
    });
  }

  function persistDatabase(updatedDatabase: DatabaseSchema): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(DATABASE_STORAGE_KEY, JSON.stringify(updatedDatabase));
    }
    store.set(updatedDatabase);
  }

  return {
    subscribe: store.subscribe,
    getSnapshot: (): DatabaseSchema => get(store),

    resetToFactoryDefaults: (): ApiResponse<DatabaseSchema> => {
      const freshSeed = createInitialDatabaseSeed();
      persistDatabase(freshSeed);
      return { error: false, statusCode: 200, message: 'Basis data berhasil direset.', data: freshSeed };
    },

    importDatabaseJson: (jsonString: string): ApiResponse<DatabaseSchema> => {
      try {
        const parsedDatabase = JSON.parse(jsonString);
        if (!parsedDatabase.users || !parsedDatabase.jobs) {
          return { error: true, statusCode: 400, message: 'Format data JSON tidak valid.', data: null };
        }
        persistDatabase(parsedDatabase);
        return { error: false, statusCode: 200, message: 'Data berhasil dipulihkan.', data: parsedDatabase };
      } catch {
        return { error: true, statusCode: 400, message: 'Gagal mengurai JSON.', data: null };
      }
    },

    // ── NOTIFICATIONS ──
    pushNotification: (targetUserId: string, title: string, message: string, icon: string = 'notifications'): void => {
      const currentDb = get(store);
      const newNotification: NotificationItem = {
        id: generateEntityId('notif'),
        userId: targetUserId,
        title, message, icon,
        read: false,
        createdAt: new Date().toISOString()
      };
      persistDatabase({ ...currentDb, notifications: [newNotification, ...(currentDb.notifications || [])] });
    },

    markNotificationAsRead: (notificationId: string): ApiResponse<null> => {
      const currentDb = get(store);
      const updatedNotifications = (currentDb.notifications || []).map((item) =>
        item.id === notificationId ? { ...item, read: true } : item
      );
      persistDatabase({ ...currentDb, notifications: updatedNotifications });
      return { error: false, statusCode: 200, message: 'Notifikasi ditandai sudah dibaca.', data: null };
    },

    markAllNotificationsAsRead: (targetUserId: string): ApiResponse<null> => {
      const currentDb = get(store);
      const updatedNotifications = (currentDb.notifications || []).map((item) =>
        item.userId === targetUserId ? { ...item, read: true } : item
      );
      persistDatabase({ ...currentDb, notifications: updatedNotifications });
      return { error: false, statusCode: 200, message: 'Semua notifikasi ditandai sudah dibaca.', data: null };
    },

    // ── MASTER DATA: SUBJECTS ──
    saveSubject: (payload: { id?: string; name: string; description: string }): ApiResponse<Subject> => {
      if (!payload.name.trim()) return { error: true, statusCode: 400, message: 'Nama mata pelajaran wajib diisi.', data: null };
      // Delegate to API, reload store after
      const currentDb = get(store);
      const now = new Date().toISOString();
      if (payload.id) {
        let updatedSubject: Subject | null = null;
        const updatedSubjects = currentDb.subjects.map((sub) => {
          if (sub.id === payload.id) {
            updatedSubject = { ...sub, name: payload.name.trim(), description: payload.description.trim(), updatedAt: now };
            return updatedSubject;
          }
          return sub;
        });
        persistDatabase({ ...currentDb, subjects: updatedSubjects });
        // Fire-and-forget API call
        apiPost('/api/subjects', { id: payload.id, name: payload.name.trim(), description: payload.description.trim() });
        return { error: false, statusCode: 200, message: 'Mata pelajaran berhasil diperbarui.', data: updatedSubject };
      } else {
        const isDuplicate = currentDb.subjects.some((sub) => sub.deletedAt === null && sub.name.toLowerCase() === payload.name.trim().toLowerCase());
        if (isDuplicate) return { error: true, statusCode: 409, message: 'Nama mata pelajaran sudah terdaftar.', data: null };
        const newSubject: Subject = { id: generateEntityId('sj'), name: payload.name.trim(), description: payload.description.trim(), createdAt: now, updatedAt: now, deletedAt: null };
        persistDatabase({ ...currentDb, subjects: [...currentDb.subjects, newSubject] });
        apiPost('/api/subjects', { name: payload.name.trim(), description: payload.description.trim() });
        return { error: false, statusCode: 201, message: 'Mata pelajaran baru berhasil ditambahkan.', data: newSubject };
      }
    },

    deleteSubject: (subjectId: string): ApiResponse<null> => {
      const currentDb = get(store);
      if (currentDb.jobs.some((j) => j.deletedAt === null && j.subjectId === subjectId))
        return { error: true, statusCode: 400, message: 'Mata pelajaran masih digunakan pada lowongan.', data: null };
      if (currentDb.enrollments.some((e) => e.deletedAt === null && e.subjectId === subjectId))
        return { error: true, statusCode: 400, message: 'Mata pelajaran masih terdaftar pada siswa aktif.', data: null };
      const now = new Date().toISOString();
      const updated = currentDb.subjects.map((s) => s.id === subjectId ? { ...s, deletedAt: now, updatedAt: now } : s);
      persistDatabase({ ...currentDb, subjects: updated });
      apiDelete('/api/subjects', subjectId);
      return { error: false, statusCode: 200, message: 'Mata pelajaran berhasil dihapus.', data: null };
    },

    // ── MASTER DATA: EDUCATION LEVELS & CLASSES ──
    saveEducationLevel: (payload: { id?: string; levelName: string; description: string }): ApiResponse<EducationLevel> => {
      if (!payload.levelName.trim()) return { error: true, statusCode: 400, message: 'Nama jenjang wajib diisi.', data: null };
      const currentDb = get(store);
      const now = new Date().toISOString();
      if (payload.id) {
        let updated: EducationLevel | null = null;
        const list = currentDb.educationLevels.map((i) => { if (i.id === payload.id) { updated = { ...i, levelName: payload.levelName.trim(), description: payload.description.trim(), updatedAt: now }; return updated; } return i; });
        persistDatabase({ ...currentDb, educationLevels: list });
        apiPost('/api/education-levels', { id: payload.id, levelName: payload.levelName.trim(), description: payload.description.trim() });
        return { error: false, statusCode: 200, message: 'Jenjang berhasil diperbarui.', data: updated };
      } else {
        const newLevel: EducationLevel = { id: generateEntityId('lv'), levelName: payload.levelName.trim(), description: payload.description.trim(), createdAt: now, updatedAt: now, deletedAt: null };
        persistDatabase({ ...currentDb, educationLevels: [...currentDb.educationLevels, newLevel] });
        apiPost('/api/education-levels', { levelName: payload.levelName.trim(), description: payload.description.trim() });
        return { error: false, statusCode: 201, message: 'Jenjang baru berhasil ditambahkan.', data: newLevel };
      }
    },

    saveClassLevel: (payload: { id?: string; className: string; educationLevelId: string; baseRatePer90Min: number; description: string }): ApiResponse<ClassLevel> => {
      if (!payload.className.trim()) return { error: true, statusCode: 400, message: 'Nama kelas wajib diisi.', data: null };
      const currentDb = get(store);
      const now = new Date().toISOString();
      if (payload.id) {
        let updated: ClassLevel | null = null;
        const list = currentDb.classes.map((i) => { if (i.id === payload.id) { updated = { ...i, className: payload.className.trim(), educationLevelId: payload.educationLevelId, baseRatePer90Min: Number(payload.baseRatePer90Min) || 0, description: payload.description.trim(), updatedAt: now }; return updated; } return i; });
        persistDatabase({ ...currentDb, classes: list });
        apiPost('/api/classes', payload);
        return { error: false, statusCode: 200, message: 'Kelas berhasil diperbarui.', data: updated };
      } else {
        const newClass: ClassLevel = { id: generateEntityId('cl'), className: payload.className.trim(), educationLevelId: payload.educationLevelId, baseRatePer90Min: Number(payload.baseRatePer90Min) || 0, description: payload.description.trim(), createdAt: now, updatedAt: now, deletedAt: null };
        persistDatabase({ ...currentDb, classes: [...currentDb.classes, newClass] });
        apiPost('/api/classes', payload);
        return { error: false, statusCode: 201, message: 'Kelas baru berhasil ditambahkan.', data: newClass };
      }
    },

    deleteClassLevel: (classId: string): ApiResponse<null> => {
      const currentDb = get(store);
      if (currentDb.jobs.some((j) => j.deletedAt === null && j.classId === classId))
        return { error: true, statusCode: 400, message: 'Kelas masih digunakan pada lowongan.', data: null };
      const now = new Date().toISOString();
      persistDatabase({ ...currentDb, classes: currentDb.classes.map((c) => c.id === classId ? { ...c, deletedAt: now, updatedAt: now } : c) });
      apiDelete('/api/classes', classId);
      return { error: false, statusCode: 200, message: 'Kelas berhasil dihapus.', data: null };
    },

    // ── MASTER DATA: PACKAGES ──
    savePackagePlan: (payload: { id?: string; name: string; mode: 'PRIVATE' | 'KELOMPOK'; period: 'BULANAN' | 'HARIAN'; price: number; sessionsPerPeriod: number; maxStudents: number; tentorFee: number; description: string; active: boolean }): ApiResponse<PackagePlan> => {
      if (!payload.name.trim()) return { error: true, statusCode: 400, message: 'Nama paket wajib diisi.', data: null };
      const currentDb = get(store);
      const now = new Date().toISOString();
      if (payload.id) {
        let updated: PackagePlan | null = null;
        const list = currentDb.packages.map((p) => { if (p.id === payload.id) { updated = { ...p, ...payload, updatedAt: now } as PackagePlan; return updated; } return p; });
        persistDatabase({ ...currentDb, packages: list });
        apiPost('/api/packages', payload);
        return { error: false, statusCode: 200, message: 'Paket les berhasil diperbarui.', data: updated };
      } else {
        const newPkg: PackagePlan = { id: generateEntityId('pkg'), ...payload, price: Number(payload.price) || 0, sessionsPerPeriod: Number(payload.sessionsPerPeriod) || 1, maxStudents: Number(payload.maxStudents) || 1, tentorFee: Number(payload.tentorFee) || 0, createdAt: now, updatedAt: now, deletedAt: null };
        persistDatabase({ ...currentDb, packages: [...currentDb.packages, newPkg] });
        apiPost('/api/packages', payload);
        return { error: false, statusCode: 201, message: 'Paket les baru berhasil ditambahkan.', data: newPkg };
      }
    },

    savePackage: (pkg: Partial<PackagePlan> & { id: string }): ApiResponse<PackagePlan> => {
      const currentDb = get(store);
      const now = new Date().toISOString();
      let updated: PackagePlan | null = null;
      const list = currentDb.packages.map((p) => { if (p.id === pkg.id) { updated = { ...p, ...pkg, updatedAt: now } as PackagePlan; return updated; } return p; });
      persistDatabase({ ...currentDb, packages: list });
      apiPost('/api/packages', pkg);
      return { error: false, statusCode: 200, message: 'Paket les berhasil diperbarui.', data: updated };
    },

    deletePackage: (packageId: string): ApiResponse<null> => {
      const currentDb = get(store);
      const now = new Date().toISOString();
      persistDatabase({ ...currentDb, packages: currentDb.packages.map((p) => p.id === packageId ? { ...p, deletedAt: now, updatedAt: now } : p) });
      apiDelete('/api/packages', packageId);
      return { error: false, statusCode: 200, message: 'Paket les berhasil dihapus.', data: null };
    },

    // ── USERS MANAGEMENT ──
    saveUser: (userPayload: Partial<User> & { fullName: string; email: string }): ApiResponse<User> => {
      if (!userPayload.email?.trim() || !userPayload.fullName?.trim())
        return { error: true, statusCode: 400, message: 'Nama lengkap dan email wajib diisi.', data: null };
      const currentDb = get(store);
      const now = new Date().toISOString();
      if (userPayload.id) {
        let updatedUser: User | null = null;
        const updatedUsers = currentDb.users.map((u) => { if (u.id === userPayload.id) { updatedUser = { ...u, ...userPayload, updatedAt: now } as User; return updatedUser; } return u; });
        persistDatabase({ ...currentDb, users: updatedUsers });
        apiPost('/api/users', userPayload);
        return { error: false, statusCode: 200, message: 'Data pengguna berhasil diperbarui.', data: updatedUser };
      } else {
        if (currentDb.users.some((u) => u.deletedAt === null && u.email.toLowerCase() === userPayload.email?.trim().toLowerCase()))
          return { error: true, statusCode: 409, message: 'Email sudah digunakan.', data: null };
        const newUser: User = { id: generateEntityId('u'), email: userPayload.email.trim(), password: userPayload.password || 'password123', fullName: userPayload.fullName.trim(), phone: userPayload.phone || '', role: userPayload.role || 'STUDENT', position: userPayload.position, education: userPayload.education, experienceYears: userPayload.experienceYears, subjectIds: userPayload.subjectIds || [], levelIds: userPayload.levelIds || [], school: userPayload.school, address: userPayload.address, createdAt: now, updatedAt: now, deletedAt: null };
        persistDatabase({ ...currentDb, users: [...currentDb.users, newUser] });
        apiPost('/api/users', userPayload);
        return { error: false, statusCode: 201, message: 'Pengguna baru berhasil ditambahkan.', data: newUser };
      }
    },

    deleteUser: (userId: string): ApiResponse<null> => {
      const currentDb = get(store);
      const now = new Date().toISOString();
      persistDatabase({ ...currentDb, users: currentDb.users.map((u) => u.id === userId ? { ...u, deletedAt: now, updatedAt: now } : u) });
      apiDelete('/api/users', userId);
      return { error: false, statusCode: 200, message: 'Akun pengguna berhasil dinonaktifkan.', data: null };
    },

    activateUser: (userId: string): ApiResponse<User> => {
      const currentDb = get(store);
      const now = new Date().toISOString();
      let name = 'pengguna';
      const updated = currentDb.users.map((u) => { if (u.id === userId) { name = u.fullName; return { ...u, isActive: true, updatedAt: now }; } return u; });
      persistDatabase({ ...currentDb, users: updated });
      apiPost('/api/users', { id: userId, isActive: true });
      return { error: false, statusCode: 200, message: `Akun ${name} berhasil diaktifkan.`, data: null };
    },

    // ── JOB MANAGEMENT ──
    saveJobPost: (jobPayload: Partial<JobPost> & { id?: string }): ApiResponse<JobPost> => {
      if (!jobPayload.id && !jobPayload.title?.trim()) return { error: true, statusCode: 400, message: 'Judul lowongan wajib diisi.', data: null };
      const currentDb = get(store);
      const now = new Date().toISOString();
      if (jobPayload.id) {
        let updated: JobPost | null = null;
        const list = currentDb.jobs.map((j) => { if (j.id === jobPayload.id) { updated = { ...j, ...jobPayload, updatedAt: now } as JobPost; return updated; } return j; });
        persistDatabase({ ...currentDb, jobs: list });
        apiPost('/api/jobs', jobPayload);
        return { error: false, statusCode: 200, message: 'Lowongan diperbarui.', data: updated };
      } else {
        const newJob: JobPost = { id: generateEntityId('job'), title: (jobPayload.title || '').trim(), classId: jobPayload.classId || '', subjectId: jobPayload.subjectId || '', jobType: jobPayload.jobType || 'REGULAR', jobMode: jobPayload.jobMode || 'OFFLINE', tentorFee: Number(jobPayload.tentorFee) || 120000, sessionDurationMinutes: Number(jobPayload.sessionDurationMinutes) || 90, scheduleDays: jobPayload.scheduleDays || ['Senin'], scheduleTime: jobPayload.scheduleTime || '16:00', studentCount: Number(jobPayload.studentCount) || 1, location: jobPayload.location || '', latitude: jobPayload.latitude || null, longitude: jobPayload.longitude || null, status: 'AVAILABLE', assignedTentorId: null, studentId: jobPayload.studentId || null, enrollmentId: jobPayload.enrollmentId || null, notes: jobPayload.notes || '', createdAt: now, updatedAt: now, deletedAt: null };
        persistDatabase({ ...currentDb, jobs: [newJob, ...currentDb.jobs] });
        apiPost('/api/jobs', jobPayload);
        return { error: false, statusCode: 201, message: 'Lowongan baru berhasil dipublikasikan.', data: newJob };
      }
    },

    assignTentorToJob: (jobId: string, tentorId: string): ApiResponse<JobPost> => {
      const currentDb = get(store);
      const now = new Date().toISOString();
      let targetJob: JobPost | null = null;
      const updatedJobs = currentDb.jobs.map((j) => { if (j.id === jobId) { targetJob = { ...j, assignedTentorId: tentorId, status: 'ASSIGNED', updatedAt: now }; return targetJob; } return j; });
      let updatedEnrollments = currentDb.enrollments;
      if (targetJob && (targetJob as JobPost).enrollmentId) {
        updatedEnrollments = currentDb.enrollments.map((e) => e.id === (targetJob as JobPost).enrollmentId ? { ...e, tentorId, status: 'ACTIVE', updatedAt: now } : e);
      }
      persistDatabase({ ...currentDb, jobs: updatedJobs, enrollments: updatedEnrollments });
      apiPost('/api/jobs', { id: jobId, assignedTentorId: tentorId, status: 'ASSIGNED' });
      return { error: false, statusCode: 200, message: 'Tentor berhasil ditugaskan.', data: targetJob };
    },

    applyToJob: (jobId: string, tentorId: string, notes?: string): ApiResponse<JobApplication> => {
      const currentDb = get(store);
      const now = new Date().toISOString();
      if (currentDb.applications.some((a) => a.deletedAt === null && a.jobId === jobId && a.tentorId === tentorId))
        return { error: true, statusCode: 409, message: 'Anda sudah pernah melamar.', data: null };
      const newApp: JobApplication = { id: generateEntityId('app'), jobId, tentorId, status: 'PENDING', appliedAt: now, notes: notes || '', createdAt: now, updatedAt: now, deletedAt: null };
      persistDatabase({ ...currentDb, applications: [newApp, ...currentDb.applications] });
      apiPost('/api/enrollments', { jobId, tentorId, notes });
      return { error: false, statusCode: 201, message: 'Lamaran berhasil dikirim.', data: newApp };
    },

    deleteJob: (jobId: string): ApiResponse<null> => {
      const currentDb = get(store);
      const now = new Date().toISOString();
      persistDatabase({ ...currentDb, jobs: currentDb.jobs.map((j) => j.id === jobId ? { ...j, deletedAt: now, updatedAt: now } : j) });
      apiDelete('/api/jobs', jobId);
      return { error: false, statusCode: 200, message: 'Lowongan berhasil dihapus.', data: null };
    },

    // ── ENROLLMENTS ──
    saveEnrollment: (payload: Partial<Enrollment> & { studentId: string; subjectId: string; classId: string; packageId: string }): ApiResponse<Enrollment> => {
      const currentDb = get(store);
      const now = new Date().toISOString();
      if (payload.id) {
        let updated: Enrollment | null = null;
        const list = currentDb.enrollments.map((e) => { if (e.id === payload.id) { updated = { ...e, ...payload, updatedAt: now } as Enrollment; return updated; } return e; });
        persistDatabase({ ...currentDb, enrollments: list });
        apiPost('/api/enrollments', payload);
        return { error: false, statusCode: 200, message: 'Pendaftaran diperbarui.', data: updated };
      } else {
        const newEnr: Enrollment = { id: generateEntityId('enr'), studentId: payload.studentId, subjectId: payload.subjectId, classId: payload.classId, packageId: payload.packageId, tentorId: payload.tentorId || null, scheduleDay: payload.scheduleDay || 'Senin, Rabu', scheduleTime: payload.scheduleTime || '16:00 - 17:30', status: 'ACTIVE', address: payload.address, latitude: payload.latitude, longitude: payload.longitude, waliUserId: payload.waliUserId, createdAt: now, updatedAt: now, deletedAt: null };
        persistDatabase({ ...currentDb, enrollments: [newEnr, ...currentDb.enrollments] });
        apiPost('/api/enrollments', payload);
        return { error: false, statusCode: 201, message: 'Siswa berhasil didaftarkan.', data: newEnr };
      }
    },

    deleteEnrollment: (enrollmentId: string): ApiResponse<null> => {
      const currentDb = get(store);
      const now = new Date().toISOString();
      persistDatabase({ ...currentDb, enrollments: currentDb.enrollments.map((e) => e.id === enrollmentId ? { ...e, deletedAt: now, updatedAt: now } : e) });
      apiDelete('/api/enrollments', enrollmentId);
      return { error: false, statusCode: 200, message: 'Pendaftaran berhasil dihapus.', data: null };
    },

    // ── ATTENDANCE ──
    submitAttendance: (payload: { enrollmentId: string; tentorId: string; sessionDate: string; startTime: string; endTime: string; topic: string; studentNotes: string; latitudeCheckIn: number | null; longitudeCheckIn: number | null; isRadiusValid: boolean; proofPhotoUrl?: string }): ApiResponse<AttendanceRecord> => {
      if (!payload.topic.trim()) return { error: true, statusCode: 400, message: 'Topik wajib diisi.', data: null };
      const currentDb = get(store);
      const now = new Date().toISOString();
      const newAtt: AttendanceRecord = { id: generateEntityId('att'), enrollmentId: payload.enrollmentId, tentorId: payload.tentorId, sessionDate: payload.sessionDate, startTime: payload.startTime, endTime: payload.endTime, topic: payload.topic.trim(), studentNotes: payload.studentNotes.trim(), status: 'SUBMITTED', latitudeCheckIn: payload.latitudeCheckIn, longitudeCheckIn: payload.longitudeCheckIn, isRadiusValid: payload.isRadiusValid, proofPhotoUrl: payload.proofPhotoUrl || 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=500&q=80', studentConfirmed: false, createdAt: now, updatedAt: now, deletedAt: null };
      persistDatabase({ ...currentDb, attendances: [newAtt, ...currentDb.attendances] });
      apiPost('/api/attendances', payload);
      return { error: false, statusCode: 201, message: 'Presensi berhasil dikirim.', data: newAtt };
    },

    verifyAttendance: (attendanceId: string, newStatus: 'APPROVED' | 'REJECTED', reviewNotes?: string): ApiResponse<AttendanceRecord> => {
      const currentDb = get(store);
      const now = new Date().toISOString();
      let target: AttendanceRecord | null = null;
      const list = currentDb.attendances.map((a) => { if (a.id === attendanceId) { target = { ...a, status: newStatus, reviewNotes: reviewNotes || '', updatedAt: now }; return target; } return a; });
      persistDatabase({ ...currentDb, attendances: list });
      apiPost('/api/attendances', { id: attendanceId, status: newStatus, reviewNotes });
      return { error: false, statusCode: 200, message: newStatus === 'APPROVED' ? 'Presensi disetujui.' : 'Presensi ditolak.', data: target };
    },

    // ── INVOICES ──
    createInvoice: (payload: { enrollmentId: string; amount: number; dueDate: string; periodMonth: number; periodYear: number; notes?: string }): ApiResponse<InvoiceRecord> => {
      const currentDb = get(store);
      const now = new Date().toISOString();
      const newInv: InvoiceRecord = { id: generateEntityId('inv'), enrollmentId: payload.enrollmentId, invoiceNumber: `INV/${payload.periodYear}/${String(payload.periodMonth).padStart(2, '0')}/${Math.floor(100 + Math.random() * 900)}`, amount: Number(payload.amount) || 0, dueDate: payload.dueDate, status: 'UNPAID', paidAt: null, paymentProofUrl: null, periodMonth: payload.periodMonth, periodYear: payload.periodYear, notes: payload.notes || '', createdAt: now, updatedAt: now, deletedAt: null };
      persistDatabase({ ...currentDb, invoices: [newInv, ...currentDb.invoices] });
      apiPost('/api/invoices', payload);
      return { error: false, statusCode: 201, message: 'Tagihan SPP berhasil diterbitkan.', data: newInv };
    },

    confirmInvoicePayment: (invoiceId: string, proofUrl?: string): ApiResponse<InvoiceRecord> => {
      const currentDb = get(store);
      const now = new Date().toISOString();
      let target: InvoiceRecord | null = null;
      const list = currentDb.invoices.map((i) => { if (i.id === invoiceId) { target = { ...i, status: 'PAID', paidAt: now, paymentProofUrl: proofUrl || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&q=80', updatedAt: now }; return target; } return i; });
      persistDatabase({ ...currentDb, invoices: list });
      apiPost('/api/invoices', { id: invoiceId, status: 'PAID', paidAt: now, paymentProofUrl: proofUrl });
      return { error: false, statusCode: 200, message: 'Pembayaran berhasil dikonfirmasi.', data: target };
    },

    saveInvoice: (inv: Partial<InvoiceRecord> & { id: string }): ApiResponse<InvoiceRecord> => {
      const currentDb = get(store);
      const now = new Date().toISOString();
      let updated: InvoiceRecord | null = null;
      const list = currentDb.invoices.map((i) => { if (i.id === inv.id) { updated = { ...i, ...inv, updatedAt: now } as InvoiceRecord; return updated; } return i; });
      persistDatabase({ ...currentDb, invoices: list });
      apiPost('/api/invoices', inv);
      return { error: false, statusCode: 200, message: 'Invoice diperbarui.', data: updated };
    },

    deleteInvoice: (invoiceId: string): ApiResponse<null> => {
      const currentDb = get(store);
      const now = new Date().toISOString();
      persistDatabase({ ...currentDb, invoices: currentDb.invoices.map((i) => i.id === invoiceId ? { ...i, deletedAt: now, updatedAt: now } : i) });
      apiDelete('/api/invoices', invoiceId);
      return { error: false, statusCode: 200, message: 'Invoice dihapus.', data: null };
    },

    // ── PAYROLL CLAIMS ──
    submitPayrollClaim: (payload: { tentorId: string; periodStart: string; periodEnd: string; totalAmount: number; attendanceIds: string[] }): ApiResponse<PayrollClaim> => {
      const currentDb = get(store);
      const now = new Date().toISOString();
      const newClaim: PayrollClaim = { id: generateEntityId('pay'), tentorId: payload.tentorId, claimNumber: `PAY/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${Math.floor(100 + Math.random() * 900)}`, periodStart: payload.periodStart, periodEnd: payload.periodEnd, totalAmount: payload.totalAmount, attendanceIds: payload.attendanceIds, status: 'REQUESTED', paidAt: null, transferProofUrl: null, createdAt: now, updatedAt: now, deletedAt: null };
      persistDatabase({ ...currentDb, payrollClaims: [newClaim, ...currentDb.payrollClaims] });
      apiPost('/api/payroll', payload);
      return { error: false, statusCode: 201, message: 'Klaim honor berhasil diajukan.', data: newClaim };
    },

    processPayrollPayment: (claimId: string, transferProofUrl?: string): ApiResponse<PayrollClaim> => {
      const currentDb = get(store);
      const now = new Date().toISOString();
      let target: PayrollClaim | null = null;
      const list = currentDb.payrollClaims.map((c) => { if (c.id === claimId) { target = { ...c, status: 'PAID', paidAt: now, transferProofUrl: transferProofUrl || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&q=80', updatedAt: now }; return target; } return c; });
      persistDatabase({ ...currentDb, payrollClaims: list });
      apiPost('/api/payroll', { id: claimId, status: 'PAID', paidAt: now, transferProofUrl });
      return { error: false, statusCode: 200, message: 'Honor berhasil ditransfer.', data: target };
    },

    savePayrollClaim: (claim: Partial<PayrollClaim> & { id: string }): ApiResponse<PayrollClaim> => {
      const currentDb = get(store);
      const now = new Date().toISOString();
      let updated: PayrollClaim | null = null;
      const list = currentDb.payrollClaims.map((c) => { if (c.id === claim.id) { updated = { ...c, ...claim, updatedAt: now } as PayrollClaim; return updated; } return c; });
      persistDatabase({ ...currentDb, payrollClaims: list });
      apiPost('/api/payroll', claim);
      return { error: false, statusCode: 200, message: 'Klaim diperbarui.', data: updated };
    },

    // ── CANDIDATES ──
    saveCandidate: (payload: Partial<RecruitmentCandidate> & { fullName: string; email: string; phone: string }): ApiResponse<RecruitmentCandidate> => {
      if (!payload.fullName?.trim() || !payload.email?.trim()) return { error: true, statusCode: 400, message: 'Nama dan email wajib diisi.', data: null };
      const currentDb = get(store);
      const now = new Date().toISOString();
      if (payload.id) {
        let updated: RecruitmentCandidate | null = null;
        const list = currentDb.candidates.map((c) => { if (c.id === payload.id) { updated = { ...c, ...payload, updatedAt: now } as RecruitmentCandidate; return updated; } return c; });
        persistDatabase({ ...currentDb, candidates: list });
        apiPost('/api/candidates', payload);
        return { error: false, statusCode: 200, message: 'Kandidat diperbarui.', data: updated };
      } else {
        const newCand: RecruitmentCandidate = { id: generateEntityId('cand'), fullName: payload.fullName.trim(), email: payload.email.trim(), phone: payload.phone.trim(), education: payload.education || 'S1 Pendidikan', experienceYears: Number(payload.experienceYears) || 0, subjectIds: payload.subjectIds || [], levelIds: payload.levelIds || [], cvUrl: payload.cvUrl || '', status: payload.status || 'REGISTERED', notes: payload.notes || '', interviewDate: payload.interviewDate, createdAt: now, updatedAt: now, deletedAt: null };
        persistDatabase({ ...currentDb, candidates: [newCand, ...currentDb.candidates] });
        apiPost('/api/candidates', payload);
        return { error: false, statusCode: 201, message: 'Kandidat baru berhasil didaftarkan.', data: newCand };
      }
    },

    convertCandidateToTentorUser: (candidateId: string): ApiResponse<User> => {
      const currentDb = get(store);
      const cand = currentDb.candidates.find((c) => c.id === candidateId);
      if (!cand) return { error: true, statusCode: 404, message: 'Kandidat tidak ditemukan.', data: null };
      const now = new Date().toISOString();
      const newTentor: User = { id: generateEntityId('u-tentor'), email: cand.email, password: 'tentor123', fullName: cand.fullName, phone: cand.phone, role: 'TENTOR', education: cand.education, experienceYears: cand.experienceYears, subjectIds: cand.subjectIds, levelIds: cand.levelIds, createdAt: now, updatedAt: now, deletedAt: null };
      persistDatabase({ ...currentDb, users: [...currentDb.users, newTentor], candidates: currentDb.candidates.map((c) => c.id === candidateId ? { ...c, status: 'ACCEPTED' as const, updatedAt: now } : c) });
      apiPost('/api/users', { email: cand.email, password: 'tentor123', fullName: cand.fullName, phone: cand.phone, role: 'TENTOR', education: cand.education, experienceYears: cand.experienceYears, subjectIds: cand.subjectIds, levelIds: cand.levelIds });
      return { error: false, statusCode: 201, message: `Kandidat berhasil diterima sebagai tentor.`, data: newTentor };
    },

    // ── MAGIC LINKS ──
    createMagicLink: (payload: { title?: string; daysValid: number; targetRole?: 'STUDENT' | 'TENTOR'; classId?: string; packageId?: string; createdBy?: string }): ApiResponse<MagicLinkRegistration> => {
      const now = new Date();
      const expires = new Date(now.getTime() + payload.daysValid * 24 * 60 * 60 * 1000);
      const token = `ml-${Math.random().toString(36).substring(2, 8)}${Date.now().toString(36)}`;
      const newLink: MagicLinkRegistration = { id: generateEntityId('ml'), token, title: payload.title || (payload.targetRole === 'TENTOR' ? 'Pendaftaran Tentor' : 'Pendaftaran Siswa'), daysValid: payload.daysValid, expiresAt: expires.toISOString(), usedCount: 0, active: true, targetRole: payload.targetRole || 'STUDENT', classId: payload.classId, packageId: payload.packageId, createdBy: payload.createdBy, createdAt: now.toISOString(), updatedAt: now.toISOString(), deletedAt: null };
      const currentDb = get(store);
      persistDatabase({ ...currentDb, magicLinks: [newLink, ...(currentDb.magicLinks || [])] });
      apiPost('/api/magic-links', newLink);
      return { error: false, statusCode: 201, message: `Magic link berhasil dibuat (${payload.daysValid} hari).`, data: newLink };
    },

    toggleMagicLinkStatus: (id: string): ApiResponse<MagicLinkRegistration> => {
      const currentDb = get(store);
      const now = new Date().toISOString();
      const existing = (currentDb.magicLinks || []).find((l) => l.id === id);
      if (!existing) return { error: true, statusCode: 404, message: 'Magic link tidak ditemukan.', data: null };
      const updated: MagicLinkRegistration = { ...existing, active: !existing.active, updatedAt: now };
      const links = (currentDb.magicLinks || []).map((l) => l.id === id ? updated : l);
      persistDatabase({ ...currentDb, magicLinks: links });
      apiPost('/api/magic-links', { id, active: updated.active });
      return { error: false, statusCode: 200, message: updated.active ? 'Magic link diaktifkan.' : 'Magic link dinonaktifkan.', data: updated };
    },

    deleteMagicLink: (id: string): ApiResponse<null> => {
      const currentDb = get(store);
      const now = new Date().toISOString();
      persistDatabase({ ...currentDb, magicLinks: (currentDb.magicLinks || []).map((l) => l.id === id ? { ...l, deletedAt: now, updatedAt: now } : l) });
      apiDelete('/api/magic-links', id);
      return { error: false, statusCode: 200, message: 'Magic link berhasil dihapus.', data: null };
    },

    validateMagicToken: (token: string): { valid: boolean; message: string; magicLink: MagicLinkRegistration | null } => {
      const currentDb = get(store);
      const link = (currentDb.magicLinks || []).find((l) => l.token === token && l.deletedAt === null);
      if (!link) return { valid: false, message: 'Magic link tidak ditemukan.', magicLink: null };
      if (!link.active) return { valid: false, message: 'Magic link telah kadaluarsa.', magicLink: link };
      if (new Date() > new Date(link.expiresAt)) return { valid: false, message: `Magic link kadaluarsa.`, magicLink: link };
      return { valid: true, message: 'Magic link valid.', magicLink: link };
    },

    registerStudentViaMagicLink: (payload: { token: string; studentFullName: string; studentEmail: string; studentPassword?: string; studentPhone?: string; school?: string; address?: string; isExistingWali?: boolean; waliFullName?: string; waliEmail: string; waliPassword?: string; waliPhone?: string; waliOccupation?: string }): ApiResponse<{ student: User; wali: User }> => {
      const currentDb = get(store);
      const now = new Date().toISOString();
      const stuEmail = payload.studentEmail.trim().toLowerCase();
      const waliEmail = payload.waliEmail.trim().toLowerCase();
      if (stuEmail === waliEmail) return { error: true, statusCode: 400, message: 'Email siswa dan wali harus berbeda.', data: null };
      if (currentDb.users.some((u) => u.deletedAt === null && u.email.toLowerCase() === stuEmail))
        return { error: true, statusCode: 400, message: `Email siswa sudah terdaftar.`, data: null };
      let targetWali: User | null = null;
      let isNewWali = false;
      if (payload.isExistingWali) {
        targetWali = currentDb.users.find((u) => u.deletedAt === null && u.role === 'WALI_MURID' && u.email.toLowerCase() === waliEmail) || null;
        if (!targetWali) return { error: true, statusCode: 404, message: `Akun Wali Murid tidak ditemukan.`, data: null };
      } else {
        if (currentDb.users.some((u) => u.deletedAt === null && u.email.toLowerCase() === waliEmail))
          return { error: true, statusCode: 400, message: `Email wali sudah terdaftar.`, data: null };
        targetWali = { id: generateEntityId('u-wali'), fullName: (payload.waliFullName || 'Wali Murid').trim(), email: waliEmail, password: payload.waliPassword || 'password123', phone: payload.waliPhone || '', occupation: payload.waliOccupation || '', address: payload.address || '', role: 'WALI_MURID', isActive: false, createdAt: now, updatedAt: now, deletedAt: null };
        isNewWali = true;
      }
      const studentId = generateEntityId('u-student');
      const newStudent: User = { id: studentId, fullName: payload.studentFullName.trim(), email: stuEmail, password: payload.studentPassword || 'password123', phone: payload.studentPhone || '', role: 'STUDENT', school: payload.school || '', address: payload.address || '', waliUserId: targetWali.id, isActive: false, createdAt: now, updatedAt: now, deletedAt: null };
      const updatedUsers = [...currentDb.users, newStudent];
      if (isNewWali && targetWali) updatedUsers.push(targetWali);
      const updatedLinks = (currentDb.magicLinks || []).map((l) => l.token === payload.token ? { ...l, usedCount: l.usedCount + 1, updatedAt: now } : l);
      persistDatabase({ ...currentDb, users: updatedUsers, magicLinks: updatedLinks });
      apiPost('/api/users', { fullName: newStudent.fullName, email: newStudent.email, password: newStudent.password, phone: newStudent.phone, role: 'STUDENT', school: newStudent.school, address: newStudent.address, waliUserId: targetWali.id, isActive: false });
      if (isNewWali) apiPost('/api/users', { fullName: targetWali.fullName, email: targetWali.email, password: targetWali.password, phone: targetWali.phone, role: 'WALI_MURID', occupation: targetWali.occupation, address: targetWali.address, isActive: false });
      return { error: false, statusCode: 201, message: `Pendaftaran berhasil!`, data: { student: newStudent, wali: targetWali } };
    },

    saveStudentMaster: (data: { id?: string; fullName: string; email: string; phone: string; password?: string; school?: string; address?: string; waliUserId?: string }): ApiResponse<User> => {
      const currentDb = get(store);
      const now = new Date().toISOString();
      if (data.id) {
        let updated: User | null = null;
        const list = currentDb.users.map((u) => { if (u.id === data.id) { updated = { ...u, fullName: data.fullName, email: data.email, phone: data.phone, school: data.school, address: data.address, waliUserId: data.waliUserId, updatedAt: now } as User; return updated; } return u; });
        persistDatabase({ ...currentDb, users: list });
        apiPost('/api/users', data);
        return { error: false, statusCode: 200, message: 'Data siswa diperbarui.', data: updated };
      } else {
        const newUser: User = { id: generateEntityId('u-stu'), email: data.email, password: data.password || 'password123', fullName: data.fullName, phone: data.phone, role: 'STUDENT', school: data.school, address: data.address, waliUserId: data.waliUserId, isActive: true, createdAt: now, updatedAt: now, deletedAt: null };
        persistDatabase({ ...currentDb, users: [...currentDb.users, newUser] });
        apiPost('/api/users', data);
        return { error: false, statusCode: 201, message: 'Siswa baru ditambahkan.', data: newUser };
      }
    },

    saveTentorMaster: (data: { id?: string; fullName: string; email: string; phone: string; password?: string; education?: string; experienceYears?: number; subjectIds?: string[]; levelIds?: string[] }): ApiResponse<User> => {
      const currentDb = get(store);
      const now = new Date().toISOString();
      if (data.id) {
        let updated: User | null = null;
        const list = currentDb.users.map((u) => { if (u.id === data.id) { updated = { ...u, fullName: data.fullName, email: data.email, phone: data.phone, education: data.education, experienceYears: data.experienceYears, subjectIds: data.subjectIds, levelIds: data.levelIds, updatedAt: now } as User; return updated; } return u; });
        persistDatabase({ ...currentDb, users: list });
        apiPost('/api/users', data);
        return { error: false, statusCode: 200, message: 'Data tentor diperbarui.', data: updated };
      } else {
        const newUser: User = { id: generateEntityId('u-tnt'), email: data.email, password: data.password || 'tentor123', fullName: data.fullName, phone: data.phone, role: 'TENTOR', education: data.education, experienceYears: data.experienceYears, subjectIds: data.subjectIds || [], levelIds: data.levelIds || [], isActive: true, createdAt: now, updatedAt: now, deletedAt: null };
        persistDatabase({ ...currentDb, users: [...currentDb.users, newUser] });
        apiPost('/api/users', data);
        return { error: false, statusCode: 201, message: 'Tentor baru ditambahkan.', data: newUser };
      }
    },

    saveWaliMaster: (data: { id?: string; fullName: string; email: string; phone: string; password?: string; occupation?: string; address?: string }): ApiResponse<User> => {
      const currentDb = get(store);
      const now = new Date().toISOString();
      if (data.id) {
        let updated: User | null = null;
        const list = currentDb.users.map((u) => { if (u.id === data.id) { updated = { ...u, fullName: data.fullName, email: data.email, phone: data.phone, occupation: data.occupation, address: data.address, updatedAt: now } as User; return updated; } return u; });
        persistDatabase({ ...currentDb, users: list });
        apiPost('/api/users', data);
        return { error: false, statusCode: 200, message: 'Data wali diperbarui.', data: updated };
      } else {
        const newUser: User = { id: generateEntityId('u-wali'), email: data.email, password: data.password || 'password123', fullName: data.fullName, phone: data.phone, role: 'WALI_MURID', occupation: data.occupation, address: data.address, isActive: true, createdAt: now, updatedAt: now, deletedAt: null };
        persistDatabase({ ...currentDb, users: [...currentDb.users, newUser] });
        apiPost('/api/users', data);
        return { error: false, statusCode: 201, message: 'Wali murid baru ditambahkan.', data: newUser };
      }
    },

    // ── DELETE MASTER USERS ──
    deleteStudentMaster: (userId: string): ApiResponse<null> => {
      const currentDb = get(store);
      const now = new Date().toISOString();
      persistDatabase({ ...currentDb, users: currentDb.users.map((u) => u.id === userId ? { ...u, deletedAt: now, updatedAt: now } : u) });
      apiDelete('/api/users', userId);
      return { error: false, statusCode: 200, message: 'Data siswa berhasil dihapus.', data: null };
    },

    deleteTentorMaster: (userId: string): ApiResponse<null> => {
      const currentDb = get(store);
      const now = new Date().toISOString();
      persistDatabase({ ...currentDb, users: currentDb.users.map((u) => u.id === userId ? { ...u, deletedAt: now, updatedAt: now } : u) });
      apiDelete('/api/users', userId);
      return { error: false, statusCode: 200, message: 'Data tentor berhasil dihapus.', data: null };
    },

    deleteWaliMaster: (userId: string): ApiResponse<null> => {
      const currentDb = get(store);
      const now = new Date().toISOString();
      persistDatabase({ ...currentDb, users: currentDb.users.map((u) => u.id === userId ? { ...u, deletedAt: now, updatedAt: now } : u) });
      apiDelete('/api/users', userId);
      return { error: false, statusCode: 200, message: 'Data wali murid berhasil dihapus.', data: null };
    },

    registerTentorViaMagicLink: (payload: { token: string; fullName: string; email: string; password?: string; phone?: string; education?: string; experienceYears?: number; subjectIds?: string[]; levelIds?: string[]; address?: string }): ApiResponse<User> => {
      const currentDb = get(store);
      const now = new Date().toISOString();
      const email = payload.email.trim().toLowerCase();
      if (currentDb.users.some((u) => u.deletedAt === null && u.email.toLowerCase() === email))
        return { error: true, statusCode: 409, message: 'Email sudah terdaftar.', data: null };
      const newUser: User = { id: generateEntityId('u-tentor'), email, password: payload.password || 'tentor123', fullName: payload.fullName.trim(), phone: payload.phone || '', role: 'TENTOR', education: payload.education, experienceYears: payload.experienceYears, subjectIds: payload.subjectIds || [], levelIds: payload.levelIds || [], isActive: false, createdAt: now, updatedAt: now, deletedAt: null };
      persistDatabase({ ...currentDb, users: [...currentDb.users, newUser] });
      apiPost('/api/users', { ...newUser, password: payload.password || 'tentor123' });
      // Update magic link used count
      const updatedLinks = (currentDb.magicLinks || []).map((l) => l.token === payload.token ? { ...l, usedCount: l.usedCount + 1, updatedAt: now } : l);
      persistDatabase({ ...get(store), magicLinks: updatedLinks });
      return { error: false, statusCode: 201, message: 'Pendaftaran tentor berhasil! Akun menunggu verifikasi admin.', data: newUser };
    },

    convertCandidateToTentor: (candidateId: string): ApiResponse<User> => {
      const currentDb = get(store);
      const cand = currentDb.candidates.find((c) => c.id === candidateId);
      if (!cand) return { error: true, statusCode: 404, message: 'Kandidat tidak ditemukan.', data: null };
      const now = new Date().toISOString();
      const newTentor: User = { id: generateEntityId('u-tentor'), email: cand.email, password: 'tentor123', fullName: cand.fullName, phone: cand.phone, role: 'TENTOR', education: cand.education, experienceYears: cand.experienceYears, subjectIds: cand.subjectIds, levelIds: cand.levelIds, createdAt: now, updatedAt: now, deletedAt: null };
      persistDatabase({ ...currentDb, users: [...currentDb.users, newTentor], candidates: currentDb.candidates.map((c) => c.id === candidateId ? { ...c, status: 'ACCEPTED' as const, updatedAt: now } : c) });
      apiPost('/api/users', { email: cand.email, password: 'tentor123', fullName: cand.fullName, phone: cand.phone, role: 'TENTOR', education: cand.education, experienceYears: cand.experienceYears, subjectIds: cand.subjectIds, levelIds: cand.levelIds });
      return { error: false, statusCode: 201, message: `Kandidat berhasil diterima sebagai tentor.`, data: newTentor };
    }
  };
}

export const dbStore = createDatabaseStore();
