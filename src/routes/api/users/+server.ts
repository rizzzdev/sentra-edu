import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { sql } from '$lib/server/db';
import { getCached, setCache, invalidateCache } from '$lib/server/cache';
import { mapUserRow, generateEntityId } from '$lib/server/api-helpers';
import bcrypt from 'bcryptjs';
import { isValidEmail, isValidId, sanitizeInput, requireAdmin } from '$lib/server/security';

/** GET /api/users */
export const GET: RequestHandler = async ({ cookies }) => {
  try {
    const auth = requireAdmin(cookies);
    if (!auth.allowed) return auth.error;
    const cached = getCached('users');
    if (cached) return json({ error: false, statusCode: 200, data: cached });

    const rows = await sql`SELECT * FROM users WHERE deleted_at IS NULL ORDER BY created_at DESC`;
    // Strip passwords from response
    const users = rows.map(mapUserRow).map((u: any) => ({ ...u, password: undefined }));
    setCache('users', users);
    return json({ error: false, statusCode: 200, data: users });
  } catch (err_raw) {
    const err = err_raw as Error;
    return json({ error: true, statusCode: 500, message: err.message, data: null }, { status: 500 });
  }
};

/** POST /api/users — create or update user */
export const POST: RequestHandler = async ({ request, cookies }) => {
  try {
    const auth = requireAdmin(cookies);
    if (!auth.allowed) return auth.error;

    let body: any;
    try {
      body = await request.json();
    } catch {
      return json({ error: true, statusCode: 400, message: 'Request body harus JSON.', data: null }, { status: 400 });
    }

    const now = new Date().toISOString();

    if (body.id) {
      // Update — validate ID
      if (!isValidId(body.id)) {
        return json({ error: true, statusCode: 400, message: 'ID tidak valid.', data: null }, { status: 400 });
      }

      // Check existing user in database
      const existingRows = await sql`SELECT * FROM users WHERE id = ${body.id} AND deleted_at IS NULL LIMIT 1`;
      if (existingRows.length === 0) {
        return json({ error: true, statusCode: 404, message: 'Pengguna tidak ditemukan.', data: null }, { status: 404 });
      }
      const existingUser = existingRows[0];

      // Sanitize string inputs or preserve existing
      const rawFullName = body.fullName ?? body.full_name;
      const fullName = rawFullName !== undefined
        ? sanitizeInput(String(rawFullName).trim())
        : existingUser.full_name;

      if (!fullName) {
        return json({ error: true, statusCode: 400, message: 'Nama lengkap tidak boleh kosong.', data: null }, { status: 400 });
      }

      const rawEmail = body.email;
      const email = rawEmail !== undefined
        ? sanitizeInput(String(rawEmail).trim().toLowerCase())
        : existingUser.email;

      if (!email) {
        return json({ error: true, statusCode: 400, message: 'Email tidak boleh kosong.', data: null }, { status: 400 });
      }

      if (!isValidEmail(email)) {
        return json({ error: true, statusCode: 400, message: 'Format email tidak valid.', data: null }, { status: 400 });
      }

      // Check email uniqueness if email is changed
      if (email !== existingUser.email) {
        const emailConflict = await sql`SELECT id FROM users WHERE email = ${email} AND id != ${body.id} AND deleted_at IS NULL LIMIT 1`;
        if (emailConflict.length > 0) {
          return json({ error: true, statusCode: 409, message: 'Email sudah digunakan oleh akun lain.', data: null }, { status: 409 });
        }
      }

      const phone = body.phone !== undefined ? sanitizeInput(String(body.phone)) : existingUser.phone;
      const role = body.role !== undefined ? body.role : existingUser.role;
      const position = body.position !== undefined ? sanitizeInput(String(body.position)) : existingUser.position;
      const education = body.education !== undefined ? sanitizeInput(String(body.education)) : existingUser.education;
      const experienceYears = (body.experienceYears !== undefined || body.experience_years !== undefined)
        ? (Number(body.experienceYears ?? body.experience_years) || 0)
        : existingUser.experience_years;
      const subjectIds = (body.subjectIds !== undefined || body.subject_ids !== undefined)
        ? (body.subjectIds ?? body.subject_ids ?? [])
        : (existingUser.subject_ids ?? []);
      const levelIds = (body.levelIds !== undefined || body.level_ids !== undefined)
        ? (body.levelIds ?? body.level_ids ?? [])
        : (existingUser.level_ids ?? []);
      const school = body.school !== undefined ? sanitizeInput(String(body.school)) : existingUser.school;
      const address = body.address !== undefined ? sanitizeInput(String(body.address)) : existingUser.address;
      const occupation = body.occupation !== undefined ? sanitizeInput(String(body.occupation)) : existingUser.occupation;
      const waliUserId = (body.waliUserId !== undefined || body.wali_user_id !== undefined)
        ? (body.waliUserId ?? body.wali_user_id)
        : existingUser.wali_user_id;
      const isActive = (body.isActive !== undefined || body.is_active !== undefined)
        ? Boolean(body.isActive ?? body.is_active)
        : existingUser.is_active;
      const candidateStatus = (body.candidateStatus !== undefined || body.candidate_status !== undefined)
        ? (body.candidateStatus ?? body.candidate_status)
        : existingUser.candidate_status;

      let password = existingUser.password;
      if (typeof body.password === 'string' && body.password.trim().length > 0) {
        password = await bcrypt.hash(body.password.trim(), 10);
      }

      await sql`UPDATE users SET
        full_name = ${fullName},
        email = ${email},
        password = ${password},
        phone = ${phone},
        role = ${role},
        position = ${position},
        education = ${education},
        experience_years = ${experienceYears},
        subject_ids = ${subjectIds},
        level_ids = ${levelIds},
        school = ${school},
        address = ${address},
        occupation = ${occupation},
        wali_user_id = ${waliUserId},
        is_active = ${isActive},
        candidate_status = ${candidateStatus},
        updated_at = ${now}
      WHERE id = ${body.id} AND deleted_at IS NULL`;

      const rows = await sql`SELECT * FROM users WHERE id = ${body.id}`;
      const user = rows[0] ? mapUserRow(rows[0]) : null;
      if (user) (user as any).password = undefined;
      invalidateCache();
      return json({ error: false, statusCode: 200, message: 'User diperbarui.', data: user });
    } else {
      // Create
      const fullName = typeof body.fullName === 'string' ? sanitizeInput(body.fullName.trim()) : '';
      const email = typeof body.email === 'string' ? sanitizeInput(body.email.trim().toLowerCase()) : '';

      if (!fullName || !email) {
        return json({ error: true, statusCode: 400, message: 'Nama dan email wajib diisi.', data: null }, { status: 400 });
      }

      if (!isValidEmail(email)) {
        return json({ error: true, statusCode: 400, message: 'Format email tidak valid.', data: null }, { status: 400 });
      }

      // Check duplicate email
      const existing = await sql`SELECT id FROM users WHERE email = ${email} AND deleted_at IS NULL LIMIT 1`;
      if (existing.length > 0) {
        return json({ error: true, statusCode: 409, message: 'Email sudah digunakan.', data: null }, { status: 409 });
      }

      const id = generateEntityId('u');
      const password = typeof body.password === 'string' && body.password.length > 0
        ? await bcrypt.hash(body.password, 10)
        : await bcrypt.hash('password123', 10);

      await sql`INSERT INTO users (id, email, password, full_name, phone, role, position, education, experience_years, subject_ids, level_ids, school, address, occupation, wali_user_id, is_active, candidate_status, created_at, updated_at)
        VALUES (${id}, ${email}, ${password}, ${fullName}, ${sanitizeInput(body.phone ?? '')}, ${body.role ?? 'STUDENT'}, ${sanitizeInput(body.position ?? '')}, ${sanitizeInput(body.education ?? '')}, ${Number(body.experienceYears ?? 0)}, ${body.subjectIds ?? []}, ${body.levelIds ?? []}, ${sanitizeInput(body.school ?? '')}, ${sanitizeInput(body.address ?? '')}, ${sanitizeInput(body.occupation ?? '')}, ${body.waliUserId}, ${body.isActive ?? false}, ${body.candidateStatus}, ${now}, ${now})`;

      const rows = await sql`SELECT * FROM users WHERE id = ${id}`;
      const user = rows[0] ? mapUserRow(rows[0]) : null;
      if (user) (user as any).password = undefined;
      invalidateCache();
      return json({ error: false, statusCode: 201, message: 'User dibuat.', data: user });
    }
  } catch (err_raw) {
    const err = err_raw as Error;
    return json({ error: true, statusCode: 500, message: err.message, data: null }, { status: 500 });
  }
};

/** DELETE /api/users?id=xxx */
export const DELETE: RequestHandler = async ({ url, cookies }) => {
  try {
    const auth = requireAdmin(cookies);
    if (!auth.allowed) return auth.error;

    const id = url.searchParams.get('id');
    if (!id || !isValidId(id)) {
      return json({ error: true, statusCode: 400, message: 'ID tidak valid.', data: null }, { status: 400 });
    }

    const now = new Date().toISOString();
    await sql`UPDATE users SET deleted_at = ${now}, updated_at = ${now} WHERE id = ${id}`;
    invalidateCache();
    return json({ error: false, statusCode: 200, message: 'User dihapus.', data: null });
  } catch (err_raw) {
    const err = err_raw as Error;
    return json({ error: true, statusCode: 500, message: err.message, data: null }, { status: 500 });
  }
};
