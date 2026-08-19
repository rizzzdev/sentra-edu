import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { sql } from '$lib/server/db';
import { mapAttendanceRow, generateEntityId } from '$lib/server/api-helpers';

export const GET: RequestHandler = async () => {
  try {
    const rows = await sql`SELECT * FROM attendances WHERE deleted_at IS NULL ORDER BY created_at DESC`;
    return json({ error: false, statusCode: 200, data: rows.map(mapAttendanceRow) });
  } catch (err_raw) { const err = err_raw as Error;
    return json({ error: true, statusCode: 500, message: err.message, data: null }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();
    const now = new Date().toISOString();
    if (body.id) {
      await sql`UPDATE attendances SET status=${body.status},review_notes=${body.reviewNotes??''},student_confirmed=${body.studentConfirmed??false},student_rating=${body.studentRating},student_feedback=${body.studentFeedback},updated_at=${now} WHERE id=${body.id}`;
      const rows = await sql`SELECT * FROM attendances WHERE id=${body.id}`;
      return json({ error: false, statusCode: 200, message: 'Presensi diperbarui.', data: rows[0] ? mapAttendanceRow(rows[0]) : null });
    } else {
      const id = generateEntityId('att');
      await sql`INSERT INTO attendances (id,enrollment_id,tentor_id,session_date,start_time,end_time,topic,student_notes,status,latitude_check_in,longitude_check_in,is_radius_valid,proof_photo_url,student_confirmed,created_at,updated_at) VALUES (${id},${body.enrollmentId},${body.tentorId},${body.sessionDate},${body.startTime},${body.endTime},${body.topic},${body.studentNotes??''},${body.status??'SUBMITTED'},${body.latitudeCheckIn},${body.longitudeCheckIn},${body.isRadiusValid??false},${body.proofPhotoUrl},${body.studentConfirmed??false},${now},${now})`;
      const rows = await sql`SELECT * FROM attendances WHERE id=${id}`;
      return json({ error: false, statusCode: 201, message: 'Presensi dibuat.', data: rows[0] ? mapAttendanceRow(rows[0]) : null });
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
    await sql`UPDATE attendances SET deleted_at=${now},updated_at=${now} WHERE id=${id}`;
    return json({ error: false, statusCode: 200, message: 'Presensi dihapus.', data: null });
  } catch (err_raw) { const err = err_raw as Error;
    return json({ error: true, statusCode: 500, message: err.message, data: null }, { status: 500 });
  }
};
