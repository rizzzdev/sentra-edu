import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { sql } from '$lib/server/db';
import { getCached, setCache, invalidateCache } from '$lib/server/cache';
import { mapClassRow, generateEntityId } from '$lib/server/api-helpers';

export const GET: RequestHandler = async () => {
  try {
    
    const cached = getCached('classes');
    if (cached) return json({ error: false, statusCode: 200, data: cached });
const rows = await sql`SELECT * FROM classes WHERE deleted_at IS NULL`;
    setCache('classes', rows.map(mapClassRow));
    return json({ error: false, statusCode: 200, data: rows.map(mapClassRow) });
  } catch (err_raw) { const err = err_raw as Error;
    return json({ error: true, statusCode: 500, message: err.message, data: null }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();
    const now = new Date().toISOString();
    if (body.id) {
      await sql`UPDATE classes SET class_name = ${body.className}, education_level_id = ${body.educationLevelId}, base_rate_per_90min = ${body.baseRatePer90Min ?? 0}, description = ${body.description ?? ''}, updated_at = ${now} WHERE id = ${body.id}`;
      const rows = await sql`SELECT * FROM classes WHERE id = ${body.id}`;
      invalidateCache();
      return json({ error: false, statusCode: 200, message: 'Kelas diperbarui.', data: rows[0] ? mapClassRow(rows[0]) : null });
    } else {
      const id = generateEntityId('cl');
      await sql`INSERT INTO classes (id, class_name, education_level_id, base_rate_per_90min, description, created_at, updated_at) VALUES (${id}, ${body.className}, ${body.educationLevelId}, ${body.baseRatePer90Min ?? 0}, ${body.description ?? ''}, ${now}, ${now})`;
      const rows = await sql`SELECT * FROM classes WHERE id = ${id}`;
      invalidateCache();
      return json({ error: false, statusCode: 201, message: 'Kelas dibuat.', data: rows[0] ? mapClassRow(rows[0]) : null });
    }
  } catch (err_raw) { const err = err_raw as Error;
    return json({ error: true, statusCode: 500, message: err.message, data: null }, { status: 500 });
  }
};

export const DELETE: RequestHandler = async ({ url }) => {
  try {
    const id = url.searchParams.get('id');
    if (!id) return json({ error: true, statusCode: 400, message: 'ID wajib.', data: null }, { status: 400 });
    const now = new Date().toISOString();
    await sql`UPDATE classes SET deleted_at = ${now}, updated_at = ${now} WHERE id = ${id}`;
    invalidateCache();
      return json({ error: false, statusCode: 200, message: 'Kelas dihapus.', data: null });
  } catch (err_raw) { const err = err_raw as Error;
    return json({ error: true, statusCode: 500, message: err.message, data: null }, { status: 500 });
  }
};
