import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { magicLinkService, requireAdmin, isValidId, sanitizeInput } from '$lib/api';
import { generateEntityId } from '$lib/shared/utils';

export const GET: RequestHandler = async ({ url, cookies }) => {
  const token = url.searchParams.get('token');
  if (token) {
    const result = await magicLinkService.findByToken(sanitizeInput(token.trim()));
    return json(result);
  }

  const auth = requireAdmin(cookies);
  if (!auth.allowed) return auth.error!;

  const page = Number(url.searchParams.get('page')) || 1;
  const limit = Number(url.searchParams.get('limit')) || 50;
  const result = await magicLinkService.findAll(page, limit);
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
    const result = await magicLinkService.update(id, { ...body, updatedAt: now });
    return json(result);
  } else {
    const result = await magicLinkService.create({
      id: generateEntityId('ml'),
      token: body.token ? String(body.token) : generateEntityId('ml'),
      title: sanitizeInput(String(body.title ?? '')),
      daysValid: Number(body.daysValid) || 7,
      expiresAt: body.expiresAt ? new Date(String(body.expiresAt)) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      active: Boolean(body.active ?? true),
      targetRole: body.targetRole ? String(body.targetRole) : 'STUDENT',
      classId: body.classId ? String(body.classId) : undefined,
      packageId: body.packageId ? String(body.packageId) : undefined,
      createdBy: body.createdBy ? String(body.createdBy) : undefined,
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

  const result = await magicLinkService.softDelete(id);
  return json(result);
};
