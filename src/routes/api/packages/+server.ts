import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { sql } from '$lib/server/db';
import { getCached, setCache, invalidateCache } from '$lib/server/cache';
import { mapPackageRow, generateEntityId } from '$lib/server/api-helpers';
import { requireAdmin, isValidId, sanitizeInput } from '$lib/server/security';

export const GET: RequestHandler = async () => {
  try {
    const cached = getCached('packages');
    if (cached) return json({ error: false, statusCode: 200, data: cached });
    const rows = await sql`SELECT * FROM packages WHERE deleted_at IS NULL`;
    const list = rows.map(mapPackageRow);
    setCache('packages', list);
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
      const pkgId = String(body.id);
      if (!isValidId(pkgId)) return json({ error: true, statusCode: 400, message: 'ID tidak valid.', data: null }, { status: 400 });

      await sql`UPDATE packages SET
        name=${sanitizeInput(String(body.name ?? ''))},
        mode=${body.mode},
        period=${body.period},
        price=${Number(body.price) || 0},
        sessions_per_period=${Number(body.sessionsPerPeriod) || 0},
        max_students=${Number(body.maxStudents) || 1},
        tentor_fee=${Number(body.tentorFee) || 0},
        description=${sanitizeInput(String(body.description ?? ''))},
        active=${body.active ?? true},
        updated_at=${now}
      WHERE id=${pkgId}`;

      const rows = await sql`SELECT * FROM packages WHERE id=${pkgId}`;
      invalidateCache();
      return json({ error: false, statusCode: 200, message: 'Paket diperbarui.', data: rows[0] ? mapPackageRow(rows[0]) : null });
    } else {
      const id = generateEntityId('pkg');
      await sql`INSERT INTO packages (id,name,mode,period,price,sessions_per_period,max_students,tentor_fee,description,active,created_at,updated_at)
        VALUES (${id},${sanitizeInput(String(body.name ?? ''))},${body.mode},${body.period},${Number(body.price) || 0},${Number(body.sessionsPerPeriod) || 0},${Number(body.maxStudents) || 1},${Number(body.tentorFee) || 0},${sanitizeInput(String(body.description ?? ''))},${body.active ?? true},${now},${now})`;

      const rows = await sql`SELECT * FROM packages WHERE id=${id}`;
      invalidateCache();
      return json({ error: false, statusCode: 201, message: 'Paket dibuat.', data: rows[0] ? mapPackageRow(rows[0]) : null });
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
    await sql`UPDATE packages SET deleted_at=${now},updated_at=${now} WHERE id=${id}`;
    invalidateCache();
    return json({ error: false, statusCode: 200, message: 'Paket dihapus.', data: null });
  } catch (err_raw) {
    const err = err_raw as Error;
    return json({ error: true, statusCode: 500, message: err.message, data: null }, { status: 500 });
  }
};
