import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { invoiceService, requireAdmin, isValidId } from '$lib/api';
import { generateEntityId } from '$lib/shared/utils';

export const GET: RequestHandler = async ({ url }) => {
  const page = Number(url.searchParams.get('page')) || 1;
  const limit = Number(url.searchParams.get('limit')) || 50;
  const result = await invoiceService.findAll(page, limit);
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
    const result = await invoiceService.update(id, { ...body, updatedAt: now });
    return json(result);
  } else {
    const result = await invoiceService.create({
      id: generateEntityId('inv'),
      enrollmentId: String(body.enrollmentId ?? ''),
      amount: Number(body.amount) || 0,
      dueDate: String(body.dueDate ?? ''),
      periodMonth: Number(body.periodMonth) || 0,
      periodYear: Number(body.periodYear) || 0,
      notes: body.notes ? String(body.notes) : undefined,
      status: 'UNPAID',
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

  const result = await invoiceService.softDelete(id);
  return json(result);
};
