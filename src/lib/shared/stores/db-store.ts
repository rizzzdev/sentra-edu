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
  NotificationItem
} from '$lib/shared/types/common.types';
import { createInitialDatabaseSeed } from '$lib/shared/db/seed-data';
import { generateEntityId } from '$lib/shared/utils/id-generator';

const DATABASE_STORAGE_KEY = 'bms_db_v13';

function loadDatabaseFromStorage(): DatabaseSchema {
  if (typeof window === 'undefined') {
    return createInitialDatabaseSeed();
  }

  try {
    const rawData = localStorage.getItem(DATABASE_STORAGE_KEY);
    if (!rawData) {
      const initialSeed = createInitialDatabaseSeed();
      localStorage.setItem(DATABASE_STORAGE_KEY, JSON.stringify(initialSeed));
      return initialSeed;
    }
    const parsedData: DatabaseSchema = JSON.parse(rawData);
    // ensure version check or fallback
    if (!parsedData.users || !parsedData.jobs) {
      const initialSeed = createInitialDatabaseSeed();
      localStorage.setItem(DATABASE_STORAGE_KEY, JSON.stringify(initialSeed));
      return initialSeed;
    }
    return parsedData;
  } catch {
    const initialSeed = createInitialDatabaseSeed();
    localStorage.setItem(DATABASE_STORAGE_KEY, JSON.stringify(initialSeed));
    return initialSeed;
  }
}

