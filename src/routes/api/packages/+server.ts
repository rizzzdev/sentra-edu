import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { packageService, requireAdmin, isValidId } from '$lib/api';
import { generateEntityId } from '$lib/shared/utils';

export const GET: RequestHandler = async ({ url }) => {
  const page = Number(url.searchParams.get('page')) || 1;
  const limit = Number(url.searchParams.get('limit')) || 50;
  const result = await packageService.findAll(page, limit);
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
    const result = await packageService.update(id, { ...body, updatedAt: now });
    return json(result);
  } else {
    const result = await packageService.create({
      id: generateEntityId('pkg'),
      name: String(body.name ?? ''),
      mode: String(body.mode ?? 'PRIVATE'),
      period: String(body.period ?? 'BULANAN'),
      price: Number(body.price) || 0,
      sessionsPerPeriod: Number(body.sessionsPerPeriod) || 1,
      maxStudents: Number(body.maxStudents) || 1,
      tentorFee: Number(body.tentorFee) || 0,
      description: String(body.description ?? ''),
      active: Boolean(body.active ?? true),
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

  const result = await packageService.softDelete(id);
  return json(result);
};
