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
  const matchingJobs = database.jobs.filter((job) => {
    if (job.deletedAt !== null) return false;
    const matchesId = job.studentId === studentId || (Array.isArray(job.studentIds) && job.studentIds.includes(studentId));
    const matchesName = Boolean(
      studentNameLower &&
      ((job.studentName && job.studentName.toLowerCase() === studentNameLower) ||
        (Array.isArray(job.studentNames) && job.studentNames.some((name) => name.toLowerCase() === studentNameLower)))
    );
    return matchesId || matchesName;
  });

  for (const job of matchingJobs) {
    processedJobIds.add(job.id);
    if (job.enrollmentId) {
      processedEnrollmentIds.add(job.enrollmentId);
    }

    const pkg = database.packages.find((p) => p.id === job.packageId);
    const tentor = job.assignedTentorId ? database.users.find((u) => u.id === job.assignedTentorId) : null;

    // Resolve class names
    const classIds = Array.isArray(job.classIds) && job.classIds.length > 0 ? job.classIds : (job.classId ? [job.classId] : []);
    const classNames = classIds
      .map((id) => database.classes.find((c) => c.id === id)?.className)
      .filter((name): name is string => Boolean(name));
    if (classNames.length === 0) classNames.push('Semua Kelas');

    // Resolve subject names
    const subjectIds = Array.isArray(job.subjectIds) && job.subjectIds.length > 0 ? job.subjectIds : (job.subjectId ? [job.subjectId] : []);
    const subjectNames = subjectIds
      .map((id) => database.subjects.find((s) => s.id === id)?.name)
      .filter((name): name is string => Boolean(name));
    if (subjectNames.length === 0) subjectNames.push('Semua Mapel');

    // Resolve student names
    const studentIds = Array.isArray(job.studentIds) && job.studentIds.length > 0 ? job.studentIds : (job.studentId ? [job.studentId] : []);
    let studentNames = Array.isArray(job.studentNames) && job.studentNames.length > 0 ? job.studentNames : [];
    if (studentNames.length === 0) {
      studentNames = studentIds
        .map((id) => database.users.find((u) => u.id === id)?.fullName)
        .filter((name): name is string => Boolean(name));
    }
    if (studentNames.length === 0 && studentFullName) {
      studentNames = [studentFullName];
    }

    const rawMode = (pkg?.mode || job.mode || job.jobMode || 'PRIVATE').toUpperCase();
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
      packageName: pkg?.name || (isGroup ? 'Paket Kelompok' : 'Paket Privat'),
      packageMode: isGroup ? 'KELOMPOK' : 'PRIVAT',
      jobMode: (job.jobMode || job.mode || 'OFFLINE').toUpperCase() === 'ONLINE' ? 'ONLINE' : 'OFFLINE',
      tentorId: job.assignedTentorId,
      tentorName: tentor?.fullName || '',
      tentorPhone: tentor?.phone || '',
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
  const matchingEnrollments = database.enrollments.filter((enroll) => {
    if (enroll.deletedAt !== null) return false;
    if (processedEnrollmentIds.has(enroll.id)) return false;
    return enroll.studentId === studentId;
  });

  for (const enroll of matchingEnrollments) {
    const pkg = database.packages.find((p) => p.id === enroll.packageId);
    const cls = database.classes.find((c) => c.id === enroll.classId);
    const sub = database.subjects.find((s) => s.id === enroll.subjectId);
    const tentor = enroll.tentorId ? database.users.find((u) => u.id === enroll.tentorId) : null;
    const student = database.users.find((u) => u.id === enroll.studentId);

    const classNames = cls ? [cls.className] : ['Semua Kelas'];
    const subjectNames = sub ? [sub.name] : ['Semua Mapel'];
    const studentNames = student ? [student.fullName] : (studentFullName ? [studentFullName] : ['Siswa']);

    const rawMode = (pkg?.mode || 'PRIVATE').toUpperCase();
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
      packageName: pkg?.name || (isGroup ? 'Paket Kelompok' : 'Paket Privat'),
      packageMode: isGroup ? 'KELOMPOK' : 'PRIVAT',
      jobMode: 'OFFLINE',
      tentorId: enroll.tentorId,
      tentorName: tentor?.fullName || '',
      tentorPhone: tentor?.phone || '',
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
  const children = database.users.filter((u) => u.deletedAt === null && u.role === 'STUDENT' && u.waliUserId === parentId);
  const allPrograms: UnifiedProgram[] = [];
  const processedProgramIds = new Set<string>();

  for (const child of children) {
    const childPrograms = getStudentPrograms(database, child.id, child.fullName);
    for (const prog of childPrograms) {
      if (!processedProgramIds.has(prog.id)) {
        processedProgramIds.add(prog.id);
        allPrograms.push(prog);
      }
    }
  }

  // Also check enrollments directly tagged with waliUserId
  const directWaliEnrollments = database.enrollments.filter((e) => e.deletedAt === null && e.waliUserId === parentId);
  for (const enroll of directWaliEnrollments) {
    if (!processedProgramIds.has(enroll.id)) {
      const student = database.users.find((u) => u.id === enroll.studentId);
      const studentPrograms = getStudentPrograms(database, enroll.studentId, student?.fullName);
      for (const prog of studentPrograms) {
        if (!processedProgramIds.has(prog.id)) {
          processedProgramIds.add(prog.id);
          allPrograms.push(prog);
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
    (j) => j.deletedAt === null && j.assignedTentorId === tutorId && (j.status === 'ASSIGNED' || j.status === 'AVAILABLE' || j.status === 'NEGOTIATING')
  );

  for (const job of assignedJobs) {
    processedJobIds.add(job.id);
    if (job.enrollmentId) {
      processedEnrollmentIds.add(job.enrollmentId);
    }

    const pkg = database.packages.find((p) => p.id === job.packageId);
    const tentor = database.users.find((u) => u.id === tutorId);

    // Resolve class names
    const classIds = Array.isArray(job.classIds) && job.classIds.length > 0 ? job.classIds : (job.classId ? [job.classId] : []);
    const classNames = classIds
      .map((id) => database.classes.find((c) => c.id === id)?.className)
      .filter((name): name is string => Boolean(name));
    if (classNames.length === 0) classNames.push('Semua Kelas');

    // Resolve subject names
    const subjectIds = Array.isArray(job.subjectIds) && job.subjectIds.length > 0 ? job.subjectIds : (job.subjectId ? [job.subjectId] : []);
    const subjectNames = subjectIds
      .map((id) => database.subjects.find((s) => s.id === id)?.name)
      .filter((name): name is string => Boolean(name));
    if (subjectNames.length === 0) subjectNames.push('Semua Mapel');

    // Resolve student names
    const studentIds = Array.isArray(job.studentIds) && job.studentIds.length > 0 ? job.studentIds : (job.studentId ? [job.studentId] : []);
    let studentNames = Array.isArray(job.studentNames) && job.studentNames.length > 0 ? job.studentNames : [];
    if (studentNames.length === 0) {
      studentNames = studentIds
        .map((id) => database.users.find((u) => u.id === id)?.fullName)
        .filter((name): name is string => Boolean(name));
    }
    if (studentNames.length === 0 && job.studentName) {
      studentNames = [job.studentName];
    }
    if (studentNames.length === 0) {
      studentNames = ['Siswa SentraEdu'];
    }

    const rawMode = (pkg?.mode || job.mode || job.jobMode || 'PRIVATE').toUpperCase();
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
      packageName: pkg?.name || (isGroup ? 'Paket Kelompok' : 'Paket Privat'),
      packageMode: isGroup ? 'KELOMPOK' : 'PRIVAT',
      jobMode: (job.jobMode || job.mode || 'OFFLINE').toUpperCase() === 'ONLINE' ? 'ONLINE' : 'OFFLINE',
      tentorId: tutorId,
      tentorName: tentor?.fullName || '',
      tentorPhone: tentor?.phone || '',
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
    (e) => e.deletedAt === null && e.tentorId === tutorId && e.status === 'ACTIVE' && !processedEnrollmentIds.has(e.id)
  );

  for (const enroll of directEnrollments) {
    const pkg = database.packages.find((p) => p.id === enroll.packageId);
    const tentor = database.users.find((u) => u.id === tutorId);
    const student = database.users.find((u) => u.id === enroll.studentId);

    const classLevel = database.classes.find((c) => c.id === enroll.classId);
    const classNames = [classLevel?.className || 'Semua Kelas'];

    const subject = database.subjects.find((s) => s.id === enroll.subjectId);
    const subjectNames = [subject?.name || 'Semua Mapel'];

    const studentNames = [student?.fullName || 'Murid'];

    const rawMode = (pkg?.mode || 'PRIVATE').toUpperCase();
    const isGroup = rawMode.includes('GROUP') || rawMode.includes('KELOMPOK');

    programs.push({
      id: enroll.id,
      source: 'enrollment',
      title: `${classNames.join(', ')} · ${subjectNames.join(', ')}`,
      classNames,
      subjectNames,
      packageName: pkg?.name || (isGroup ? 'Paket Kelompok' : 'Paket Privat'),
      packageMode: isGroup ? 'KELOMPOK' : 'PRIVAT',
      jobMode: 'OFFLINE',
      tentorId: tutorId,
      tentorName: tentor?.fullName || '',
      tentorPhone: tentor?.phone || '',
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
