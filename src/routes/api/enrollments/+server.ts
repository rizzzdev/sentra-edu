import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { enrollmentService, requireAdmin, isValidId } from '$lib/server';

export const GET: RequestHandler = async ({ url }) => {
  const page = Number(url.searchParams.get('page')) || 1;
  const limit = Number(url.searchParams.get('limit')) || 50;
  const result = await enrollmentService.findAll(page, limit);
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
    const result = await enrollmentService.update(id, { ...body, updatedAt: now });
    return json(result);
  } else {
    const result = await enrollmentService.create({
      studentId: String(body.studentId ?? ''),
      subjectId: String(body.subjectId ?? ''),
      classId: String(body.classId ?? ''),
      packageId: String(body.packageId ?? ''),
      tentorId: body.tentorId ? String(body.tentorId) : undefined,
      scheduleDay: body.scheduleDay ? String(body.scheduleDay) : undefined,
      scheduleTime: body.scheduleTime ? String(body.scheduleTime) : undefined,
      address: body.address ? String(body.address) : undefined,
      parentId: body.parentId ? String(body.parentId) : undefined,
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now
    });
    return json(result);
  }
};

export const PUT: RequestHandler = async ({ request, cookies }) => {
  const auth = requireAdmin(cookies);
  if (!auth.allowed) return auth.error!;

  const body = (await request.json()) as Record<string, any>;
  const now = new Date();

  const id = String(body.id ?? '');
  if (!id || !isValidId(id)) return json({ error: true, statusCode: 400, message: 'ID tidak valid.', data: null }, { status: 400 });

  const result = await enrollmentService.update(id, { ...body, updatedAt: now });
  return json(result);
};

export const DELETE: RequestHandler = async ({ url, cookies }) => {
  const auth = requireAdmin(cookies);
  if (!auth.allowed) return auth.error!;

  const id = url.searchParams.get('id');
  if (!id || !isValidId(id)) return json({ error: true, statusCode: 400, message: 'ID wajib.', data: null }, { status: 400 });

  const result = await enrollmentService.softDelete(id);
  return json(result);
};
