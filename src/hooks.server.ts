import type { Handle } from '@sveltejs/kit';
import { initDatabase } from '$lib/server/db';

let dbInitialized = false;

export const handle: Handle = async ({ event, resolve }) => {
  if (!dbInitialized) {
    try {
      await initDatabase();
      dbInitialized = true;
      console.log('[SentraEdu] Neon database initialized.');
    } catch (err: any) {
      console.error('[SentraEdu] DB init failed:', err.message);
    }
  }
  return resolve(event);
};
