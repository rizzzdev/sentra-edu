import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { sql } from '$lib/server/db';
import { mapSubjectRow, generateEntityId } from '$lib/server/api-helpers';

export const GET: RequestHandler = async () => {
  try {
    const rows = await sql`SELECT * FROM subjects WHERE deleted_at IS NULL ORDER BY created_at DESC`;
    return json({ error: false, statusCode: 200, data: rows.map(mapSubjectRow) });
  } catch (err_raw) { const err = err_raw as Error;
    return json({ error: true, statusCode: 500, message: err.message, data: null }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();
    const now = new Date().toISOString();

    if (body.id) {
      await sql`UPDATE subjects SET name = ${body.name}, description = ${body.description ?? ''}, updated_at = ${now} WHERE id = ${body.id} AND deleted_at IS NULL`;
      const rows = await sql`SELECT * FROM subjects WHERE id = ${body.id}`;
      return json({ error: false, statusCode: 200, message: 'Mata pelajaran diperbarui.', data: rows[0] ? mapSubjectRow(rows[0]) : null });
    } else {
      const id = generateEntityId('sj');
      await sql`INSERT INTO subjects (id, name, description, created_at, updated_at) VALUES (${id}, ${body.name}, ${body.description ?? ''}, ${now}, ${now})`;
      const rows = await sql`SELECT * FROM subjects WHERE id = ${id}`;
      return json({ error: false, statusCode: 201, message: 'Mata pelajaran dibuat.', data: rows[0] ? mapSubjectRow(rows[0]) : null });
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
    await sql`UPDATE subjects SET deleted_at = ${now}, updated_at = ${now} WHERE id = ${id}`;
    return json({ error: false, statusCode: 200, message: 'Mata pelajaran dihapus.', data: null });
  } catch (err_raw) { const err = err_raw as Error;
    return json({ error: true, statusCode: 500, message: err.message, data: null }, { status: 500 });
  }
};
