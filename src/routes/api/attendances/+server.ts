import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { attendanceService, requireAdmin, isValidId } from '$lib/api';
import { generateEntityId } from '$lib/shared/utils';

export const GET: RequestHandler = async ({ url }) => {
  const page = Number(url.searchParams.get('page')) || 1;
  const limit = Number(url.searchParams.get('limit')) || 50;
  const result = await attendanceService.findAll(page, limit);
  return json(result);
};

export const POST: RequestHandler = async ({ request, cookies }) => {
  const auth = requireAdmin(cookies);
  if (!auth.allowed) return auth.error!;

  const body = (await request.json()) as Record<string, any>;
  const now = new Date();

  if (body.id) {
    const id = String(body.id);
    if (!isValidId(id)) return json({ error: true, statusCode: 400, message: 'ID tidak valid.', data: null }, { status: 400 });
    const result = await attendanceService.update(id, { ...body, updatedAt: now });
    return json(result);
  } else {
    const result = await attendanceService.create({
      id: generateEntityId('att'),
      jobId: body.jobId ? String(body.jobId) : undefined,
      enrollmentId: body.enrollmentId ? String(body.enrollmentId) : undefined,
      tentorId: String(body.tentorId ?? ''),
      sessionDate: String(body.sessionDate ?? ''),
      startTime: String(body.startTime ?? ''),
      endTime: String(body.endTime ?? ''),
      topic: String(body.topic ?? ''),
      studentNotes: body.studentNotes ? String(body.studentNotes) : undefined,
      latitudeCheckIn: body.latitudeCheckIn ? Number(body.latitudeCheckIn) : undefined,
      longitudeCheckIn: body.longitudeCheckIn ? Number(body.longitudeCheckIn) : undefined,
      isRadiusValid: body.isRadiusValid !== undefined ? Boolean(body.isRadiusValid) : undefined,
      status: 'SUBMITTED',
      createdAt: now,
      updatedAt: now
    });
    return json(result);
  }
};

export const DELETE: RequestHandler = async ({ url, cookies }) => {
  const auth = requireAdmin(cookies);
  if (!auth.allowed) return auth.error!;

  const id = url.searchParams.get('id');
  if (!id || !isValidId(id)) return json({ error: true, statusCode: 400, message: 'ID wajib.', data: null }, { status: 400 });

  const result = await attendanceService.softDelete(id);
  return json(result);
};
