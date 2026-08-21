import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { candidateService, requireAdmin, isValidId, sanitizeInput } from '$lib/api';
import { generateEntityId } from '$lib/shared/utils';

export const GET: RequestHandler = async ({ url }) => {
  const page = Number(url.searchParams.get('page')) || 1;
  const limit = Number(url.searchParams.get('limit')) || 50;
  const result = await candidateService.findAll(page, limit);
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
    const result = await candidateService.update(id, { ...body, updatedAt: now });
    return json(result);
  } else {
    const result = await candidateService.create({
      id: generateEntityId('cand'),
      fullName: sanitizeInput(String(body.fullName ?? '')),
      email: sanitizeInput(String(body.email ?? '')),
      phone: sanitizeInput(String(body.phone ?? '')),
      education: body.education ? String(body.education) : undefined,
      experienceYears: body.experienceYears ? Number(body.experienceYears) : undefined,
      notes: body.notes ? String(body.notes) : undefined,
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

  const result = await candidateService.softDelete(id);
  return json(result);
};
