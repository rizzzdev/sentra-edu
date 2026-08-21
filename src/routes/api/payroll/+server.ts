import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { payrollService, requireAdmin, isValidId } from '$lib/api';
import { generateEntityId } from '$lib/shared/utils';

export const GET: RequestHandler = async ({ url }) => {
  const page = Number(url.searchParams.get('page')) || 1;
  const limit = Number(url.searchParams.get('limit')) || 50;
  const result = await payrollService.findAll(page, limit);
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
    const result = await payrollService.update(id, { ...body, updatedAt: now });
    return json(result);
  } else {
    const result = await payrollService.create({
      id: generateEntityId('pay'),
      tentorId: String(body.tentorId ?? ''),
      periodStart: String(body.periodStart ?? ''),
      periodEnd: String(body.periodEnd ?? ''),
      totalAmount: Number(body.totalAmount) || 0,
      attendanceIds: Array.isArray(body.attendanceIds) ? body.attendanceIds : [],
      status: 'REQUESTED',
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

  const result = await payrollService.softDelete(id);
  return json(result);
};
