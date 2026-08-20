import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { sql } from '$lib/server/db';
import { getCached, setCache, invalidateCache } from '$lib/server/cache';
import { mapAttendanceRow, generateEntityId } from '$lib/server/api-helpers';
import { requireAdmin, isValidId, sanitizeInput } from '$lib/server/security';

export const GET: RequestHandler = async () => {
  try {
    const cached = getCached('attendances');
    if (cached) return json({ error: false, statusCode: 200, data: cached });
    const rows = await sql`SELECT * FROM attendances WHERE deleted_at IS NULL ORDER BY created_at DESC`;
    const list = rows.map(mapAttendanceRow);
    setCache('attendances', list);
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
      const attId = String(body.id);
      if (!isValidId(attId)) return json({ error: true, statusCode: 400, message: 'ID tidak valid.', data: null }, { status: 400 });

      await sql`UPDATE attendances SET
        status=${body.status ?? 'SUBMITTED'},
        review_notes=${sanitizeInput(String(body.reviewNotes ?? ''))},
        student_confirmed=${body.studentConfirmed ?? false},
        student_rating=${body.studentRating ? Number(body.studentRating) : null},
        student_feedback=${sanitizeInput(String(body.studentFeedback ?? ''))},
        updated_at=${now}
      WHERE id=${attId}`;

      const rows = await sql`SELECT * FROM attendances WHERE id=${attId}`;
      invalidateCache();
      return json({ error: false, statusCode: 200, message: 'Presensi diperbarui.', data: rows[0] ? mapAttendanceRow(rows[0]) : null });
    } else {
      const id = generateEntityId('att');
      await sql`INSERT INTO attendances (id,enrollment_id,tentor_id,session_date,start_time,end_time,topic,student_notes,status,latitude_check_in,longitude_check_in,is_radius_valid,proof_photo_url,student_confirmed,created_at,updated_at)
        VALUES (${id},${body.enrollmentId},${body.tentorId},${body.sessionDate},${body.startTime},${body.endTime},${sanitizeInput(String(body.topic ?? ''))},${sanitizeInput(String(body.studentNotes ?? ''))},${body.status ?? 'SUBMITTED'},${body.latitudeCheckIn},${body.longitudeCheckIn},${body.isRadiusValid ?? false},${body.proofPhotoUrl},${body.studentConfirmed ?? false},${now},${now})`;

      const rows = await sql`SELECT * FROM attendances WHERE id=${id}`;
      invalidateCache();
      return json({ error: false, statusCode: 201, message: 'Presensi dibuat.', data: rows[0] ? mapAttendanceRow(rows[0]) : null });
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
    await sql`UPDATE attendances SET deleted_at=${now},updated_at=${now} WHERE id=${id}`;
    invalidateCache();
    return json({ error: false, statusCode: 200, message: 'Presensi dihapus.', data: null });
  } catch (err_raw) {
    const err = err_raw as Error;
    return json({ error: true, statusCode: 500, message: err.message, data: null }, { status: 500 });
  }
};
