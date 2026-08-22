/**
 * SentraEdu — Database Seed Script
 * Seeds admin, education levels, classes, subjects, packages, parents, students, and tentors.
 *
 * Usage: npx prisma db seed
 */

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';
import { hash } from 'bcryptjs';

const connectionString = process.env.DATABASE_URL || '';
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...\n');

  // ── 1. Admin ──────────────────────────────────────────────
  const adminPassword = await hash('superadmin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'super@admin.com' },
    update: {},
    create: {
      email: 'super@admin.com',
      password: adminPassword,
      fullName: 'Super Admin',
      phone: '081234567890',
      role: 'SUPER_ADMIN',
      isActive: true,
    },
  });
  console.log('✅ Admin:', admin.fullName, `(${admin.email})`);

  // ── 2. Education Levels ───────────────────────────────────
  const levelsData = [
    { levelName: 'SD', description: 'Sekolah Dasar (Kelas 1-6)' },
    { levelName: 'SMP', description: 'Sekolah Menengah Pertama (Kelas 7-9)' },
    { levelName: 'SMA', description: 'Sekolah Menengah Atas (Kelas 10-12)' },
  ];

  const levels: Record<string, any> = {};
  for (const lv of levelsData) {
    const existing = await prisma.educationLevel.findFirst({ where: { levelName: lv.levelName } });
    levels[lv.levelName] = existing || await prisma.educationLevel.create({ data: lv });
  }
  console.log('✅ Education Levels:', Object.keys(levels).join(', '));

  // ── 3. Classes ────────────────────────────────────────────
  const classesData = [
    { className: 'Kelas 1 SD', level: 'SD' },
    { className: 'Kelas 2 SD', level: 'SD' },
    { className: 'Kelas 3 SD', level: 'SD' },
    { className: 'Kelas 4 SD', level: 'SD' },
    { className: 'Kelas 5 SD', level: 'SD' },
    { className: 'Kelas 6 SD', level: 'SD' },
    { className: 'Kelas 7 SMP', level: 'SMP' },
    { className: 'Kelas 8 SMP', level: 'SMP' },
    { className: 'Kelas 9 SMP', level: 'SMP' },
    { className: 'Kelas 10 SMA', level: 'SMA' },
    { className: 'Kelas 11 SMA', level: 'SMA' },
    { className: 'Kelas 12 SMA', level: 'SMA' },
  ];

  const classMap: Record<string, any> = {};
  for (const cl of classesData) {
    const existing = await prisma.classLevel.findFirst({ where: { className: cl.className } });
    classMap[cl.className] = existing || await prisma.classLevel.create({
      data: {
        className: cl.className,
        educationLevelId: levels[cl.level].id,
        description: cl.className,
      },
    });
  }
  console.log('✅ Classes:', Object.keys(classMap).length, 'entries');

  // ── 4. Subjects ───────────────────────────────────────────
  const subjectsData = [
    { name: 'Matematika', description: 'Matematika dasar hingga lanjut' },
    { name: 'Bahasa Indonesia', description: 'Bahasa Indonesia' },
    { name: 'Bahasa Inggris', description: 'Bahasa Inggris' },
    { name: 'IPA', description: 'Ilmu Pengetahuan Alam' },
    { name: 'IPS', description: 'Ilmu Pengetahuan Sosial' },
    { name: 'Fisika', description: 'Fisika SMA' },
    { name: 'Kimia', description: 'Kimia SMA' },
    { name: 'Biologi', description: 'Biologi SMA' },
    { name: 'Ekonomi', description: 'Ekonomi SMA' },
  ];

  const subjectMap: Record<string, any> = {};
  for (const sub of subjectsData) {
    const existing = await prisma.subject.findFirst({ where: { name: sub.name } });
    subjectMap[sub.name] = existing || await prisma.subject.create({ data: sub });
  }
  console.log('✅ Subjects:', Object.keys(subjectMap).length, 'entries');

  // ── 5. Packages ───────────────────────────────────────────
  const packagesData = [
    { name: 'Privat SD', mode: 'PRIVATE', period: 'BULANAN', price: 400000, sessionsPerPeriod: 8, maxStudents: 1, tentorFee: 75000, description: 'Les privat untuk siswa SD' },
    { name: 'Privat SMP', mode: 'PRIVATE', period: 'BULANAN', price: 500000, sessionsPerPeriod: 8, maxStudents: 1, tentorFee: 85000, description: 'Les privat untuk siswa SMP' },
    { name: 'Privat SMA', mode: 'PRIVATE', period: 'BULANAN', price: 600000, sessionsPerPeriod: 8, maxStudents: 1, tentorFee: 100000, description: 'Les privat untuk siswa SMA' },
    { name: 'Kelompok SMP', mode: 'KELOMPOK', period: 'BULANAN', price: 350000, sessionsPerPeriod: 8, maxStudents: 5, tentorFee: 120000, description: 'Les kelompok untuk siswa SMP' },
    { name: 'Kelompok SMA', mode: 'KELOMPOK', period: 'BULANAN', price: 450000, sessionsPerPeriod: 8, maxStudents: 5, tentorFee: 150000, description: 'Les kelompok untuk siswa SMA' },
  ];

  const packageMap: Record<string, any> = {};
  for (const pkg of packagesData) {
    const existing = await prisma.package.findFirst({ where: { name: pkg.name } });
    packageMap[pkg.name] = existing || await prisma.package.create({ data: pkg });
  }
  console.log('✅ Packages:', Object.keys(packageMap).length, 'entries');

  // ── 6. Parents ────────────────────────────────────────────
  const parentPassword = await hash('password123', 10);
  const parentsData = [
    { fullName: 'Budi Santoso', email: 'budi.santoso@gmail.com', phone: '081234567001', occupation: 'Wiraswasta', address: 'Jl. Sudirman No. 10, Jakarta Selatan' },
    { fullName: 'Siti Rahayu', email: 'siti.rahayu@gmail.com', phone: '081234567002', occupation: 'Guru', address: 'Jl. Thamrin No. 25, Jakarta Pusat' },
    { fullName: 'Andi Wijaya', email: 'andi.wijaya@gmail.com', phone: '081234567003', occupation: 'PNS', address: 'Jl. Gatot Subroto No. 15, Jakarta Timur' },
  ];

  const parentMap: Record<string, any> = {};
  for (const p of parentsData) {
    let existing = await prisma.user.findUnique({ where: { email: p.email } });
    if (!existing) {
      existing = await prisma.user.create({
        data: {
          email: p.email,
          password: parentPassword,
          fullName: p.fullName,
          phone: p.phone,
          occupation: p.occupation,
          address: p.address,
          role: 'PARENT',
          isActive: true,
        },
      });
    }
    parentMap[p.email] = existing;
  }
  console.log('✅ Parents:', Object.keys(parentMap).length, 'entries');

  // ── 7. Students ───────────────────────────────────────────
  const studentsData = [
    { fullName: 'Rina Santoso', email: 'rina.santoso@gmail.com', phone: '081234567101', school: 'SMPN 1 Jakarta', parentEmail: 'budi.santoso@gmail.com', class: 'Kelas 8 SMP', subject: 'Matematika', scheduleDay: 'MONDAY', scheduleTime: '16:00' },
    { fullName: 'Dedi Rahayu', email: 'dedi.rahayu@gmail.com', phone: '081234567102', school: 'SMA Negeri 3 Jakarta', parentEmail: 'siti.rahayu@gmail.com', class: 'Kelas 10 SMA', subject: 'Fisika', scheduleDay: 'TUESDAY', scheduleTime: '16:30' },
    { fullName: 'Maya Wijaya', email: 'maya.wijaya@gmail.com', phone: '081234567103', school: 'SDN Menteng 01', parentEmail: 'andi.wijaya@gmail.com', class: 'Kelas 4 SD', subject: 'Matematika', scheduleDay: 'WEDNESDAY', scheduleTime: '15:00' },
    { fullName: 'Fajar Wijaya', email: 'fajar.wijaya@gmail.com', phone: '081234567104', school: 'SMPN 5 Jakarta', parentEmail: 'andi.wijaya@gmail.com', class: 'Kelas 9 SMP', subject: 'Bahasa Inggris', scheduleDay: 'THURSDAY', scheduleTime: '16:00' },
  ];

  const studentMap: Record<string, any> = {};
  const enrollments: any[] = [];
  for (const s of studentsData) {
    let student = await prisma.user.findUnique({ where: { email: s.email } });
    if (!student) {
      student = await prisma.user.create({
        data: {
          email: s.email,
          password: parentPassword,
          fullName: s.fullName,
          phone: s.phone,
          school: s.school,
          role: 'STUDENT',
          parentId: parentMap[s.parentEmail]?.id,
          isActive: true,
        },
      });
    }
    studentMap[s.email] = student;

    // Create enrollment for each student
    const existingEnrollment = await prisma.enrollment.findFirst({ where: { studentId: student.id } });
    if (!existingEnrollment) {
      enrollments.push(
        await prisma.enrollment.create({
          data: {
            studentId: student.id,
            classId: classMap[s.class].id,
            packageId: packageMap[s.class.includes('SD') ? 'Privat SD' : s.class.includes('SMP') ? 'Privat SMP' : 'Privat SMA'].id,
            subjectId: subjectMap[s.subject].id,
            parentId: parentMap[s.parentEmail]?.id,
            scheduleDay: s.scheduleDay,
            scheduleTime: s.scheduleTime,
            status: 'ACTIVE',
            address: parentMap[s.parentEmail]?.address || '',
          },
        })
      );
    }
  }
  console.log('✅ Students:', Object.keys(studentMap).length, 'entries');
  console.log('✅ Enrollments:', enrollments.length, 'created');

  // ── 8. Tentors ────────────────────────────────────────────
  const tentorsData = [
    { fullName: 'Ahmad Fauzi', email: 'ahmad.fauzi@gmail.com', phone: '081234567201', education: 'S1 Teknik Informatika - UI', address: 'Jl. Kuningan No. 5, Jakarta Selatan', experienceYears: 3, subjects: ['Matematika', 'Fisika'] },
    { fullName: 'Dewi Lestari', email: 'dewi.lestari@gmail.com', phone: '081234567202', education: 'S1 Pendidikan Bahasa Inggris - UNJ', address: 'Jl. Matraman No. 20, Jakarta Timur', experienceYears: 5, subjects: ['Bahasa Inggris'] },
    { fullName: 'Rizky Pratama', email: 'rizky.pratama@gmail.com', phone: '081234567203', education: 'S1 Biologi - UI', address: 'Jl. Depok No. 8, Jakarta Selatan', experienceYears: 2, subjects: ['Biologi', 'Kimia', 'IPA'] },
    { fullName: 'Putri Amelia', email: 'putri.amelia@gmail.com', phone: '081234567204', education: 'S1 Matematika - ITB', address: 'Jl. Asia Afrika No. 12, Bandung', experienceYears: 4, subjects: ['Matematika'] },
  ];

  const tentorPassword = await hash('password123', 10);
  for (const t of tentorsData) {
    let tentor = await prisma.user.findUnique({ where: { email: t.email } });
    if (!tentor) {
      tentor = await prisma.user.create({
        data: {
          email: t.email,
          password: tentorPassword,
          fullName: t.fullName,
          phone: t.phone,
          education: t.education,
          address: t.address,
          experienceYears: t.experienceYears,
          subjectIds: t.subjects.map((s) => subjectMap[s]?.id).filter(Boolean),
          role: 'TENTOR',
          isActive: true,
          candidateStatus: 'ACCEPTED',
        },
      });
    }
    console.log('✅ Tentor:', tentor.fullName, `(${t.email})`);
  }

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n── Login Credentials ──');
  console.log('Admin:     super@admin.com / superadmin123');
  console.log('Parents:   budi.santoso@gmail.com / password123');
  console.log('           siti.rahayu@gmail.com / password123');
  console.log('           andi.wijaya@gmail.com / password123');
  console.log('Students:  rina.santoso@gmail.com / password123');
  console.log('           dedi.rahayu@gmail.com / password123');
  console.log('           maya.wijaya@gmail.com / password123');
  console.log('           fajar.wijaya@gmail.com / password123');
  console.log('Tentors:   ahmad.fauzi@gmail.com / password123');
  console.log('           dewi.lestari@gmail.com / password123');
  console.log('           rizky.pratama@gmail.com / password123');
  console.log('           putri.amelia@gmail.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
