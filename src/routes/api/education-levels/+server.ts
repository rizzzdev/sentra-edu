import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { sql } from '$lib/server/db';
import { mapLevelRow, generateEntityId } from '$lib/server/api-helpers';

export const GET: RequestHandler = async () => {
  try {
    const rows = await sql`SELECT * FROM education_levels WHERE deleted_at IS NULL`;
    return json({ error: false, statusCode: 200, data: rows.map(mapLevelRow) });
  } catch (err: any) {
    return json({ error: true, statusCode: 500, message: err.message, data: null }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();
    const now = new Date().toISOString();
    if (body.id) {
      await sql`UPDATE education_levels SET level_name = ${body.levelName}, description = ${body.description ?? ''}, updated_at = ${now} WHERE id = ${body.id}`;
      const rows = await sql`SELECT * FROM education_levels WHERE id = ${body.id}`;
      return json({ error: false, statusCode: 200, message: 'Jenjang diperbarui.', data: rows[0] ? mapLevelRow(rows[0]) : null });
    } else {
      const id = generateEntityId('lv');
      await sql`INSERT INTO education_levels (id, level_name, description, created_at, updated_at) VALUES (${id}, ${body.levelName}, ${body.description ?? ''}, ${now}, ${now})`;
      const rows = await sql`SELECT * FROM education_levels WHERE id = ${id}`;
      return json({ error: false, statusCode: 201, message: 'Jenjang dibuat.', data: rows[0] ? mapLevelRow(rows[0]) : null });
    }
  } catch (err: any) {
    return json({ error: true, statusCode: 500, message: err.message, data: null }, { status: 500 });
  }
};

export const DELETE: RequestHandler = async ({ url }) => {
  try {
    const id = url.searchParams.get('id');
    if (!id) return json({ error: true, statusCode: 400, message: 'ID wajib.', data: null }, { status: 400 });
    const now = new Date().toISOString();
    await sql`UPDATE education_levels SET deleted_at = ${now}, updated_at = ${now} WHERE id = ${id}`;
    return json({ error: false, statusCode: 200, message: 'Jenjang dihapus.', data: null });
  } catch (err: any) {
    return json({ error: true, statusCode: 500, message: err.message, data: null }, { status: 500 });
  }
};
