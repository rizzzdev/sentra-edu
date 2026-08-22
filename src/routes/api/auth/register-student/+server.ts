import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { magicLinkRepository } from '$lib/server/modules/magic-link/repository';
import { userRepository } from '$lib/server/modules/user/repository';
import { userService } from '$lib/server/modules/user/service';
import { enrollmentRepository } from '$lib/server/modules/enrollment/repository';
import { notificationService, sanitizeInput, isValidEmail } from '$lib/server';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = (await request.json()) as Record<string, any>;
    const token = String(body.token ?? '').trim();

    if (!token) {
      return json({ error: true, statusCode: 400, message: 'Token pendaftaran wajib diisi.', data: null }, { status: 400 });
    }

    // 1. Validate magic link
    const link = await magicLinkRepository.findByToken(token);
    if (!link) {
      return json({ error: true, statusCode: 404, message: 'Token pendaftaran tidak ditemukan.', data: null }, { status: 404 });
    }

    if (!link.active) {
      return json({ error: true, statusCode: 400, message: 'Token pendaftaran sudah tidak aktif.', data: null }, { status: 400 });
    }

    if (link.targetRole && link.targetRole !== 'STUDENT') {
      return json({ error: true, statusCode: 400, message: 'Token ini bukan untuk pendaftaran murid.', data: null }, { status: 400 });
    }

    const expiresAtTime = new Date(link.expiresAt).getTime();
    if (isNaN(expiresAtTime) || expiresAtTime < Date.now()) {
      return json({ error: true, statusCode: 400, message: 'Token pendaftaran telah kadaluarsa.', data: null }, { status: 400 });
    }

    // 2. Validate student fields
    const studentFullName = sanitizeInput(String(body.studentFullName ?? '').trim());
    const studentEmail = String(body.studentEmail ?? '').trim().toLowerCase();
    const studentPassword = String(body.studentPassword ?? '');
    const studentPhone = sanitizeInput(String(body.studentPhone ?? '').trim());
    const school = sanitizeInput(String(body.school ?? '').trim());
    const address = sanitizeInput(String(body.address ?? '').trim());

    if (!studentFullName || !studentEmail || !studentPassword) {
      return json({ error: true, statusCode: 400, message: 'Nama lengkap, email, dan password siswa wajib diisi.', data: null }, { status: 400 });
    }

    if (!isValidEmail(studentEmail)) {
      return json({ error: true, statusCode: 400, message: 'Format email siswa tidak valid.', data: null }, { status: 400 });
    }

    const existingStudent = await userRepository.findByEmail(studentEmail);
    if (existingStudent) {
      return json({ error: true, statusCode: 400, message: 'Email siswa sudah terdaftar di sistem.', data: null }, { status: 400 });
    }

    // 3. Handle Parent
    const isExistingParent = Boolean(body.isExistingParent);
    const parentEmail = String(body.parentEmail ?? '').trim().toLowerCase();

    if (!parentEmail || !isValidEmail(parentEmail)) {
      return json({ error: true, statusCode: 400, message: 'Format email orang tua tidak valid.', data: null }, { status: 400 });
    }

    if (studentEmail === parentEmail) {
      return json({ error: true, statusCode: 400, message: 'Email siswa dan email orang tua harus berbeda.', data: null }, { status: 400 });
    }

    let parentUser: any = null;

    if (isExistingParent) {
      parentUser = await userRepository.findByEmail(parentEmail);
      if (!parentUser) {
        return json({ error: true, statusCode: 404, message: 'Akun orang tua dengan email tersebut tidak ditemukan.', data: null }, { status: 404 });
      }
    } else {
      const parentFullName = sanitizeInput(String(body.parentFullName ?? '').trim());
      const parentPassword = String(body.parentPassword ?? '');
      const parentPhone = sanitizeInput(String(body.parentPhone ?? '').trim());
      const parentOccupation = sanitizeInput(String(body.parentOccupation ?? '').trim());

      if (!parentFullName || !parentPassword) {
        return json({ error: true, statusCode: 400, message: 'Nama lengkap dan password orang tua wajib diisi.', data: null }, { status: 400 });
      }

      const existingParent = await userRepository.findByEmail(parentEmail);
      if (existingParent) {
        return json({ error: true, statusCode: 400, message: 'Email orang tua sudah terdaftar. Silakan pilih opsi akun orang tua yang sudah ada.', data: null }, { status: 400 });
      }

      const createParentRes = await userService.create({
        fullName: parentFullName,
        email: parentEmail,
        password: parentPassword,
        phone: parentPhone,
        occupation: parentOccupation,
        address,
        role: 'PARENT',
        isActive: true
      });

      if (createParentRes.error || !createParentRes.data) {
        return json({ error: true, statusCode: 500, message: createParentRes.message || 'Gagal membuat akun orang tua.', data: null }, { status: 500 });
      }

      parentUser = createParentRes.data;
    }

    // 4. Create student (Prisma generates cuid ID)
    const createStudentRes = await userService.create({
      fullName: studentFullName,
      email: studentEmail,
      password: studentPassword,
      phone: studentPhone,
      school,
      address,
      parentId: parentUser.id,
      role: 'STUDENT',
      isActive: true
    });

    if (createStudentRes.error || !createStudentRes.data) {
      return json({ error: true, statusCode: 500, message: createStudentRes.message || 'Gagal membuat akun siswa.', data: null }, { status: 500 });
    }

    const studentUser = createStudentRes.data;

    // 5. If magic link has classId or packageId, create initial enrollment
    if (link.classId && link.packageId) {
      try {
        await enrollmentRepository.create({
          studentId: studentUser.id,
          classId: link.classId,
          packageId: link.packageId,
          subjectId: link.classId, // default or fallback
          parentId: parentUser.id,
          status: 'PENDING',
          address,
          scheduleDay: '',
          scheduleTime: ''
        });
      } catch (enrErr) {
        console.warn('Initial enrollment creation note:', enrErr);
      }
    }

    // 6. Increment used count on magic link
    await magicLinkRepository.update(link.id, {
      usedCount: (link.usedCount || 0) + 1
    });

    // 7. Push welcome notification
    await notificationService.create({
      userId: studentUser.id,
      title: 'Pendaftaran Berhasil',
      message: `Selamat datang di SentraEdu, ${studentUser.fullName}! Akun Anda telah berhasil dibuat.`,
      icon: 'school'
    });

    return json({
      error: false,
      statusCode: 201,
      message: 'Pendaftaran murid dan orang tua berhasil!',
      data: {
        student: studentUser,
        parent: parentUser
      }
    }, { status: 201 });
  } catch (err: any) {
    console.error('Registration student error:', err);
    return json({ error: true, statusCode: 500, message: 'Terjadi kesalahan saat memproses pendaftaran.', data: null }, { status: 500 });
  }
};
