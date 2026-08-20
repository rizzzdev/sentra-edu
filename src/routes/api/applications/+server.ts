import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { sql } from '$lib/server/db';
import { getCached, setCache, invalidateCache } from '$lib/server/cache';
import { mapApplicationRow, generateEntityId } from '$lib/server/api-helpers';
import { isValidId, sanitizeInput } from '$lib/server/security';

export const GET: RequestHandler = async ({ url }) => {
  try {
    const cached = getCached('applications');
    if (cached) return json({ error: false, statusCode: 200, data: cached });
    const rows = await sql`SELECT * FROM applications WHERE deleted_at IS NULL ORDER BY created_at DESC`;
    const list = rows.map(mapApplicationRow);
    setCache('applications', list);
    return json({ error: false, statusCode: 200, data: list });
  } catch (err_raw) {
    const err = err_raw as Error;
    return json({ error: true, statusCode: 500, message: err.message, data: null }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = (await request.json()) as Record<string, string | number | boolean | null | undefined>;
    const now = new Date().toISOString();

    if (body.id) {
      const appId = String(body.id);
      if (!isValidId(appId)) return json({ error: true, statusCode: 400, message: 'ID tidak valid.', data: null }, { status: 400 });

      await sql`UPDATE applications SET
        status=${body.status ?? 'PENDING'},
        notes=${sanitizeInput(String(body.notes ?? ''))},
        updated_at=${now}
      WHERE id=${appId}`;

      const rows = await sql`SELECT * FROM applications WHERE id=${appId}`;
      invalidateCache();
      return json({ error: false, statusCode: 200, message: 'Lamaran diperbarui.', data: rows[0] ? mapApplicationRow(rows[0]) : null });
    } else {
      const jobId = String(body.jobId || '');
      const tentorId = String(body.tentorId || '');

      if (!jobId || !tentorId) {
        return json({ error: true, statusCode: 400, message: 'Job ID dan Tentor ID wajib diisi.', data: null }, { status: 400 });
      }

      // Check for existing active application
      const existing = await sql`SELECT id FROM applications WHERE job_id=${jobId} AND tentor_id=${tentorId} AND deleted_at IS NULL`;
      if (existing.length > 0) {
        return json({ error: true, statusCode: 409, message: 'Anda sudah pernah melamar lowongan ini.', data: null }, { status: 409 });
      }

      const id = generateEntityId('app');
      const notes = sanitizeInput(String(body.notes ?? ''));

      await sql`INSERT INTO applications (id, job_id, tentor_id, status, applied_at, notes, created_at, updated_at)
        VALUES (${id}, ${jobId}, ${tentorId}, 'PENDING', ${now}, ${notes}, ${now}, ${now})`;

      const rows = await sql`SELECT * FROM applications WHERE id=${id}`;
      invalidateCache();
      return json({ error: false, statusCode: 201, message: 'Lamaran berhasil dikirim.', data: rows[0] ? mapApplicationRow(rows[0]) : null });
    }
  } catch (err_raw) {
    const err = err_raw as Error;
    return json({ error: true, statusCode: 500, message: err.message, data: null }, { status: 500 });
  }
};

export const DELETE: RequestHandler = async ({ url }) => {
  try {
    const id = url.searchParams.get('id');
    if (!id || !isValidId(id)) return json({ error: true, statusCode: 400, message: 'ID wajib dan harus valid.', data: null }, { status: 400 });
    const now = new Date().toISOString();
    await sql`UPDATE applications SET deleted_at=${now}, updated_at=${now} WHERE id=${id}`;
    invalidateCache();
    return json({ error: false, statusCode: 200, message: 'Lamaran dibatalkan.', data: null });
  } catch (err_raw) {
    const err = err_raw as Error;
    return json({ error: true, statusCode: 500, message: err.message, data: null }, { status: 500 });
  }
};
