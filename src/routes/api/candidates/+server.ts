import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { sql } from '$lib/server/db';
import { getCached, setCache, invalidateCache } from '$lib/server/cache';
import { mapCandidateRow, generateEntityId } from '$lib/server/api-helpers';
import { requireAdmin, isValidId, isValidEmail, sanitizeInput } from '$lib/server/security';

export const GET: RequestHandler = async ({ cookies }) => {
  try {
    const auth = requireAdmin(cookies);
    if (!auth.allowed) {
      return auth.error || json({ error: true, statusCode: 401, message: 'Unauthorized', data: null }, { status: 401 });
    }

    const cached = getCached('candidates');
    if (cached) return json({ error: false, statusCode: 200, data: cached });
    const rows = await sql`SELECT * FROM candidates WHERE deleted_at IS NULL ORDER BY created_at DESC`;
    const list = rows.map(mapCandidateRow);
    setCache('candidates', list);
    return json({ error: false, statusCode: 200, data: list });
  } catch (err_raw) {
    const err = err_raw as Error;
    return json({ error: true, statusCode: 500, message: err.message, data: null }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request, cookies }) => {
  try {
    const body = (await request.json()) as Record<string, string | number | boolean | string[] | null | undefined>;
    const now = new Date().toISOString();

    if (body.id) {
      // Updating candidate requires admin privileges
      const auth = requireAdmin(cookies);
      if (!auth.allowed) {
        return auth.error || json({ error: true, statusCode: 401, message: 'Unauthorized', data: null }, { status: 401 });
      }

      const candId = String(body.id);
      if (!isValidId(candId)) return json({ error: true, statusCode: 400, message: 'ID tidak valid.', data: null }, { status: 400 });

      await sql`UPDATE candidates SET
        status=${body.status ?? 'REGISTERED'},
        notes=${sanitizeInput(String(body.notes ?? ''))},
        interview_date=${body.interviewDate},
        updated_at=${now}
      WHERE id=${candId}`;

      const rows = await sql`SELECT * FROM candidates WHERE id=${candId}`;
      invalidateCache();
      return json({ error: false, statusCode: 200, message: 'Kandidat diperbarui.', data: rows[0] ? mapCandidateRow(rows[0]) : null });
    } else {
      // Public registration
      const fullName = sanitizeInput(String(body.fullName ?? '').trim());
      const email = sanitizeInput(String(body.email ?? '').trim().toLowerCase());

      if (!fullName || !email) {
        return json({ error: true, statusCode: 400, message: 'Nama dan email wajib diisi.', data: null }, { status: 400 });
      }

      if (!isValidEmail(email)) {
        return json({ error: true, statusCode: 400, message: 'Format email tidak valid.', data: null }, { status: 400 });
      }

      const id = generateEntityId('cand');
      await sql`INSERT INTO candidates (id,full_name,email,phone,education,experience_years,subject_ids,level_ids,cv_url,status,notes,interview_date,created_at,updated_at)
        VALUES (${id},${fullName},${email},${sanitizeInput(String(body.phone ?? ''))},${sanitizeInput(String(body.education ?? ''))},${Number(body.experienceYears) || 0},${body.subjectIds ?? []},${body.levelIds ?? []},${body.cvUrl},${body.status ?? 'REGISTERED'},${sanitizeInput(String(body.notes ?? ''))},${body.interviewDate},${now},${now})`;

      const rows = await sql`SELECT * FROM candidates WHERE id=${id}`;
      invalidateCache();
      return json({ error: false, statusCode: 201, message: 'Kandidat dibuat.', data: rows[0] ? mapCandidateRow(rows[0]) : null });
    }
  } catch (err_raw) {
    const err = err_raw as Error;
    return json({ error: true, statusCode: 500, message: err.message, data: null }, { status: 500 });
  }
};

export const DELETE: RequestHandler = async ({ url, cookies }) => {
  try {
    const auth = requireAdmin(cookies);
    if (!auth.allowed) {
      return auth.error || json({ error: true, statusCode: 401, message: 'Unauthorized', data: null }, { status: 401 });
    }

    const id = url.searchParams.get('id');
    if (!id || !isValidId(id)) return json({ error: true, statusCode: 400, message: 'ID wajib dan harus valid.', data: null }, { status: 400 });
    const now = new Date().toISOString();
    await sql`UPDATE candidates SET deleted_at=${now},updated_at=${now} WHERE id=${id}`;
    invalidateCache();
    return json({ error: false, statusCode: 200, message: 'Kandidat dihapus.', data: null });
  } catch (err_raw) {
    const err = err_raw as Error;
    return json({ error: true, statusCode: 500, message: err.message, data: null }, { status: 500 });
  }
};
