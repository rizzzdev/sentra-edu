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
    // Ensure array fields are always arrays
    const classIds = Array.isArray(body.classIds) ? body.classIds : (body.classId ? [String(body.classId)] : []);
    const subjectIds = Array.isArray(body.subjectIds) ? body.subjectIds : (body.subjectId ? [String(body.subjectId)] : []);
    const studentIds = Array.isArray(body.studentIds) ? body.studentIds : (body.studentId ? [String(body.studentId)] : []);
    const studentNames = Array.isArray(body.studentNames) ? body.studentNames : [];
    const scheduleDays = Array.isArray(body.scheduleDays)
      ? body.scheduleDays.map(String)
      : ['MONDAY'];

    if (body.id) {
      const jobId = String(body.id);
      if (!isValidId(jobId)) return json({ error: true, statusCode: 400, message: 'ID tidak valid.', data: null }, { status: 400 });
      await sql`UPDATE jobs SET
        title=${sanitizeInput(String(body.title ?? ''))},
        class_id=${classIds[0] || null},
        class_ids=${classIds},
        subject_id=${subjectIds[0] || null},
        subject_ids=${subjectIds},
        package_id=${body.packageId},
        job_mode=${body.jobMode ?? body.mode ?? 'OFFLINE'},
        tentor_fee=${body.tentorFee ?? 0},
        transport_allowance=${body.transportAllowance ?? 0},
        session_duration_minutes=${body.sessionDurationMinutes ?? 90},
        schedule_days=${scheduleDays},
        schedule_time=${body.scheduleTime ?? ''},
        schedule_end_time=${body.scheduleEndTime ?? ''},
        student_count=${body.studentCount ?? (studentIds.length || 1)},
        location=${sanitizeInput(String(body.location ?? ''))},
        latitude=${body.latitude},
        longitude=${body.longitude},
        status=${body.status ?? 'AVAILABLE'},
        assigned_tentor_id=${body.assignedTentorId},
        student_id=${studentIds[0] || null},
        student_ids=${studentIds},
        student_names=${studentNames},
        enrollment_id=${body.enrollmentId},
        notes=${sanitizeInput(String(body.notes ?? ''))},
        additional_notes=${sanitizeInput(String(body.additionalNotes ?? ''))},
        updated_at=${now}
      WHERE id=${jobId}`;
      const rows = await sql`SELECT * FROM jobs WHERE id=${jobId}`;
      invalidateCache();
      return json({ error: false, statusCode: 200, message: 'Lowongan diperbarui.', data: rows[0] ? mapJobRow(rows[0]) : null });
    } else {
      const id = generateEntityId('job');
      await sql`INSERT INTO jobs (id,title,class_id,class_ids,subject_id,subject_ids,package_id,job_mode,tentor_fee,transport_allowance,session_duration_minutes,schedule_days,schedule_time,schedule_end_time,student_count,location,latitude,longitude,status,assigned_tentor_id,student_id,student_ids,student_names,enrollment_id,notes,additional_notes,created_at,updated_at)
        VALUES (${id},${sanitizeInput(String(body.title ?? ''))},${classIds[0] || null},${classIds},${subjectIds[0] || null},${subjectIds},${body.packageId},${body.jobMode ?? body.mode ?? 'OFFLINE'},${body.tentorFee ?? 120000},${body.transportAllowance ?? 0},${body.sessionDurationMinutes ?? 90},${scheduleDays},${body.scheduleTime ?? '16:00'},${body.scheduleEndTime ?? ''},${body.studentCount ?? (studentIds.length || 1)},${sanitizeInput(String(body.location ?? 'Lokasi Siswa'))},${body.latitude},${body.longitude},'AVAILABLE',${body.assignedTentorId},${studentIds[0] || null},${studentIds},${studentNames},${body.enrollmentId},${sanitizeInput(String(body.notes ?? ''))},${sanitizeInput(String(body.additionalNotes ?? ''))},${now},${now})`;
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
