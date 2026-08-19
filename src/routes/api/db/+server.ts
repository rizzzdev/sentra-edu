import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { loadFullDatabase } from '$lib/server/api-helpers';

/** GET /api/db — load full database from Neon (passwords stripped) */
export const GET: RequestHandler = async () => {
  try {
    const db = await loadFullDatabase();
    // Strip passwords from users
    db.users = db.users.map((u: any) => ({ ...u, password: undefined }));
    return json({ error: false, statusCode: 200, data: db });
  } catch (err: any) {
    console.error('[API] /api/db error:', err.message);
    return json({ error: true, statusCode: 500, message: 'Terjadi kesalahan server.', data: null }, { status: 500 });
  }
};
