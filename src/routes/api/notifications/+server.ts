import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { notificationService, getSessionUser, isValidId, sanitizeInput } from '$lib/server';

export const GET: RequestHandler = async ({ url, cookies }) => {
  const userId = url.searchParams.get('userId');
  const sessionUser = getSessionUser(cookies);

  if (userId && isValidId(userId)) {
    const result = await notificationService.findByUser(userId);
    return json(result);
  }

  if (sessionUser && sessionUser.role !== 'SUPER_ADMIN') {
    const result = await notificationService.findByUser(sessionUser.id);
    return json(result);
  }

  const page = Number(url.searchParams.get('page')) || 1;
  const limit = Number(url.searchParams.get('limit')) || 50;
  const result = await notificationService.findAll(page, limit);
  return json(result);
};

export const POST: RequestHandler = async ({ request }) => {
  const body = (await request.json()) as Record<string, any>;
  const now = new Date();

  const result = await notificationService.create({
    userId: String(body.userId ?? ''),
    title: sanitizeInput(String(body.title ?? '')),
    message: sanitizeInput(String(body.message ?? '')),
    icon: sanitizeInput(String(body.icon ?? 'notifications')),
    read: false,
    createdAt: now
  });

  return json(result);
};

export const PUT: RequestHandler = async ({ request }) => {
  const body = (await request.json()) as Record<string, any>;

  if (body.markAll && body.userId) {
    const result = await notificationService.markAllAsRead(String(body.userId));
    return json(result);
  }

  if (body.id) {
    const result = await notificationService.markAsRead(String(body.id));
    return json(result);
  }

  return json({ error: true, statusCode: 400, message: 'ID atau userId wajib.', data: null }, { status: 400 });
};
