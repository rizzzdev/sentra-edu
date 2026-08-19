import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { sql } from '$lib/server/db';
import { mapCandidateRow, generateEntityId } from '$lib/server/api-helpers';

export const GET: RequestHandler = async () => {
  try {
    const rows = await sql`SELECT * FROM candidates WHERE deleted_at IS NULL ORDER BY created_at DESC`;
    return json({ error: false, statusCode: 200, data: rows.map(mapCandidateRow) });
  } catch (err: any) {
    return json({ error: true, statusCode: 500, message: err.message, data: null }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();
    const now = new Date().toISOString();
    if (body.id) {
      await sql`UPDATE candidates SET status=${body.status},notes=${body.notes??''},interview_date=${body.interviewDate},updated_at=${now} WHERE id=${body.id}`;
      const rows = await sql`SELECT * FROM candidates WHERE id=${body.id}`;
      return json({ error: false, statusCode: 200, message: 'Kandidat diperbarui.', data: rows[0] ? mapCandidateRow(rows[0]) : null });
    } else {
      const id = generateEntityId('cand');
      await sql`INSERT INTO candidates (id,full_name,email,phone,education,experience_years,subject_ids,level_ids,cv_url,status,notes,interview_date,created_at,updated_at) VALUES (${id},${body.fullName},${body.email},${body.phone??''},${body.education??''},${body.experienceYears??0},${body.subjectIds??[]},${body.levelIds??[]},${body.cvUrl},${body.status??'REGISTERED'},${body.notes??''},${body.interviewDate},${now},${now})`;
      const rows = await sql`SELECT * FROM candidates WHERE id=${id}`;
      return json({ error: false, statusCode: 201, message: 'Kandidat dibuat.', data: rows[0] ? mapCandidateRow(rows[0]) : null });
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
    await sql`UPDATE candidates SET deleted_at=${now},updated_at=${now} WHERE id=${id}`;
    return json({ error: false, statusCode: 200, message: 'Kandidat dihapus.', data: null });
  } catch (err: any) {
    return json({ error: true, statusCode: 500, message: err.message, data: null }, { status: 500 });
  }
};
