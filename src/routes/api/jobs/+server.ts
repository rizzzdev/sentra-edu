import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { jobService, requireAdmin, isValidId } from '$lib/api';
import { generateEntityId } from '$lib/shared/utils';

export const GET: RequestHandler = async ({ url }) => {
  const page = Number(url.searchParams.get('page')) || 1;
  const limit = Number(url.searchParams.get('limit')) || 50;
  const result = await jobService.findAll(page, limit);
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
    const result = await jobService.update(id, { ...body, updatedAt: now });
    return json(result);
  } else {
    const result = await jobService.create({
      id: generateEntityId('job'),
      title: String(body.title ?? ''),
      classId: body.classId ? String(body.classId) : undefined,
      subjectId: body.subjectId ? String(body.subjectId) : undefined,
      packageId: body.packageId ? String(body.packageId) : undefined,
      jobMode: body.jobMode ? String(body.jobMode) : undefined,
      tentorFee: body.tentorFee ? Number(body.tentorFee) : undefined,
      transportAllowance: body.transportAllowance ? Number(body.transportAllowance) : undefined,
      scheduleTime: body.scheduleTime ? String(body.scheduleTime) : undefined,
      location: body.location ? String(body.location) : undefined,
      notes: body.notes ? String(body.notes) : undefined,
      status: 'AVAILABLE',
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

  const result = await jobService.softDelete(id);
  return json(result);
};
