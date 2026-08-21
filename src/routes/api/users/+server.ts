import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { userService, requireAdmin, isValidId, sanitizeInput, isValidEmail } from '$lib/api';
import { generateEntityId } from '$lib/shared/utils';

export const GET: RequestHandler = async ({ url }) => {
  const page = Number(url.searchParams.get('page')) || 1;
  const limit = Number(url.searchParams.get('limit')) || 50;
  const result = await userService.findAll(page, limit);
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
    const result = await userService.update(id, {
      fullName: sanitizeInput(String(body.fullName ?? '')),
      email: sanitizeInput(String(body.email ?? '')),
      phone: sanitizeInput(String(body.phone ?? '')),
      role: body.role ? String(body.role) : undefined,
      isActive: body.isActive !== undefined ? Boolean(body.isActive) : undefined,
      updatedAt: now
    });
    return json(result);
  } else {
    const email = sanitizeInput(String(body.email ?? ''));
    if (!email || !isValidEmail(email)) {
      return json({ error: true, statusCode: 400, message: 'Email tidak valid.', data: null }, { status: 400 });
    }
    const result = await userService.create({
      email,
      password: String(body.password || 'password123'),
      fullName: sanitizeInput(String(body.fullName ?? '')),
      phone: sanitizeInput(String(body.phone ?? '')),
      role: body.role ? String(body.role) : 'STUDENT',
      isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
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

  const result = await userService.softDelete(id);
  return json(result);
};
