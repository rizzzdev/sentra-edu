import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { sql } from '$lib/server/db';
import { getCached, setCache, invalidateCache } from '$lib/server/cache';
import { mapClassRow, generateEntityId } from '$lib/server/api-helpers';
import { requireAdmin, isValidId, sanitizeInput } from '$lib/server/security';

export const GET: RequestHandler = async () => {
  try {
    const cached = getCached('classes');
    if (cached) return json({ error: false, statusCode: 200, data: cached });
    const rows = await sql`SELECT * FROM classes WHERE deleted_at IS NULL`;
    const list = rows.map(mapClassRow);
    setCache('classes', list);
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
      const classId = String(body.id);
      if (!isValidId(classId)) return json({ error: true, statusCode: 400, message: 'ID tidak valid.', data: null }, { status: 400 });

      await sql`UPDATE classes SET
        class_name = ${sanitizeInput(String(body.className ?? ''))},
        education_level_id = ${body.educationLevelId},
        base_rate_per_90min = ${Number(body.baseRatePer90Min) || 0},
        description = ${sanitizeInput(String(body.description ?? ''))},
        updated_at = ${now}
      WHERE id = ${classId}`;

      const rows = await sql`SELECT * FROM classes WHERE id = ${classId}`;
      invalidateCache();
      return json({ error: false, statusCode: 200, message: 'Kelas diperbarui.', data: rows[0] ? mapClassRow(rows[0]) : null });
    } else {
      const id = generateEntityId('cl');
      await sql`INSERT INTO classes (id, class_name, education_level_id, base_rate_per_90min, description, created_at, updated_at)
        VALUES (${id}, ${sanitizeInput(String(body.className ?? ''))}, ${body.educationLevelId}, ${Number(body.baseRatePer90Min) || 0}, ${sanitizeInput(String(body.description ?? ''))}, ${now}, ${now})`;

      const rows = await sql`SELECT * FROM classes WHERE id = ${id}`;
      invalidateCache();
      return json({ error: false, statusCode: 201, message: 'Kelas dibuat.', data: rows[0] ? mapClassRow(rows[0]) : null });
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
    await sql`UPDATE classes SET deleted_at = ${now}, updated_at = ${now} WHERE id = ${id}`;
    invalidateCache();
    return json({ error: false, statusCode: 200, message: 'Kelas dihapus.', data: null });
  } catch (err_raw) {
    const err = err_raw as Error;
    return json({ error: true, statusCode: 500, message: err.message, data: null }, { status: 500 });
  }
};
