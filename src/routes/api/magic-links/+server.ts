import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { sql } from '$lib/server/db';
import { mapMagicLinkRow, generateEntityId } from '$lib/server/api-helpers';

export const GET: RequestHandler = async () => {
  try {
    const rows = await sql`SELECT * FROM magic_links WHERE deleted_at IS NULL ORDER BY created_at DESC`;
    return json({ error: false, statusCode: 200, data: rows.map(mapMagicLinkRow) });
  } catch (err_raw) { const err = err_raw as Error;
    return json({ error: true, statusCode: 500, message: err.message, data: null }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();
    const now = new Date().toISOString();
    if (body.id) {
      await sql`UPDATE magic_links SET active=${body.active},used_count=${body.usedCount},updated_at=${now} WHERE id=${body.id}`;
      const rows = await sql`SELECT * FROM magic_links WHERE id=${body.id}`;
      return json({ error: false, statusCode: 200, message: 'Magic link diperbarui.', data: rows[0] ? mapMagicLinkRow(rows[0]) : null });
    } else {
      const id = generateEntityId('ml');
      await sql`INSERT INTO magic_links (id,token,title,days_valid,expires_at,used_count,active,target_role,class_id,package_id,created_by,created_at,updated_at) VALUES (${id},${body.token},${body.title},${body.daysValid},${body.expiresAt},${body.usedCount??0},${body.active??true},${body.targetRole},${body.classId},${body.packageId},${body.createdBy},${now},${now})`;
      const rows = await sql`SELECT * FROM magic_links WHERE id=${id}`;
      return json({ error: false, statusCode: 201, message: 'Magic link dibuat.', data: rows[0] ? mapMagicLinkRow(rows[0]) : null });
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
    await sql`UPDATE magic_links SET deleted_at=${now},updated_at=${now} WHERE id=${id}`;
    return json({ error: false, statusCode: 200, message: 'Magic link dihapus.', data: null });
  } catch (err_raw) { const err = err_raw as Error;
    return json({ error: true, statusCode: 500, message: err.message, data: null }, { status: 500 });
  }
};
