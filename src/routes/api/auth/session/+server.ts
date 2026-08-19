import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/** GET /api/auth/session — check current session */
export const GET: RequestHandler = async ({ cookies }) => {
  const sessionUser = cookies.get('session_user');
  if (!sessionUser) {
    return json({ error: true, statusCode: 401, message: 'Tidak ada sesi aktif.', data: null }, { status: 401 });
  }
  try {
    const user = JSON.parse(sessionUser);
    return json({ error: false, statusCode: 200, data: user });
  } catch {
    return json({ error: true, statusCode: 401, message: 'Sesi tidak valid.', data: null }, { status: 401 });
  }
};
