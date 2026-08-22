import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { magicLinkRepository } from '$lib/server/modules/magic-link/repository';
import { userRepository } from '$lib/server/modules/user/repository';
import { userService } from '$lib/server/modules/user/service';
import { candidateRepository } from '$lib/server/modules/candidate/repository';
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

    if (link.targetRole && link.targetRole !== 'TENTOR') {
      return json({ error: true, statusCode: 400, message: 'Token ini bukan untuk pendaftaran tentor.', data: null }, { status: 400 });
    }

    const expiresAtTime = new Date(link.expiresAt).getTime();
    if (isNaN(expiresAtTime) || expiresAtTime < Date.now()) {
      return json({ error: true, statusCode: 400, message: 'Token pendaftaran telah kadaluarsa.', data: null }, { status: 400 });
    }

    // 2. Validate fields
    const fullName = sanitizeInput(String(body.fullName ?? '').trim());
    const email = String(body.email ?? '').trim().toLowerCase();
    const password = String(body.password ?? '');
    const phone = sanitizeInput(String(body.phone ?? '').trim());
    const education = sanitizeInput(String(body.education ?? '').trim());
    const address = sanitizeInput(String(body.address ?? '').trim());
    const subjectIds = Array.isArray(body.subjectIds) ? body.subjectIds.map((id: any) => String(id)) : [];

    if (!fullName || !email || !password) {
      return json({ error: true, statusCode: 400, message: 'Nama lengkap, email, dan password wajib diisi.', data: null }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return json({ error: true, statusCode: 400, message: 'Format email tidak valid.', data: null }, { status: 400 });
    }

    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      return json({ error: true, statusCode: 400, message: 'Email sudah terdaftar di sistem.', data: null }, { status: 400 });
    }

    // 3. Create tentor user (Prisma generates cuid ID)
    const createTentorRes = await userService.create({
      fullName,
      email,
      password,
      phone,
      education,
      address,
      subjectIds,
      role: 'TENTOR',
      isActive: true,
      candidateStatus: 'REGISTERED'
    });

    if (createTentorRes.error || !createTentorRes.data) {
      return json({ error: true, statusCode: 500, message: createTentorRes.message || 'Gagal membuat akun tentor.', data: null }, { status: 500 });
    }

    const tentorUser = createTentorRes.data;

    // 4. Create candidate entry for admin tracking (Prisma generates cuid ID)
    try {
      await candidateRepository.create({
        fullName,
        email,
        phone,
        education,
        subjectIds,
        status: 'REGISTERED',
        notes: `Mendaftar melalui magic link: ${link.title || link.token}`
      });
    } catch (candErr) {
      console.warn('Candidate tracking note:', candErr);
    }

    // 5. Increment magic link used count
    await magicLinkRepository.update(link.id, {
      usedCount: (link.usedCount || 0) + 1
    });

    // 6. Push notification
    await notificationService.create({
      userId: tentorUser.id,
      title: 'Pendaftaran Tentor Berhasil',
      message: `Selamat datang di SentraEdu, Kak ${tentorUser.fullName}! Akun pengajar Anda telah siap.`,
      icon: 'badge'
    });

    return json({
      error: false,
      statusCode: 201,
      message: 'Pendaftaran tentor berhasil!',
      data: tentorUser
    }, { status: 201 });
  } catch (err: any) {
    console.error('Registration tutor error:', err);
    return json({ error: true, statusCode: 500, message: 'Terjadi kesalahan saat memproses pendaftaran.', data: null }, { status: 500 });
  }
};
