import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { sql } from '$lib/server/db';
import { mapEnrollmentRow, generateEntityId } from '$lib/server/api-helpers';

export const GET: RequestHandler = async () => {
  try {
    const rows = await sql`SELECT * FROM enrollments WHERE deleted_at IS NULL ORDER BY created_at DESC`;
    return json({ error: false, statusCode: 200, data: rows.map(mapEnrollmentRow) });
  } catch (err: any) {
    return json({ error: true, statusCode: 500, message: err.message, data: null }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();
    const now = new Date().toISOString();
    if (body.id) {
      await sql`UPDATE enrollments SET student_id=${body.studentId},subject_id=${body.subjectId},class_id=${body.classId},package_id=${body.packageId},tentor_id=${body.tentorId},schedule_day=${body.scheduleDay??''},schedule_time=${body.scheduleTime??''},status=${body.status??'ACTIVE'},address=${body.address},latitude=${body.latitude},longitude=${body.longitude},wali_user_id=${body.waliUserId},updated_at=${now} WHERE id=${body.id}`;
      const rows = await sql`SELECT * FROM enrollments WHERE id=${body.id}`;
      return json({ error: false, statusCode: 200, message: 'Pendaftaran diperbarui.', data: rows[0] ? mapEnrollmentRow(rows[0]) : null });
    } else {
      const id = generateEntityId('enr');
      await sql`INSERT INTO enrollments (id,student_id,subject_id,class_id,package_id,tentor_id,schedule_day,schedule_time,status,address,latitude,longitude,wali_user_id,created_at,updated_at) VALUES (${id},${body.studentId},${body.subjectId},${body.classId},${body.packageId},${body.tentorId},${body.scheduleDay??''},${body.scheduleTime??''},${body.status??'ACTIVE'},${body.address},${body.latitude},${body.longitude},${body.waliUserId},${now},${now})`;
      const rows = await sql`SELECT * FROM enrollments WHERE id=${id}`;
      return json({ error: false, statusCode: 201, message: 'Pendaftaran dibuat.', data: rows[0] ? mapEnrollmentRow(rows[0]) : null });
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
    await sql`UPDATE enrollments SET deleted_at=${now},updated_at=${now} WHERE id=${id}`;
    return json({ error: false, statusCode: 200, message: 'Pendaftaran dihapus.', data: null });
  } catch (err: any) {
    return json({ error: true, statusCode: 500, message: err.message, data: null }, { status: 500 });
  }
};
