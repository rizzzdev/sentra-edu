import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/** POST /api/auth/logout — clear session cookies */
export const POST: RequestHandler = async ({ cookies }) => {
  cookies.delete('session', { path: '/' });
  cookies.delete('session_user', { path: '/' });
  return json({ error: false, statusCode: 200, message: 'Logout berhasil.', data: null });
};
