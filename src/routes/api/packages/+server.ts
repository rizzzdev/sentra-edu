import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { sql } from '$lib/server/db';
import { mapPackageRow, generateEntityId } from '$lib/server/api-helpers';

export const GET: RequestHandler = async () => {
  try {
    const rows = await sql`SELECT * FROM packages WHERE deleted_at IS NULL`;
    return json({ error: false, statusCode: 200, data: rows.map(mapPackageRow) });
  } catch (err: any) {
    return json({ error: true, statusCode: 500, message: err.message, data: null }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();
    const now = new Date().toISOString();
    if (body.id) {
      await sql`UPDATE packages SET name=${body.name},mode=${body.mode},period=${body.period},price=${body.price},sessions_per_period=${body.sessionsPerPeriod},max_students=${body.maxStudents},tentor_fee=${body.tentorFee},description=${body.description??''},active=${body.active??true},updated_at=${now} WHERE id=${body.id}`;
      const rows = await sql`SELECT * FROM packages WHERE id=${body.id}`;
      return json({ error: false, statusCode: 200, message: 'Paket diperbarui.', data: rows[0] ? mapPackageRow(rows[0]) : null });
    } else {
      const id = generateEntityId('pkg');
      await sql`INSERT INTO packages (id,name,mode,period,price,sessions_per_period,max_students,tentor_fee,description,active,created_at,updated_at) VALUES (${id},${body.name},${body.mode},${body.period},${body.price},${body.sessionsPerPeriod},${body.maxStudents},${body.tentorFee},${body.description??''},${body.active??true},${now},${now})`;
      const rows = await sql`SELECT * FROM packages WHERE id=${id}`;
      return json({ error: false, statusCode: 201, message: 'Paket dibuat.', data: rows[0] ? mapPackageRow(rows[0]) : null });
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
    await sql`UPDATE packages SET deleted_at=${now},updated_at=${now} WHERE id=${id}`;
    return json({ error: false, statusCode: 200, message: 'Paket dihapus.', data: null });
  } catch (err: any) {
    return json({ error: true, statusCode: 500, message: err.message, data: null }, { status: 500 });
  }
};
