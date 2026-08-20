import type { DatabaseSchema } from '$lib/shared/types/common.types';

export interface UnifiedProgram {
  id: string;
  source: 'job' | 'enrollment';
  title: string;
  classNames: string[];
  subjectNames: string[];
  packageName: string;
  packageMode: 'PRIVAT' | 'KELOMPOK';
  jobMode: 'OFFLINE' | 'ONLINE';
  tentorId: string | null;
  tentorName: string;
  tentorPhone: string;
  studentId: string | null;
  studentIds: string[];
  studentNames: string[];
  studentCount: number;
  scheduleDays: string[];
  scheduleTime: string;
  scheduleEndTime?: string;
  location: string;
  status: string;
  statusLabel: string;
  statusBadgeClass: string;
  notes?: string;
  latitude?: number | null;
  longitude?: number | null;
  enrollmentId?: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Returns all active tutoring programs for a student (from both Lowongan Jobs and Enrollments)
 */
export function getStudentPrograms(
  database: DatabaseSchema,
  studentId: string,
  studentFullName?: string
): UnifiedProgram[] {
  const programs: UnifiedProgram[] = [];
  const processedJobIds = new Set<string>();
  const processedEnrollmentIds = new Set<string>();

  const studentNameLower = (studentFullName || '').trim().toLowerCase();

  // 1. Check Jobs (Lowongan Les)
  const matchingJobs = database.jobs.filter((jobItem) => {
    if (jobItem.deletedAt !== null) return false;
    const matchesId = jobItem.studentId === studentId || (Array.isArray(jobItem.studentIds) && jobItem.studentIds.includes(studentId));
    const matchesName = Boolean(
      studentNameLower &&
      ((jobItem.studentName && jobItem.studentName.toLowerCase() === studentNameLower) ||
        (Array.isArray(jobItem.studentNames) && jobItem.studentNames.some((name) => name.toLowerCase() === studentNameLower)))
    );
    return matchesId || matchesName;
  });

  for (const job of matchingJobs) {
    processedJobIds.add(job.id);
    if (job.enrollmentId) {
      processedEnrollmentIds.add(job.enrollmentId);
    }

    const packagePlan = database.packages.find((packageItem) => packageItem.id === job.packageId);
    const assignedTentor = job.assignedTentorId ? database.users.find((userItem) => userItem.id === job.assignedTentorId) : null;

    // Resolve class names
    const classIds = Array.isArray(job.classIds) && job.classIds.length > 0 ? job.classIds : (job.classId ? [job.classId] : []);
    const classNames = classIds
      .map((classIdentifier) => database.classes.find((classItem) => classItem.id === classIdentifier)?.className)
      .filter((name): name is string => Boolean(name));
    if (classNames.length === 0) classNames.push('Semua Kelas');

    // Resolve subject names
    const subjectIds = Array.isArray(job.subjectIds) && job.subjectIds.length > 0 ? job.subjectIds : (job.subjectId ? [job.subjectId] : []);
    const subjectNames = subjectIds
      .map((subjectIdentifier) => database.subjects.find((subjectItem) => subjectItem.id === subjectIdentifier)?.name)
      .filter((name): name is string => Boolean(name));
    if (subjectNames.length === 0) subjectNames.push('Semua Mapel');

    // Resolve student names
    const studentIds = Array.isArray(job.studentIds) && job.studentIds.length > 0 ? job.studentIds : (job.studentId ? [job.studentId] : []);
    let studentNames = Array.isArray(job.studentNames) && job.studentNames.length > 0 ? job.studentNames : [];
    if (studentNames.length === 0) {
      studentNames = studentIds
        .map((studentIdentifier) => database.users.find((userItem) => userItem.id === studentIdentifier)?.fullName)
        .filter((name): name is string => Boolean(name));
    }
    if (studentNames.length === 0 && studentFullName) {
      studentNames = [studentFullName];
    }

    const rawMode = (packagePlan?.mode || job.mode || job.jobMode || 'PRIVATE').toUpperCase();
    const isGroup = rawMode.includes('GROUP') || rawMode.includes('KELOMPOK') || (job.studentCount && job.studentCount > 1) || studentIds.length > 1;

    let statusLabel = 'Tersedia';
    let statusBadgeClass = 'b-open';
    if (job.status === 'ASSIGNED') {
      statusLabel = 'Aktif Berjalan';
      statusBadgeClass = 'b-assigned';
    } else if (job.status === 'AVAILABLE') {
      statusLabel = 'Menunggu Penugasan Tentor';
      statusBadgeClass = 'b-open';
    } else if (job.status === 'NEGOTIATING') {
      statusLabel = 'Proses Penjadwalan';
      statusBadgeClass = 'b-warning';
    } else if (job.status === 'CANCELLED') {
      statusLabel = 'Dibatalkan';
      statusBadgeClass = 'b-danger';
    }

    programs.push({
      id: job.id,
      source: 'job',
      title: job.title || `${classNames.join(', ')} · ${subjectNames.join(', ')}`,
      classNames,
      subjectNames,
      packageName: packagePlan?.name || (isGroup ? 'Paket Kelompok' : 'Paket Privat'),
      packageMode: isGroup ? 'KELOMPOK' : 'PRIVAT',
      jobMode: (job.jobMode || job.mode || 'OFFLINE').toUpperCase() === 'ONLINE' ? 'ONLINE' : 'OFFLINE',
      tentorId: job.assignedTentorId,
      tentorName: assignedTentor?.fullName || '',
      tentorPhone: assignedTentor?.phone || '',
      studentId: job.studentId,
      studentIds,
      studentNames,
      studentCount: Math.max(job.studentCount || 1, studentIds.length, studentNames.length, 1),
      scheduleDays: Array.isArray(job.scheduleDays) && job.scheduleDays.length > 0 ? job.scheduleDays : ['MONDAY'],
      scheduleTime: job.scheduleTime || '16:00',
      scheduleEndTime: job.scheduleEndTime || '17:30',
      location: job.location || 'Lokasi Siswa',
      latitude: job.latitude ?? null,
      longitude: job.longitude ?? null,
      enrollmentId: job.enrollmentId ?? null,
      status: job.status,
      statusLabel,
      statusBadgeClass,
      notes: job.additionalNotes || job.notes || '',
      createdAt: job.createdAt,
      updatedAt: job.updatedAt
    });
  }

  // 2. Check Enrollments (Direct Enrollments)
  const matchingEnrollments = database.enrollments.filter((enrollItem) => {
    if (enrollItem.deletedAt !== null) return false;
    if (processedEnrollmentIds.has(enrollItem.id)) return false;
    return enrollItem.studentId === studentId;
  });

  for (const enroll of matchingEnrollments) {
    const packagePlan = database.packages.find((packageItem) => packageItem.id === enroll.packageId);
    const classLevel = database.classes.find((classItem) => classItem.id === enroll.classId);
    const subjectItem = database.subjects.find((subjectEntry) => subjectEntry.id === enroll.subjectId);
    const assignedTentor = enroll.tentorId ? database.users.find((userItem) => userItem.id === enroll.tentorId) : null;
    const studentUser = database.users.find((userItem) => userItem.id === enroll.studentId);

    const classNames = classLevel ? [classLevel.className] : ['Semua Kelas'];
    const subjectNames = subjectItem ? [subjectItem.name] : ['Semua Mapel'];
    const studentNames = studentUser ? [studentUser.fullName] : (studentFullName ? [studentFullName] : ['Siswa']);

    const rawMode = (packagePlan?.mode || 'PRIVATE').toUpperCase();
    const isGroup = rawMode.includes('GROUP') || rawMode.includes('KELOMPOK');

    let statusLabel = 'Aktif';
    let statusBadgeClass = 'b-assigned';
    if (enroll.status === 'PENDING') {
      statusLabel = 'Menunggu';
      statusBadgeClass = 'b-warning';
    } else if (enroll.status === 'COMPLETED') {
      statusLabel = 'Selesai';
      statusBadgeClass = 'b-neutral';
    } else if (enroll.status === 'CANCELLED') {
      statusLabel = 'Dibatalkan';
      statusBadgeClass = 'b-danger';
    }

    programs.push({
      id: enroll.id,
      source: 'enrollment',
      title: `${classNames.join(', ')} · ${subjectNames.join(', ')}`,
      classNames,
      subjectNames,
      packageName: packagePlan?.name || (isGroup ? 'Paket Kelompok' : 'Paket Privat'),
      packageMode: isGroup ? 'KELOMPOK' : 'PRIVAT',
      jobMode: 'OFFLINE',
      tentorId: enroll.tentorId,
      tentorName: assignedTentor?.fullName || '',
      tentorPhone: assignedTentor?.phone || '',
      studentId: enroll.studentId,
      studentIds: [enroll.studentId],
      studentNames,
      studentCount: 1,
      scheduleDays: enroll.scheduleDay ? [enroll.scheduleDay] : ['MONDAY'],
      scheduleTime: enroll.scheduleTime || '16:00',
      location: enroll.address || 'Lokasi Siswa',
      latitude: enroll.latitude ?? null,
      longitude: enroll.longitude ?? null,
      enrollmentId: enroll.id,
      status: enroll.status,
      statusLabel,
      statusBadgeClass,
      createdAt: enroll.createdAt,
      updatedAt: enroll.updatedAt
    });
  }

  return programs;
}

/**
 * Returns all active tutoring programs for a parent's children
 */
export function getParentPrograms(database: DatabaseSchema, parentId: string): UnifiedProgram[] {
  const children = database.users.filter((userItem) => userItem.deletedAt === null && userItem.role === 'STUDENT' && userItem.waliUserId === parentId);
  const allPrograms: UnifiedProgram[] = [];
  const processedProgramIds = new Set<string>();

  for (const child of children) {
    const childPrograms = getStudentPrograms(database, child.id, child.fullName);
    for (const programItem of childPrograms) {
      if (!processedProgramIds.has(programItem.id)) {
        processedProgramIds.add(programItem.id);
        allPrograms.push(programItem);
      }
    }
  }

  // Also check enrollments directly tagged with waliUserId
  const directWaliEnrollments = database.enrollments.filter((enrollmentItem) => enrollmentItem.deletedAt === null && enrollmentItem.waliUserId === parentId);
  for (const enroll of directWaliEnrollments) {
    if (!processedProgramIds.has(enroll.id)) {
      const studentUser = database.users.find((userItem) => userItem.id === enroll.studentId);
      const studentPrograms = getStudentPrograms(database, enroll.studentId, studentUser?.fullName);
      for (const programItem of studentPrograms) {
        if (!processedProgramIds.has(programItem.id)) {
          processedProgramIds.add(programItem.id);
          allPrograms.push(programItem);
        }
      }
    }
  }

  return allPrograms;
}

/**
 * Returns all active tutoring programs assigned to a tutor (from both Jobs and Enrollments)
 */
export function getTutorPrograms(database: DatabaseSchema, tutorId: string): UnifiedProgram[] {
  const programs: UnifiedProgram[] = [];
  const processedJobIds = new Set<string>();
  const processedEnrollmentIds = new Set<string>();

  // 1. Check Jobs assigned to this tutor
  const assignedJobs = database.jobs.filter(
    (jobItem) => jobItem.deletedAt === null && jobItem.assignedTentorId === tutorId && (jobItem.status === 'ASSIGNED' || jobItem.status === 'AVAILABLE' || jobItem.status === 'NEGOTIATING')
  );

  for (const job of assignedJobs) {
    processedJobIds.add(job.id);
    if (job.enrollmentId) {
      processedEnrollmentIds.add(job.enrollmentId);
    }

    const packagePlan = database.packages.find((packageItem) => packageItem.id === job.packageId);
    const assignedTentor = database.users.find((userItem) => userItem.id === tutorId);

    // Resolve class names
    const classIds = Array.isArray(job.classIds) && job.classIds.length > 0 ? job.classIds : (job.classId ? [job.classId] : []);
    const classNames = classIds
      .map((classIdentifier) => database.classes.find((classItem) => classItem.id === classIdentifier)?.className)
      .filter((name): name is string => Boolean(name));
    if (classNames.length === 0) classNames.push('Semua Kelas');

    // Resolve subject names
    const subjectIds = Array.isArray(job.subjectIds) && job.subjectIds.length > 0 ? job.subjectIds : (job.subjectId ? [job.subjectId] : []);
    const subjectNames = subjectIds
      .map((subjectIdentifier) => database.subjects.find((subjectItem) => subjectItem.id === subjectIdentifier)?.name)
      .filter((name): name is string => Boolean(name));
    if (subjectNames.length === 0) subjectNames.push('Semua Mapel');

    // Resolve student names
    const studentIds = Array.isArray(job.studentIds) && job.studentIds.length > 0 ? job.studentIds : (job.studentId ? [job.studentId] : []);
    let studentNames = Array.isArray(job.studentNames) && job.studentNames.length > 0 ? job.studentNames : [];
    if (studentNames.length === 0) {
      studentNames = studentIds
        .map((studentIdentifier) => database.users.find((userItem) => userItem.id === studentIdentifier)?.fullName)
        .filter((name): name is string => Boolean(name));
    }
    if (studentNames.length === 0 && job.studentName) {
      studentNames = [job.studentName];
    }
    if (studentNames.length === 0) {
      studentNames = ['Siswa SentraEdu'];
    }

    const rawMode = (packagePlan?.mode || job.mode || job.jobMode || 'PRIVATE').toUpperCase();
    const isGroup = rawMode.includes('GROUP') || rawMode.includes('KELOMPOK') || (job.studentCount && job.studentCount > 1) || studentIds.length > 1;

    let statusLabel = 'Aktif Berjalan';
    let statusBadgeClass = 'b-assigned';
    if (job.status === 'AVAILABLE') {
      statusLabel = 'Tersedia';
      statusBadgeClass = 'b-open';
    } else if (job.status === 'NEGOTIATING') {
      statusLabel = 'Proses Penjadwalan';
      statusBadgeClass = 'b-warning';
    }

    programs.push({
      id: job.id,
      source: 'job',
      title: job.title || `${classNames.join(', ')} · ${subjectNames.join(', ')}`,
      classNames,
      subjectNames,
      packageName: packagePlan?.name || (isGroup ? 'Paket Kelompok' : 'Paket Privat'),
      packageMode: isGroup ? 'KELOMPOK' : 'PRIVAT',
      jobMode: (job.jobMode || job.mode || 'OFFLINE').toUpperCase() === 'ONLINE' ? 'ONLINE' : 'OFFLINE',
      tentorId: tutorId,
      tentorName: assignedTentor?.fullName || '',
      tentorPhone: assignedTentor?.phone || '',
      studentId: job.studentId,
      studentIds,
      studentNames,
      studentCount: Math.max(job.studentCount || 1, studentIds.length, studentNames.length, 1),
      scheduleDays: Array.isArray(job.scheduleDays) && job.scheduleDays.length > 0 ? job.scheduleDays : ['MONDAY'],
      scheduleTime: job.scheduleTime || '16:00',
      scheduleEndTime: job.scheduleEndTime || '17:30',
      location: job.location || 'Lokasi Siswa',
      latitude: job.latitude ?? null,
      longitude: job.longitude ?? null,
      enrollmentId: job.enrollmentId ?? null,
      status: job.status,
      statusLabel,
      statusBadgeClass,
      notes: job.additionalNotes || job.notes || '',
      createdAt: job.createdAt,
      updatedAt: job.updatedAt
    });
  }

  // 2. Check Enrollments assigned to this tutor
  const directEnrollments = database.enrollments.filter(
    (enrollmentItem) => enrollmentItem.deletedAt === null && enrollmentItem.tentorId === tutorId && enrollmentItem.status === 'ACTIVE' && !processedEnrollmentIds.has(enrollmentItem.id)
  );

  for (const enroll of directEnrollments) {
    const packagePlan = database.packages.find((packageItem) => packageItem.id === enroll.packageId);
    const assignedTentor = database.users.find((userItem) => userItem.id === tutorId);
    const studentUser = database.users.find((userItem) => userItem.id === enroll.studentId);

    const classLevel = database.classes.find((classItem) => classItem.id === enroll.classId);
    const classNames = [classLevel?.className || 'Semua Kelas'];

    const subjectItem = database.subjects.find((subjectEntry) => subjectEntry.id === enroll.subjectId);
    const subjectNames = [subjectItem?.name || 'Semua Mapel'];

    const studentNames = [studentUser?.fullName || 'Murid'];

    const rawMode = (packagePlan?.mode || 'PRIVATE').toUpperCase();
    const isGroup = rawMode.includes('GROUP') || rawMode.includes('KELOMPOK');

    programs.push({
      id: enroll.id,
      source: 'enrollment',
      title: `${classNames.join(', ')} · ${subjectNames.join(', ')}`,
      classNames,
      subjectNames,
      packageName: packagePlan?.name || (isGroup ? 'Paket Kelompok' : 'Paket Privat'),
      packageMode: isGroup ? 'KELOMPOK' : 'PRIVAT',
      jobMode: 'OFFLINE',
      tentorId: tutorId,
      tentorName: assignedTentor?.fullName || '',
      tentorPhone: assignedTentor?.phone || '',
      studentId: enroll.studentId,
      studentIds: [enroll.studentId],
      studentNames,
      studentCount: 1,
      scheduleDays: enroll.scheduleDay ? [enroll.scheduleDay] : ['MONDAY'],
      scheduleTime: enroll.scheduleTime || '16:00',
      location: enroll.address || 'Lokasi Siswa',
      latitude: enroll.latitude ?? null,
      longitude: enroll.longitude ?? null,
      enrollmentId: enroll.id,
      status: enroll.status,
      statusLabel: 'Aktif Berjalan',
      statusBadgeClass: 'b-assigned',
      createdAt: enroll.createdAt,
      updatedAt: enroll.updatedAt
    });
  }

  return programs;
}