function createDatabaseStore() {
  const store = writable<DatabaseSchema>(loadDatabaseFromStorage());

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
      return {
        error: false,
        statusCode: 200,
        message: 'Basis data berhasil direset ke pengaturan awal pabrik.',
        data: freshSeed
      };
    },

    importDatabaseJson: (jsonString: string): ApiResponse<DatabaseSchema> => {
      try {
        const parsedDatabase = JSON.parse(jsonString);
        if (!parsedDatabase.users || !parsedDatabase.jobs) {
          return {
            error: true,
            statusCode: 400,
            message: 'Format data cadangan JSON tidak valid.',
            data: null
          };
        }
        persistDatabase(parsedDatabase);
        return {
          error: false,
          statusCode: 200,
          message: 'Cadangan data berhasil dipulihkan.',
          data: parsedDatabase
        };
      } catch {
        return {
          error: true,
          statusCode: 400,
          message: 'Gagal mengurai file JSON cadangan.',
          data: null
        };
      }
    },

    // ----------------------------------------------------
    // NOTIFICATIONS
    // ----------------------------------------------------
    pushNotification: (
      targetUserId: string,
      notificationTitle: string,
      notificationMessage: string,
      notificationIcon: string = 'notifications'
    ): void => {
      const currentDb = get(store);
      const newNotification: NotificationItem = {
        id: generateEntityId('notif'),
        userId: targetUserId,
        title: notificationTitle,
        message: notificationMessage,
        icon: notificationIcon,
        read: false,
        createdAt: new Date().toISOString()
      };
      const updatedNotifications = [newNotification, ...(currentDb.notifications || [])];
      persistDatabase({ ...currentDb, notifications: updatedNotifications });
    },

    markNotificationAsRead: (notificationId: string): ApiResponse<null> => {
      const currentDb = get(store);
      const updatedNotifications = (currentDb.notifications || []).map((item) =>
        item.id === notificationId ? { ...item, read: true } : item
      );
      persistDatabase({ ...currentDb, notifications: updatedNotifications });
      return {
        error: false,
        statusCode: 200,
        message: 'Notifikasi ditandai sudah dibaca.',
        data: null
      };
    },

    markAllNotificationsAsRead: (targetUserId: string): ApiResponse<null> => {
      const currentDb = get(store);
      const updatedNotifications = (currentDb.notifications || []).map((item) =>
        item.userId === targetUserId ? { ...item, read: true } : item
      );
      persistDatabase({ ...currentDb, notifications: updatedNotifications });
      return {
        error: false,
        statusCode: 200,
        message: 'Semua notifikasi ditandai sudah dibaca.',
        data: null
      };
    },

    // ----------------------------------------------------
    // MASTER DATA: SUBJECTS
    // ----------------------------------------------------
    saveSubject: (subjectPayload: { id?: string; name: string; description: string }): ApiResponse<Subject> => {
      const currentDb = get(store);
      const nowTimestamp = new Date().toISOString();

      if (!subjectPayload.name.trim()) {
        return { error: true, statusCode: 400, message: 'Nama mata pelajaran wajib diisi.', data: null };
      }

      if (subjectPayload.id) {
        let updatedSubject: Subject | null = null;
        const updatedSubjects = currentDb.subjects.map((sub) => {
          if (sub.id === subjectPayload.id) {
            updatedSubject = {
              ...sub,
              name: subjectPayload.name.trim(),
              description: subjectPayload.description.trim(),
              updatedAt: nowTimestamp
            };
            return updatedSubject;
          }
          return sub;
        });
        persistDatabase({ ...currentDb, subjects: updatedSubjects });
        return { error: false, statusCode: 200, message: 'Mata pelajaran berhasil diperbarui.', data: updatedSubject };
      } else {
        const isDuplicate = currentDb.subjects.some(
          (sub) => sub.deletedAt === null && sub.name.toLowerCase() === subjectPayload.name.trim().toLowerCase()
        );
        if (isDuplicate) {
          return { error: true, statusCode: 409, message: 'Nama mata pelajaran sudah terdaftar.', data: null };
        }

        const newSubject: Subject = {
          id: generateEntityId('sj'),
          name: subjectPayload.name.trim(),
          description: subjectPayload.description.trim(),
          createdAt: nowTimestamp,
          updatedAt: nowTimestamp,
          deletedAt: null
        };
        persistDatabase({ ...currentDb, subjects: [...currentDb.subjects, newSubject] });
        return { error: false, statusCode: 201, message: 'Mata pelajaran baru berhasil ditambahkan.', data: newSubject };
      }
    },

    deleteSubject: (subjectId: string): ApiResponse<null> => {
      const currentDb = get(store);
      const isUsedInJobs = currentDb.jobs.some((job) => job.deletedAt === null && job.subjectId === subjectId);
      if (isUsedInJobs) {
        return { error: true, statusCode: 400, message: 'Mata pelajaran masih digunakan pada lowongan les aktif.', data: null };
      }
      const isUsedInEnrollments = currentDb.enrollments.some(
        (enr) => enr.deletedAt === null && enr.subjectId === subjectId
      );
      if (isUsedInEnrollments) {
        return { error: true, statusCode: 400, message: 'Mata pelajaran masih terdaftar pada data siswa aktif.', data: null };
      }

      const nowTimestamp = new Date().toISOString();
      const updatedSubjects = currentDb.subjects.map((sub) =>
        sub.id === subjectId ? { ...sub, deletedAt: nowTimestamp, updatedAt: nowTimestamp } : sub
      );
      persistDatabase({ ...currentDb, subjects: updatedSubjects });
      return { error: false, statusCode: 200, message: 'Mata pelajaran berhasil dihapus.', data: null };
    },

    // ----------------------------------------------------
    // MASTER DATA: EDUCATION LEVELS & CLASSES
    // ----------------------------------------------------
    saveEducationLevel: (payload: { id?: string; levelName: string; description: string }): ApiResponse<EducationLevel> => {
      const currentDb = get(store);
      const nowTimestamp = new Date().toISOString();

      if (!payload.levelName.trim()) {
        return { error: true, statusCode: 400, message: 'Nama jenjang wajib diisi.', data: null };
      }

      if (payload.id) {
        let updatedLevel: EducationLevel | null = null;
        const updatedList = currentDb.educationLevels.map((item) => {
          if (item.id === payload.id) {
            updatedLevel = {
              ...item,
              levelName: payload.levelName.trim(),
              description: payload.description.trim(),
              updatedAt: nowTimestamp
            };
            return updatedLevel;
          }
          return item;
        });
        persistDatabase({ ...currentDb, educationLevels: updatedList });
        return { error: false, statusCode: 200, message: 'Jenjang pendidikan berhasil diperbarui.', data: updatedLevel };
      } else {
        const newLevel: EducationLevel = {
          id: generateEntityId('lv'),
          levelName: payload.levelName.trim(),
          description: payload.description.trim(),
          createdAt: nowTimestamp,
          updatedAt: nowTimestamp,
          deletedAt: null
        };
        persistDatabase({ ...currentDb, educationLevels: [...currentDb.educationLevels, newLevel] });
        return { error: false, statusCode: 201, message: 'Jenjang pendidikan baru berhasil ditambahkan.', data: newLevel };
      }
    },

    saveClassLevel: (payload: {
      id?: string;
      className: string;
      educationLevelId: string;
      baseRatePer90Min: number;
      description: string;
    }): ApiResponse<ClassLevel> => {
      const currentDb = get(store);
      const nowTimestamp = new Date().toISOString();

      if (!payload.className.trim()) {
        return { error: true, statusCode: 400, message: 'Nama kelas wajib diisi.', data: null };
      }

      if (payload.id) {
        let updatedClass: ClassLevel | null = null;
        const updatedList = currentDb.classes.map((item) => {
          if (item.id === payload.id) {
            updatedClass = {
              ...item,
              className: payload.className.trim(),
              educationLevelId: payload.educationLevelId,
              baseRatePer90Min: Number(payload.baseRatePer90Min) || 0,
              description: payload.description.trim(),
              updatedAt: nowTimestamp
            };
            return updatedClass;
          }
          return item;
        });
        persistDatabase({ ...currentDb, classes: updatedList });
        return { error: false, statusCode: 200, message: 'Tingkat kelas berhasil diperbarui.', data: updatedClass };
      } else {
        const newClass: ClassLevel = {
          id: generateEntityId('cl'),
          className: payload.className.trim(),
          educationLevelId: payload.educationLevelId,
          baseRatePer90Min: Number(payload.baseRatePer90Min) || 0,
          description: payload.description.trim(),
          createdAt: nowTimestamp,
          updatedAt: nowTimestamp,
          deletedAt: null
        };
        persistDatabase({ ...currentDb, classes: [...currentDb.classes, newClass] });
        return { error: false, statusCode: 201, message: 'Tingkat kelas baru berhasil ditambahkan.', data: newClass };
      }
    },

    deleteClassLevel: (classId: string): ApiResponse<null> => {
      const currentDb = get(store);
      const isUsedInJobs = currentDb.jobs.some((job) => job.deletedAt === null && job.classId === classId);
      if (isUsedInJobs) {
        return { error: true, statusCode: 400, message: 'Kelas masih digunakan pada lowongan les aktif.', data: null };
      }

      const nowTimestamp = new Date().toISOString();
      const updatedList = currentDb.classes.map((cls) =>
        cls.id === classId ? { ...cls, deletedAt: nowTimestamp, updatedAt: nowTimestamp } : cls
      );
      persistDatabase({ ...currentDb, classes: updatedList });
      return { error: false, statusCode: 200, message: 'Tingkat kelas berhasil dihapus.', data: null };
    },

    // ----------------------------------------------------
    // MASTER DATA: PACKAGES
    // ----------------------------------------------------
    savePackagePlan: (payload: {
      id?: string;
      name: string;
      mode: 'PRIVATE' | 'KELOMPOK';
      period: 'BULANAN' | 'HARIAN';
      price: number;
      sessionsPerPeriod: number;
      maxStudents: number;
      tentorFee: number;
      description: string;
      active: boolean;
    }): ApiResponse<PackagePlan> => {
      const currentDb = get(store);
      const nowTimestamp = new Date().toISOString();

      if (!payload.name.trim()) {
        return { error: true, statusCode: 400, message: 'Nama paket wajib diisi.', data: null };
      }

      if (payload.id) {
        let updatedPackage: PackagePlan | null = null;
        const updatedList = currentDb.packages.map((pkg) => {
          if (pkg.id === payload.id) {
            updatedPackage = {
              ...pkg,
              ...payload,
              price: Number(payload.price) || 0,
              sessionsPerPeriod: Number(payload.sessionsPerPeriod) || 1,
              maxStudents: Number(payload.maxStudents) || 1,
              tentorFee: Number(payload.tentorFee) || 0,
              updatedAt: nowTimestamp
            };
            return updatedPackage;
          }
          return pkg;
        });
        persistDatabase({ ...currentDb, packages: updatedList });
        return { error: false, statusCode: 200, message: 'Paket les berhasil diperbarui.', data: updatedPackage };
      } else {
        const newPackage: PackagePlan = {
          id: generateEntityId('pkg'),
          ...payload,
          price: Number(payload.price) || 0,
          sessionsPerPeriod: Number(payload.sessionsPerPeriod) || 1,
          maxStudents: Number(payload.maxStudents) || 1,
          tentorFee: Number(payload.tentorFee) || 0,
          createdAt: nowTimestamp,
          updatedAt: nowTimestamp,
          deletedAt: null
        };
        persistDatabase({ ...currentDb, packages: [...currentDb.packages, newPackage] });
        return { error: false, statusCode: 201, message: 'Paket les baru berhasil ditambahkan.', data: newPackage };
      }
    },

    // ----------------------------------------------------
    // USERS MANAGEMENT
    // ----------------------------------------------------
    saveUser: (userPayload: Partial<User> & { fullName: string; email: string }): ApiResponse<User> => {
      const currentDb = get(store);
      const nowTimestamp = new Date().toISOString();

      if (!userPayload.email?.trim() || !userPayload.fullName?.trim()) {
        return { error: true, statusCode: 400, message: 'Nama lengkap dan email wajib diisi.', data: null };
      }

      if (userPayload.id) {
        let updatedUser: User | null = null;
        const updatedUsers = currentDb.users.map((usr) => {
          if (usr.id === userPayload.id) {
            updatedUser = {
              ...usr,
              ...userPayload,
              updatedAt: nowTimestamp
            } as User;
            return updatedUser;
          }
          return usr;
        });
        persistDatabase({ ...currentDb, users: updatedUsers });
        return { error: false, statusCode: 200, message: 'Data pengguna berhasil diperbarui.', data: updatedUser };
      } else {
        const emailExists = currentDb.users.some(
          (usr) => usr.deletedAt === null && usr.email.toLowerCase() === userPayload.email?.trim().toLowerCase()
        );
        if (emailExists) {
          return { error: true, statusCode: 409, message: 'Alamat email sudah digunakan oleh akun lain.', data: null };
        }

        const newUser: User = {
          id: generateEntityId('u'),
          email: userPayload.email.trim(),
          password: userPayload.password || 'password123',
          fullName: userPayload.fullName.trim(),
          phone: userPayload.phone || '',
          role: userPayload.role || 'STUDENT',
          position: userPayload.position,
          education: userPayload.education,
          experienceYears: userPayload.experienceYears,
          subjectIds: userPayload.subjectIds || [],
          levelIds: userPayload.levelIds || [],
          school: userPayload.school,
          address: userPayload.address,
          createdAt: nowTimestamp,
          updatedAt: nowTimestamp,
          deletedAt: null
        };
        persistDatabase({ ...currentDb, users: [...currentDb.users, newUser] });
        return { error: false, statusCode: 201, message: 'Pengguna baru berhasil ditambahkan.', data: newUser };
      }
    },

    deleteUser: (userId: string): ApiResponse<null> => {
      const currentDb = get(store);
      const nowTimestamp = new Date().toISOString();
      const updatedUsers = currentDb.users.map((usr) =>
        usr.id === userId ? { ...usr, deletedAt: nowTimestamp, updatedAt: nowTimestamp } : usr
      );
      persistDatabase({ ...currentDb, users: updatedUsers });
      return { error: false, statusCode: 200, message: 'Akun pengguna berhasil dinonaktifkan.', data: null };
    },

    // ----------------------------------------------------
    // JOB MANAGEMENT
    // ----------------------------------------------------
    saveJobPost: (jobPayload: Partial<JobPost> & { id?: string }): ApiResponse<JobPost> => {
      const currentDb = get(store);
      const nowTimestamp = new Date().toISOString();

      if (!jobPayload.id && !jobPayload.title?.trim()) {
        return { error: true, statusCode: 400, message: 'Judul lowongan wajib diisi.', data: null };
      }

      if (jobPayload.id) {
        let updatedJob: JobPost | null = null;
        const updatedJobs = currentDb.jobs.map((jb) => {
          if (jb.id === jobPayload.id) {
            updatedJob = {
              ...jb,
              ...jobPayload,
              tentorFee: Number(jobPayload.tentorFee) || jb.tentorFee,
              sessionDurationMinutes: Number(jobPayload.sessionDurationMinutes) || jb.sessionDurationMinutes,
              studentCount: Number(jobPayload.studentCount) || jb.studentCount,
              updatedAt: nowTimestamp
            } as JobPost;
            return updatedJob;
          }
          return jb;
        });
        persistDatabase({ ...currentDb, jobs: updatedJobs });
        return { error: false, statusCode: 200, message: 'Lowongan les berhasil diperbarui.', data: updatedJob };
      } else {
        const newJob: JobPost = {
          id: generateEntityId('job'),
          title: (jobPayload.title || 'Lowongan Les').trim(),
          classId: jobPayload.classId || '',
          subjectId: jobPayload.subjectId || '',
          jobType: jobPayload.jobType || 'REGULAR',
          jobMode: jobPayload.jobMode || 'OFFLINE',
          tentorFee: Number(jobPayload.tentorFee) || 120000,
          sessionDurationMinutes: Number(jobPayload.sessionDurationMinutes) || 90,
          scheduleDays: jobPayload.scheduleDays || ['Senin'],
          scheduleTime: jobPayload.scheduleTime || '16:00',
          studentCount: Number(jobPayload.studentCount) || 1,
          location: jobPayload.location || 'Lokasi Siswa',
          latitude: jobPayload.latitude || null,
          longitude: jobPayload.longitude || null,
          status: 'AVAILABLE',
          assignedTentorId: null,
          studentId: jobPayload.studentId || null,
          enrollmentId: jobPayload.enrollmentId || null,
          notes: jobPayload.notes || '',
          createdAt: nowTimestamp,
          updatedAt: nowTimestamp,
          deletedAt: null
        };
        persistDatabase({ ...currentDb, jobs: [newJob, ...currentDb.jobs] });
        return { error: false, statusCode: 201, message: 'Lowongan les baru berhasil dipublikasikan.', data: newJob };
      }
    },

    assignTentorToJob: (jobId: string, tentorId: string): ApiResponse<JobPost> => {
      const currentDb = get(store);
      const nowTimestamp = new Date().toISOString();

      let targetJob: JobPost | null = null;
      const updatedJobs = currentDb.jobs.map((jb) => {
        if (jb.id === jobId) {
          targetJob = { ...jb, assignedTentorId: tentorId, status: 'ASSIGNED', updatedAt: nowTimestamp };
          return targetJob;
        }
        return jb;
      });

      // Also update enrollment if linked
      let updatedEnrollments = currentDb.enrollments;
      if (targetJob && (targetJob as JobPost).enrollmentId) {
        updatedEnrollments = currentDb.enrollments.map((enr) =>
          enr.id === (targetJob as JobPost).enrollmentId
            ? { ...enr, tentorId: tentorId, status: 'ACTIVE', updatedAt: nowTimestamp }
            : enr
        );
      }

      persistDatabase({ ...currentDb, jobs: updatedJobs, enrollments: updatedEnrollments });
      return { error: false, statusCode: 200, message: 'Tentor berhasil ditugaskan ke lowongan ini.', data: targetJob };
    },

    applyToJob: (jobId: string, tentorId: string, applicationNotes?: string): ApiResponse<JobApplication> => {
      const currentDb = get(store);
      const nowTimestamp = new Date().toISOString();

      const existingApp = currentDb.applications.find(
        (app) => app.deletedAt === null && app.jobId === jobId && app.tentorId === tentorId
      );
      if (existingApp) {
        return { error: true, statusCode: 409, message: 'Anda sudah pernah melamar pada lowongan ini.', data: null };
      }

      const newApplication: JobApplication = {
        id: generateEntityId('app'),
        jobId,
        tentorId,
        status: 'PENDING',
        appliedAt: nowTimestamp,
        notes: applicationNotes || '',
        createdAt: nowTimestamp,
        updatedAt: nowTimestamp,
        deletedAt: null
      };

      persistDatabase({ ...currentDb, applications: [newApplication, ...currentDb.applications] });
      return { error: false, statusCode: 201, message: 'Lamaran lowongan les berhasil dikirim.', data: newApplication };
    },

    // ----------------------------------------------------
    // ENROLLMENTS & STUDENTS
    // ----------------------------------------------------
    saveEnrollment: (enrollmentPayload: Partial<Enrollment> & { studentId: string; subjectId: string; classId: string; packageId: string }): ApiResponse<Enrollment> => {
      const currentDb = get(store);
      const nowTimestamp = new Date().toISOString();

      if (enrollmentPayload.id) {
        let updatedEnrollment: Enrollment | null = null;
        const updatedList = currentDb.enrollments.map((enr) => {
          if (enr.id === enrollmentPayload.id) {
            updatedEnrollment = {
              ...enr,
              ...enrollmentPayload,
              updatedAt: nowTimestamp
            } as Enrollment;
            return updatedEnrollment;
          }
          return enr;
        });
        persistDatabase({ ...currentDb, enrollments: updatedList });
        return { error: false, statusCode: 200, message: 'Data pendaftaran siswa berhasil diperbarui.', data: updatedEnrollment };
      } else {
        const newEnrollment: Enrollment = {
          id: generateEntityId('enr'),
          studentId: enrollmentPayload.studentId,
          subjectId: enrollmentPayload.subjectId,
          classId: enrollmentPayload.classId,
          packageId: enrollmentPayload.packageId,
          tentorId: enrollmentPayload.tentorId || null,
          scheduleDay: enrollmentPayload.scheduleDay || 'Senin, Rabu',
          scheduleTime: enrollmentPayload.scheduleTime || '16:00 - 17:30',
          status: 'ACTIVE',
          address: enrollmentPayload.address || '',
          latitude: enrollmentPayload.latitude,
          longitude: enrollmentPayload.longitude,
          waliUserId: enrollmentPayload.waliUserId,
          createdAt: nowTimestamp,
          updatedAt: nowTimestamp,
          deletedAt: null
        };
        persistDatabase({ ...currentDb, enrollments: [newEnrollment, ...currentDb.enrollments] });
        return { error: false, statusCode: 201, message: 'Siswa baru berhasil didaftarkan.', data: newEnrollment };
      }
    },

    // ----------------------------------------------------
    // ATTENDANCE MANAGEMENT
    // ----------------------------------------------------
    submitAttendance: (payload: {
      enrollmentId: string;
      tentorId: string;
      sessionDate: string;
      startTime: string;
      endTime: string;
      topic: string;
      studentNotes: string;
      latitudeCheckIn: number | null;
      longitudeCheckIn: number | null;
      isRadiusValid: boolean;
      proofPhotoUrl?: string;
    }): ApiResponse<AttendanceRecord> => {
      const currentDb = get(store);
      const nowTimestamp = new Date().toISOString();

      if (!payload.topic.trim()) {
        return { error: true, statusCode: 400, message: 'Materi/topik yang dipelajari wajib diisi.', data: null };
      }

      const newRecord: AttendanceRecord = {
        id: generateEntityId('att'),
        enrollmentId: payload.enrollmentId,
        tentorId: payload.tentorId,
        sessionDate: payload.sessionDate,
        startTime: payload.startTime,
        endTime: payload.endTime,
        topic: payload.topic.trim(),
        studentNotes: payload.studentNotes.trim(),
        status: 'SUBMITTED',
        latitudeCheckIn: payload.latitudeCheckIn,
        longitudeCheckIn: payload.longitudeCheckIn,
        isRadiusValid: payload.isRadiusValid,
        proofPhotoUrl: payload.proofPhotoUrl || 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=500&q=80',
        studentConfirmed: false,
        createdAt: nowTimestamp,
        updatedAt: nowTimestamp,
        deletedAt: null
      };

      persistDatabase({ ...currentDb, attendances: [newRecord, ...currentDb.attendances] });
      return { error: false, statusCode: 201, message: 'Presensi les berhasil dikirim untuk verifikasi admin.', data: newRecord };
    },

    verifyAttendance: (attendanceId: string, newStatus: 'APPROVED' | 'REJECTED', reviewNotes?: string): ApiResponse<AttendanceRecord> => {
      const currentDb = get(store);
      const nowTimestamp = new Date().toISOString();

      let targetRecord: AttendanceRecord | null = null;
      const updatedList = currentDb.attendances.map((att) => {
        if (att.id === attendanceId) {
          targetRecord = {
            ...att,
            status: newStatus,
            reviewNotes: reviewNotes || '',
            updatedAt: nowTimestamp
          };
          return targetRecord;
        }
        return att;
      });

      persistDatabase({ ...currentDb, attendances: updatedList });
      return {
        error: false,
        statusCode: 200,
        message: newStatus === 'APPROVED' ? 'Presensi berhasil diverifikasi dan disetujui.' : 'Presensi ditolak.',
        data: targetRecord
      };
    },

    // ----------------------------------------------------
    // INVOICES & PAYMENTS
    // ----------------------------------------------------
    createInvoice: (payload: {
      enrollmentId: string;
      amount: number;
      dueDate: string;
      periodMonth: number;
      periodYear: number;
      notes?: string;
    }): ApiResponse<InvoiceRecord> => {
      const currentDb = get(store);
      const nowTimestamp = new Date().toISOString();

      const newInvoice: InvoiceRecord = {
        id: generateEntityId('inv'),
        enrollmentId: payload.enrollmentId,
        invoiceNumber: `INV/${payload.periodYear}/${String(payload.periodMonth).padStart(2, '0')}/${Math.floor(100 + Math.random() * 900)}`,
        amount: Number(payload.amount) || 0,
        dueDate: payload.dueDate,
        status: 'UNPAID',
        paidAt: null,
        paymentProofUrl: null,
        periodMonth: payload.periodMonth,
        periodYear: payload.periodYear,
        notes: payload.notes || '',
        createdAt: nowTimestamp,
        updatedAt: nowTimestamp,
        deletedAt: null
      };

      persistDatabase({ ...currentDb, invoices: [newInvoice, ...currentDb.invoices] });
      return { error: false, statusCode: 201, message: 'Tagihan SPP berhasil diterbitkan.', data: newInvoice };
    },

    confirmInvoicePayment: (invoiceId: string, proofUrl?: string): ApiResponse<InvoiceRecord> => {
      const currentDb = get(store);
      const nowTimestamp = new Date().toISOString();

      let targetInvoice: InvoiceRecord | null = null;
      const updatedList = currentDb.invoices.map((inv) => {
        if (inv.id === invoiceId) {
          targetInvoice = {
            ...inv,
            status: 'PAID',
            paidAt: nowTimestamp,
            paymentProofUrl: proofUrl || inv.paymentProofUrl || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&q=80',
            updatedAt: nowTimestamp
          };
          return targetInvoice;
        }
        return inv;
      });

      persistDatabase({ ...currentDb, invoices: updatedList });
      return { error: false, statusCode: 200, message: 'Pembayaran tagihan SPP berhasil dikonfirmasi lunas.', data: targetInvoice };
    },

    // ----------------------------------------------------
    // PAYROLL CLAIMS
    // ----------------------------------------------------
    submitPayrollClaim: (payload: {
      tentorId: string;
      periodStart: string;
      periodEnd: string;
      totalAmount: number;
      attendanceIds: string[];
    }): ApiResponse<PayrollClaim> => {
      const currentDb = get(store);
      const nowTimestamp = new Date().toISOString();

      const newClaim: PayrollClaim = {
        id: generateEntityId('pay'),
        tentorId: payload.tentorId,
        claimNumber: `PAY/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${Math.floor(100 + Math.random() * 900)}`,
        periodStart: payload.periodStart,
        periodEnd: payload.periodEnd,
        totalAmount: payload.totalAmount,
        attendanceIds: payload.attendanceIds,
        status: 'REQUESTED',
        paidAt: null,
        transferProofUrl: null,
        createdAt: nowTimestamp,
        updatedAt: nowTimestamp,
        deletedAt: null
      };

      persistDatabase({ ...currentDb, payrollClaims: [newClaim, ...currentDb.payrollClaims] });
      return { error: false, statusCode: 201, message: 'Klaim honor berhasil diajukan.', data: newClaim };
    },

    processPayrollPayment: (claimId: string, transferProofUrl?: string): ApiResponse<PayrollClaim> => {
      const currentDb = get(store);
      const nowTimestamp = new Date().toISOString();

      let targetClaim: PayrollClaim | null = null;
      const updatedList = currentDb.payrollClaims.map((claim) => {
        if (claim.id === claimId) {
          targetClaim = {
            ...claim,
            status: 'PAID',
            paidAt: nowTimestamp,
            transferProofUrl: transferProofUrl || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&q=80',
            updatedAt: nowTimestamp
          };
          return targetClaim;
        }
        return claim;
      });

      persistDatabase({ ...currentDb, payrollClaims: updatedList });
      return { error: false, statusCode: 200, message: 'Honor tentor telah berhasil ditransfer dan diselesaikan.', data: targetClaim };
    },

    // ----------------------------------------------------
    // RECRUITMENT CANDIDATES
    // ----------------------------------------------------
    saveCandidate: (payload: Partial<RecruitmentCandidate> & { fullName: string; email: string; phone: string }): ApiResponse<RecruitmentCandidate> => {
      const currentDb = get(store);
      const nowTimestamp = new Date().toISOString();

      if (!payload.fullName?.trim() || !payload.email?.trim()) {
        return { error: true, statusCode: 400, message: 'Nama kandidat dan email wajib diisi.', data: null };
      }

      if (payload.id) {
        let updatedCand: RecruitmentCandidate | null = null;
        const updatedList = currentDb.candidates.map((cand) => {
          if (cand.id === payload.id) {
            updatedCand = {
              ...cand,
              ...payload,
              updatedAt: nowTimestamp
            } as RecruitmentCandidate;
            return updatedCand;
          }
          return cand;
        });
        persistDatabase({ ...currentDb, candidates: updatedList });
        return { error: false, statusCode: 200, message: 'Status kandidat berhasil diperbarui.', data: updatedCand };
      } else {
        const newCand: RecruitmentCandidate = {
          id: generateEntityId('cand'),
          fullName: payload.fullName.trim(),
          email: payload.email.trim(),
          phone: payload.phone.trim(),
          education: payload.education || 'S1 Pendidikan',
          experienceYears: Number(payload.experienceYears) || 0,
          subjectIds: payload.subjectIds || [],
          levelIds: payload.levelIds || [],
          cvUrl: payload.cvUrl || '',
          status: payload.status || 'REGISTERED',
          notes: payload.notes || '',
          interviewDate: payload.interviewDate,
          createdAt: nowTimestamp,
          updatedAt: nowTimestamp,
          deletedAt: null
        };
        persistDatabase({ ...currentDb, candidates: [newCand, ...currentDb.candidates] });
        return { error: false, statusCode: 201, message: 'Kandidat tentor baru berhasil didaftarkan.', data: newCand };
      }
    },

    convertCandidateToTentorUser: (candidateId: string): ApiResponse<User> => {
      const currentDb = get(store);
      const targetCandidate = currentDb.candidates.find((cand) => cand.id === candidateId);
      if (!targetCandidate) {
        return { error: true, statusCode: 404, message: 'Kandidat tidak ditemukan.', data: null };
      }

      const nowTimestamp = new Date().toISOString();
      const newTentorUser: User = {
        id: generateEntityId('u-tentor'),
        email: targetCandidate.email,
        password: 'tentor123',
        fullName: targetCandidate.fullName,
        phone: targetCandidate.phone,
        role: 'TENTOR',
        education: targetCandidate.education,
        experienceYears: targetCandidate.experienceYears,
        subjectIds: targetCandidate.subjectIds,
        levelIds: targetCandidate.levelIds,
        createdAt: nowTimestamp,
        updatedAt: nowTimestamp,
        deletedAt: null
      };

      const updatedCandidates = currentDb.candidates.map((cand) =>
        cand.id === candidateId ? { ...cand, status: 'ACCEPTED' as const, updatedAt: nowTimestamp } : cand
      );

      persistDatabase({
        ...currentDb,
        users: [...currentDb.users, newTentorUser],
        candidates: updatedCandidates
      });

      return {
        error: false,
        statusCode: 201,
        message: `Kandidat berhasil diterima dan dibuatkan akun tentor (${newTentorUser.email}).`,
        data: newTentorUser
      };
    },

    deleteJob: (jobId: string): ApiResponse<null> => {
      const currentDb = get(store);
      const nowTimestamp = new Date().toISOString();
      const updatedJobs = currentDb.jobs.map((j) =>
        j.id === jobId ? { ...j, deletedAt: nowTimestamp, updatedAt: nowTimestamp } : j
      );
      persistDatabase({ ...currentDb, jobs: updatedJobs });
      return { error: false, statusCode: 200, message: 'Lowongan les berhasil dihapus.', data: null };
    },

    deleteEnrollment: (enrollmentId: string): ApiResponse<null> => {
      const currentDb = get(store);
      const nowTimestamp = new Date().toISOString();
      const updatedList = currentDb.enrollments.map((e) =>
        e.id === enrollmentId ? { ...e, deletedAt: nowTimestamp, updatedAt: nowTimestamp } : e
      );
      persistDatabase({ ...currentDb, enrollments: updatedList });
      return { error: false, statusCode: 200, message: 'Pendaftaran siswa berhasil dihapus.', data: null };
    },

    savePackage: (pkg: Partial<PackagePlan> & { id: string }): ApiResponse<PackagePlan> => {
      const currentDb = get(store);
      const nowTimestamp = new Date().toISOString();
      let updatedPkg: PackagePlan | null = null;
      const updatedPackages = currentDb.packages.map((p) => {
        if (p.id === pkg.id) {
          updatedPkg = { ...p, ...pkg, updatedAt: nowTimestamp } as PackagePlan;
          return updatedPkg;
        }
        return p;
      });
      persistDatabase({ ...currentDb, packages: updatedPackages });
      return { error: false, statusCode: 200, message: 'Paket les berhasil diperbarui.', data: updatedPkg };
    },

    deletePackage: (packageId: string): ApiResponse<null> => {
      const currentDb = get(store);
      const nowTimestamp = new Date().toISOString();
      const updatedPackages = currentDb.packages.map((p) =>
        p.id === packageId ? { ...p, deletedAt: nowTimestamp, updatedAt: nowTimestamp } : p
      );
      persistDatabase({ ...currentDb, packages: updatedPackages });
      return { error: false, statusCode: 200, message: 'Paket les berhasil dihapus.', data: null };
    },

    savePayrollClaim: (claim: Partial<PayrollClaim> & { id: string }): ApiResponse<PayrollClaim> => {
      const currentDb = get(store);
      const nowTimestamp = new Date().toISOString();
      let updatedClaim: PayrollClaim | null = null;
      const updatedList = currentDb.payrollClaims.map((c) => {
        if (c.id === claim.id) {
          updatedClaim = { ...c, ...claim, updatedAt: nowTimestamp } as PayrollClaim;
          return updatedClaim;
        }
        return c;
      });
      persistDatabase({ ...currentDb, payrollClaims: updatedList });
      return { error: false, statusCode: 200, message: 'Klaim honor berhasil diperbarui.', data: updatedClaim };
    },

    saveInvoice: (inv: Partial<InvoiceRecord> & { id: string }): ApiResponse<InvoiceRecord> => {
      const currentDb = get(store);
      const nowTimestamp = new Date().toISOString();
      let updatedInv: InvoiceRecord | null = null;
      const updatedList = currentDb.invoices.map((i) => {
        if (i.id === inv.id) {
          updatedInv = { ...i, ...inv, updatedAt: nowTimestamp } as InvoiceRecord;
          return updatedInv;
        }
        return i;
      });
      persistDatabase({ ...currentDb, invoices: updatedList });
      return { error: false, statusCode: 200, message: 'Tagihan SPP berhasil diperbarui.', data: updatedInv };
    },

    deleteInvoice: (invoiceId: string): ApiResponse<null> => {
      const currentDb = get(store);
      const nowTimestamp = new Date().toISOString();
      const updatedList = currentDb.invoices.map((i) =>
        i.id === invoiceId ? { ...i, deletedAt: nowTimestamp, updatedAt: nowTimestamp } : i
      );
      persistDatabase({ ...currentDb, invoices: updatedList });
      return { error: false, statusCode: 200, message: 'Tagihan SPP berhasil dihapus.', data: null };
    }
  };
}

export const dbStore = createDatabaseStore();
