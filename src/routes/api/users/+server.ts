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
  } catch (err_raw) { const err = err_raw as Error;
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

      // Sanitize string inputs
      const fullName = typeof body.fullName === 'string' ? sanitizeInput(body.fullName) : typeof body.full_name === 'string' ? sanitizeInput(body.full_name) : '';
      const email = typeof body.email === 'string' ? sanitizeInput(body.email.trim().toLowerCase()) : '';

      if (!fullName || !email) {
        return json({ error: true, statusCode: 400, message: 'Nama dan email wajib diisi.', data: null }, { status: 400 });
      }

      if (!isValidEmail(email)) {
        return json({ error: true, statusCode: 400, message: 'Format email tidak valid.', data: null }, { status: 400 });
      }

      await sql`UPDATE users SET
        full_name = ${fullName},
        email = ${email},
        phone = ${sanitizeInput(body.phone ?? '')},
        role = ${body.role ?? 'STUDENT'},
        position = ${sanitizeInput(body.position ?? '')},
        education = ${sanitizeInput(body.education ?? '')},
        experience_years = ${Number(body.experienceYears ?? body.experience_years) || 0},
        subject_ids = ${body.subjectIds ?? body.subject_ids ?? []},
        level_ids = ${body.levelIds ?? body.level_ids ?? []},
        school = ${sanitizeInput(body.school ?? '')},
        address = ${sanitizeInput(body.address ?? '')},
        occupation = ${sanitizeInput(body.occupation ?? '')},
        wali_user_id = ${body.waliUserId ?? body.wali_user_id},
        is_active = ${body.isActive ?? body.is_active ?? true},
        candidate_status = ${body.candidateStatus ?? body.candidate_status},
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
  } catch (err_raw) { const err = err_raw as Error;
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
  } catch (err_raw) { const err = err_raw as Error;
    return json({ error: true, statusCode: 500, message: err.message, data: null }, { status: 500 });
  }
};
