import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { applicationService, requireAdmin, requireAdminOrTentor, jobService, isValidId } from '$lib/server';

export const GET: RequestHandler = async ({ url }) => {
  const page = Number(url.searchParams.get('page')) || 1;
  const limit = Number(url.searchParams.get('limit')) || 50;
  const result = await applicationService.findAll(page, limit);
  return json(result);
};

export const POST: RequestHandler = async ({ request, cookies }) => {
  const auth = requireAdminOrTentor(cookies);
  if (!auth.allowed) return auth.error!;

  const body = (await request.json()) as Record<string, any>;
  const now = new Date();

  if (body.id) {
    const id = String(body.id);
    if (!isValidId(id)) return json({ error: true, statusCode: 400, message: 'ID tidak valid.', data: null }, { status: 400 });
    const result = await applicationService.update(id, { ...body, updatedAt: now });
    return json(result);
  } else {
    const result = await applicationService.create({
      jobId: String(body.jobId ?? ''),
      tentorId: String(body.tentorId ?? ''),
      notes: body.notes ? String(body.notes) : undefined,
      status: 'PENDING',
      appliedAt: now.toISOString(),
      createdAt: now,
      updatedAt: now
    });

    // Update job status to NEGOTIATING when a new application is created
    if (!result.error && body.jobId) {
      await jobService.update(String(body.jobId), { status: 'NEGOTIATING', updatedAt: now });
    }

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

  const result = await applicationService.update(id, { ...body, updatedAt: now });
  return json(result);
};

export const DELETE: RequestHandler = async ({ url, cookies }) => {
  const auth = requireAdmin(cookies);
  if (!auth.allowed) return auth.error!;

  const id = url.searchParams.get('id');
  if (!id || !isValidId(id)) return json({ error: true, statusCode: 400, message: 'ID wajib.', data: null }, { status: 400 });

  const result = await applicationService.softDelete(id);
  return json(result);
};
