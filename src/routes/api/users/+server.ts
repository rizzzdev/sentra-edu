import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { sql } from '$lib/server/db';
import { mapUserRow, generateEntityId } from '$lib/server/api-helpers';
import bcrypt from 'bcryptjs';

/** GET /api/users */
export const GET: RequestHandler = async ({ url }) => {
  try {
    const rows = await sql`SELECT * FROM users WHERE deleted_at IS NULL ORDER BY created_at DESC`;
    return json({ error: false, statusCode: 200, data: rows.map(mapUserRow) });
  } catch (err: any) {
    return json({ error: true, statusCode: 500, message: err.message, data: null }, { status: 500 });
  }
};

/** POST /api/users — create user */
/** PUT /api/users — update user (pass id in body) */
export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();
    const now = new Date().toISOString();

    if (body.id) {
      // Update
      await sql`UPDATE users SET
        full_name = ${body.fullName ?? body.full_name},
        email = ${body.email},
        phone = ${body.phone ?? ''},
        role = ${body.role ?? 'STUDENT'},
        position = ${body.position},
        education = ${body.education},
        experience_years = ${body.experienceYears ?? body.experience_years},
        subject_ids = ${body.subjectIds ?? body.subject_ids ?? []},
        level_ids = ${body.levelIds ?? body.level_ids ?? []},
        school = ${body.school},
        address = ${body.address},
        occupation = ${body.occupation},
        wali_user_id = ${body.waliUserId ?? body.wali_user_id},
        is_active = ${body.isActive ?? body.is_active ?? true},
        candidate_status = ${body.candidateStatus ?? body.candidate_status},
        updated_at = ${now}
      WHERE id = ${body.id} AND deleted_at IS NULL`;
      const rows = await sql`SELECT * FROM users WHERE id = ${body.id}`;
      return json({ error: false, statusCode: 200, message: 'User diperbarui.', data: rows[0] ? mapUserRow(rows[0]) : null });
    } else {
      // Create
      const id = generateEntityId('u');
      const hashedPassword = body.password ? await bcrypt.hash(body.password, 10) : await bcrypt.hash('password123', 10);
      await sql`INSERT INTO users (id, email, password, full_name, phone, role, position, education, experience_years, subject_ids, level_ids, school, address, occupation, wali_user_id, is_active, candidate_status, created_at, updated_at)
        VALUES (${id}, ${body.email}, ${hashedPassword}, ${body.fullName}, ${body.phone ?? ''}, ${body.role ?? 'STUDENT'}, ${body.position}, ${body.education}, ${body.experienceYears ?? 0}, ${body.subjectIds ?? []}, ${body.levelIds ?? []}, ${body.school}, ${body.address}, ${body.occupation}, ${body.waliUserId}, ${body.isActive ?? false}, ${body.candidateStatus}, ${now}, ${now})`;
      const rows = await sql`SELECT * FROM users WHERE id = ${id}`;
      return json({ error: false, statusCode: 201, message: 'User dibuat.', data: rows[0] ? mapUserRow(rows[0]) : null });
    }
  } catch (err: any) {
    return json({ error: true, statusCode: 500, message: err.message, data: null }, { status: 500 });
  }
};

/** DELETE /api/users?id=xxx */
export const DELETE: RequestHandler = async ({ url }) => {
  try {
    const id = url.searchParams.get('id');
    if (!id) return json({ error: true, statusCode: 400, message: 'ID wajib.', data: null }, { status: 400 });
    const now = new Date().toISOString();
    await sql`UPDATE users SET deleted_at = ${now}, updated_at = ${now} WHERE id = ${id}`;
    return json({ error: false, statusCode: 200, message: 'User dihapus.', data: null });
  } catch (err: any) {
    return json({ error: true, statusCode: 500, message: err.message, data: null }, { status: 500 });
  }
};
