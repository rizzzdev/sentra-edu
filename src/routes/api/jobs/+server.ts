import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { sql } from '$lib/server/db';
import { getCached, setCache, invalidateCache } from '$lib/server/cache';
import { mapJobRow, generateEntityId } from '$lib/server/api-helpers';
import { requireAdmin, isValidId, sanitizeInput } from '$lib/server/security';

export const GET: RequestHandler = async () => {
  try {
    const cached = getCached('jobs');
    if (cached) return json({ error: false, statusCode: 200, data: cached });
    const rows = await sql`SELECT * FROM jobs WHERE deleted_at IS NULL ORDER BY created_at DESC`;
    setCache('jobs', rows.map(mapJobRow));
    return json({ error: false, statusCode: 200, data: rows.map(mapJobRow) });
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

    const body = (await request.json()) as Record<string, string | number | boolean | string[] | null | undefined>;
    const now = new Date().toISOString();
    if (body.id) {
      const jobId = String(body.id);
      if (!isValidId(jobId)) return json({ error: true, statusCode: 400, message: 'ID tidak valid.', data: null }, { status: 400 });
      await sql`UPDATE jobs SET
        title=${sanitizeInput(String(body.title ?? ''))},
        class_id=${body.classId},
        subject_id=${body.subjectId},
        package_id=${body.packageId},
        job_mode=${body.jobMode ?? body.mode ?? 'OFFLINE'},
        tentor_fee=${body.tentorFee ?? 0},
        session_duration_minutes=${body.sessionDurationMinutes ?? 90},
        schedule_days=${body.scheduleDays ?? []},
        schedule_time=${body.scheduleTime ?? ''},
        student_count=${body.studentCount ?? 1},
        location=${sanitizeInput(String(body.location ?? ''))},
        latitude=${body.latitude},
        longitude=${body.longitude},
        status=${body.status ?? 'AVAILABLE'},
        assigned_tentor_id=${body.assignedTentorId},
        student_id=${body.studentId},
        enrollment_id=${body.enrollmentId},
        notes=${sanitizeInput(String(body.notes ?? ''))},
        updated_at=${now}
      WHERE id=${jobId}`;
      const rows = await sql`SELECT * FROM jobs WHERE id=${jobId}`;
      invalidateCache();
      return json({ error: false, statusCode: 200, message: 'Lowongan diperbarui.', data: rows[0] ? mapJobRow(rows[0]) : null });
    } else {
      const id = generateEntityId('job');
      await sql`INSERT INTO jobs (id,title,class_id,subject_id,package_id,job_mode,tentor_fee,session_duration_minutes,schedule_days,schedule_time,student_count,location,latitude,longitude,status,assigned_tentor_id,student_id,enrollment_id,notes,created_at,updated_at)
        VALUES (${id},${sanitizeInput(String(body.title ?? ''))},${body.classId},${body.subjectId},${body.packageId},${body.jobMode ?? body.mode ?? 'OFFLINE'},${body.tentorFee ?? 120000},${body.sessionDurationMinutes ?? 90},${body.scheduleDays ?? ['Senin']},${body.scheduleTime ?? '16:00'},${body.studentCount ?? 1},${sanitizeInput(String(body.location ?? 'Lokasi Siswa'))},${body.latitude},${body.longitude},'AVAILABLE',${body.assignedTentorId},${body.studentId},${body.enrollmentId},${sanitizeInput(String(body.notes ?? ''))},${now},${now})`;
      const rows = await sql`SELECT * FROM jobs WHERE id=${id}`;
      invalidateCache();
      return json({ error: false, statusCode: 201, message: 'Lowongan dibuat.', data: rows[0] ? mapJobRow(rows[0]) : null });
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
    await sql`UPDATE jobs SET deleted_at=${now},updated_at=${now} WHERE id=${id}`;
    invalidateCache();
    return json({ error: false, statusCode: 200, message: 'Lowongan dihapus.', data: null });
  } catch (err_raw) {
    const err = err_raw as Error;
    return json({ error: true, statusCode: 500, message: err.message, data: null }, { status: 500 });
  }
};
