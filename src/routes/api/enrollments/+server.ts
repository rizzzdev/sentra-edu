import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { sql } from '$lib/server/db';
import { getCached, setCache, invalidateCache } from '$lib/server/cache';
import { mapEnrollmentRow, generateEntityId } from '$lib/server/api-helpers';
import { requireAdmin, isValidId, sanitizeInput } from '$lib/server/security';

export const GET: RequestHandler = async () => {
  try {
    const cached = getCached('enrollments');
    if (cached) return json({ error: false, statusCode: 200, data: cached });
    const rows = await sql`SELECT * FROM enrollments WHERE deleted_at IS NULL ORDER BY created_at DESC`;
    const list = rows.map(mapEnrollmentRow);
    setCache('enrollments', list);
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
      const enrId = String(body.id);
      if (!isValidId(enrId)) return json({ error: true, statusCode: 400, message: 'ID tidak valid.', data: null }, { status: 400 });

      const existingRows = await sql`SELECT * FROM enrollments WHERE id=${enrId} AND deleted_at IS NULL`;
      if (existingRows.length === 0) {
        return json({ error: true, statusCode: 404, message: 'Pendaftaran tidak ditemukan.', data: null }, { status: 404 });
      }
      const prev = existingRows[0];

      const studentId = body.studentId !== undefined ? body.studentId : prev.student_id;
      const subjectId = body.subjectId !== undefined ? body.subjectId : prev.subject_id;
      const classId = body.classId !== undefined ? body.classId : prev.class_id;
      const packageId = body.packageId !== undefined ? body.packageId : prev.package_id;
      const tentorId = body.tentorId !== undefined ? body.tentorId : prev.tentor_id;
      const scheduleDay = body.scheduleDay !== undefined ? body.scheduleDay : prev.schedule_day;
      const scheduleTime = body.scheduleTime !== undefined ? body.scheduleTime : prev.schedule_time;
      const status = body.status !== undefined ? body.status : prev.status;
      const address = body.address !== undefined ? sanitizeInput(String(body.address)) : prev.address;
      const latitude = body.latitude !== undefined ? body.latitude : prev.latitude;
      const longitude = body.longitude !== undefined ? body.longitude : prev.longitude;
      const waliUserId = body.waliUserId !== undefined ? body.waliUserId : prev.wali_user_id;

      await sql`UPDATE enrollments SET
        student_id=${studentId},
        subject_id=${subjectId},
        class_id=${classId},
        package_id=${packageId},
        tentor_id=${tentorId},
        schedule_day=${scheduleDay ?? ''},
        schedule_time=${scheduleTime ?? ''},
        status=${status ?? 'ACTIVE'},
        address=${address},
        latitude=${latitude},
        longitude=${longitude},
        wali_user_id=${waliUserId},
        updated_at=${now}
      WHERE id=${enrId}`;

      const rows = await sql`SELECT * FROM enrollments WHERE id=${enrId}`;
      invalidateCache();
      return json({ error: false, statusCode: 200, message: 'Pendaftaran diperbarui.', data: rows[0] ? mapEnrollmentRow(rows[0]) : null });
    } else {
      const id = generateEntityId('enr');
      await sql`INSERT INTO enrollments (id,student_id,subject_id,class_id,package_id,tentor_id,schedule_day,schedule_time,status,address,latitude,longitude,wali_user_id,created_at,updated_at)
        VALUES (${id},${body.studentId},${body.subjectId},${body.classId},${body.packageId},${body.tentorId},${body.scheduleDay ?? ''},${body.scheduleTime ?? ''},${body.status ?? 'ACTIVE'},${sanitizeInput(String(body.address ?? ''))},${body.latitude},${body.longitude},${body.waliUserId},${now},${now})`;

      const rows = await sql`SELECT * FROM enrollments WHERE id=${id}`;
      invalidateCache();
      return json({ error: false, statusCode: 201, message: 'Pendaftaran dibuat.', data: rows[0] ? mapEnrollmentRow(rows[0]) : null });
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
    await sql`UPDATE enrollments SET deleted_at=${now},updated_at=${now} WHERE id=${id}`;
    invalidateCache();
    return json({ error: false, statusCode: 200, message: 'Pendaftaran dihapus.', data: null });
  } catch (err_raw) {
    const err = err_raw as Error;
    return json({ error: true, statusCode: 500, message: err.message, data: null }, { status: 500 });
  }
};
