import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { sql } from '$lib/server/db';
import { getCached, setCache, invalidateCache } from '$lib/server/cache';
import { mapSubjectRow, generateEntityId } from '$lib/server/api-helpers';
import { requireAdmin, isValidId, sanitizeInput } from '$lib/server/security';

export const GET: RequestHandler = async () => {
  try {
    const cached = getCached('subjects');
    if (cached) return json({ error: false, statusCode: 200, data: cached });
    const rows = await sql`SELECT * FROM subjects WHERE deleted_at IS NULL ORDER BY created_at DESC`;
    const list = rows.map(mapSubjectRow);
    setCache('subjects', list);
    return json({ error: false, statusCode: 200, data: list });
  } catch (err_raw) {
    const err = err_raw as Error;
    return json({ error: true, statusCode: 500, message: err.message, data: null }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request, cookies }) => {
  try {
    const auth = requireAdmin(cookies);
    if (!auth.allowed) {
      return auth.error || json({ error: true, statusCode: 401, message: 'Unauthorized', data: null }, { status: 401 });
    }

    const body = (await request.json()) as Record<string, string | number | boolean | null | undefined>;
    const now = new Date().toISOString();

    if (body.id) {
      const subjectId = String(body.id);
      if (!isValidId(subjectId)) return json({ error: true, statusCode: 400, message: 'ID tidak valid.', data: null }, { status: 400 });

      await sql`UPDATE subjects SET
        name = ${sanitizeInput(String(body.name ?? ''))},
        description = ${sanitizeInput(String(body.description ?? ''))},
        updated_at = ${now}
      WHERE id = ${subjectId} AND deleted_at IS NULL`;

      const rows = await sql`SELECT * FROM subjects WHERE id = ${subjectId}`;
      invalidateCache();
      return json({ error: false, statusCode: 200, message: 'Mata pelajaran diperbarui.', data: rows[0] ? mapSubjectRow(rows[0]) : null });
    } else {
      const id = generateEntityId('sj');
      await sql`INSERT INTO subjects (id, name, description, created_at, updated_at)
        VALUES (${id}, ${sanitizeInput(String(body.name ?? ''))}, ${sanitizeInput(String(body.description ?? ''))}, ${now}, ${now})`;

      const rows = await sql`SELECT * FROM subjects WHERE id = ${id}`;
      invalidateCache();
      return json({ error: false, statusCode: 201, message: 'Mata pelajaran dibuat.', data: rows[0] ? mapSubjectRow(rows[0]) : null });
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
    await sql`UPDATE subjects SET deleted_at = ${now}, updated_at = ${now} WHERE id = ${id}`;
    invalidateCache();
    return json({ error: false, statusCode: 200, message: 'Mata pelajaran dihapus.', data: null });
  } catch (err_raw) {
    const err = err_raw as Error;
    return json({ error: true, statusCode: 500, message: err.message, data: null }, { status: 500 });
  }
};
