import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { sql } from '$lib/server/db';
import { mapJobRow, generateEntityId } from '$lib/server/api-helpers';

export const GET: RequestHandler = async () => {
  try {
    const rows = await sql`SELECT * FROM jobs WHERE deleted_at IS NULL ORDER BY created_at DESC`;
    return json({ error: false, statusCode: 200, data: rows.map(mapJobRow) });
  } catch (err: any) {
    return json({ error: true, statusCode: 500, message: err.message, data: null }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();
    const now = new Date().toISOString();
    if (body.id) {
      await sql`UPDATE jobs SET title=${body.title},class_id=${body.classId},subject_id=${body.subjectId},package_id=${body.packageId},job_type=${body.jobType??'REGULAR'},job_mode=${body.jobMode??'OFFLINE'},tentor_fee=${body.tentorFee??0},session_duration_minutes=${body.sessionDurationMinutes??90},schedule_days=${body.scheduleDays??[]},schedule_time=${body.scheduleTime??''},student_count=${body.studentCount??1},location=${body.location??''},latitude=${body.latitude},longitude=${body.longitude},status=${body.status??'AVAILABLE'},assigned_tentor_id=${body.assignedTentorId},student_id=${body.studentId},enrollment_id=${body.enrollmentId},notes=${body.notes??''},updated_at=${now} WHERE id=${body.id}`;
      const rows = await sql`SELECT * FROM jobs WHERE id=${body.id}`;
      return json({ error: false, statusCode: 200, message: 'Lowongan diperbarui.', data: rows[0] ? mapJobRow(rows[0]) : null });
    } else {
      const id = generateEntityId('job');
      await sql`INSERT INTO jobs (id,title,class_id,subject_id,package_id,job_type,job_mode,tentor_fee,session_duration_minutes,schedule_days,schedule_time,student_count,location,latitude,longitude,status,assigned_tentor_id,student_id,enrollment_id,notes,created_at,updated_at) VALUES (${id},${body.title},${body.classId},${body.subjectId},${body.packageId},${body.jobType??'REGULAR'},${body.jobMode??'OFFLINE'},${body.tentorFee??120000},${body.sessionDurationMinutes??90},${body.scheduleDays??['Senin']},${body.scheduleTime??'16:00'},${body.studentCount??1},${body.location??'Lokasi Siswa'},${body.latitude},${body.longitude},'AVAILABLE',${body.assignedTentorId},${body.studentId},${body.enrollmentId},${body.notes??''},${now},${now})`;
      const rows = await sql`SELECT * FROM jobs WHERE id=${id}`;
      return json({ error: false, statusCode: 201, message: 'Lowongan dibuat.', data: rows[0] ? mapJobRow(rows[0]) : null });
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
    await sql`UPDATE jobs SET deleted_at=${now},updated_at=${now} WHERE id=${id}`;
    return json({ error: false, statusCode: 200, message: 'Lowongan dihapus.', data: null });
  } catch (err: any) {
    return json({ error: true, statusCode: 500, message: err.message, data: null }, { status: 500 });
  }
};
