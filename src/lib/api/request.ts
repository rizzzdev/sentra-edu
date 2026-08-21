/**
 * Shared fetch wrapper for all client-side stores.
 * Handles credentials, JSON parsing, and error envelope.
 */

export async function apiRequest<T = any>(
  path: string,
  options?: RequestInit
): Promise<{ error: boolean; statusCode: number; message: string; data: T | null; pagination?: any }> {
  try {
    const res = await fetch(path, {
      ...options,
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...options?.headers }
    });
    return await res.json();
  } catch (err) {
    const e = err as Error;
    return { error: true, statusCode: 500, message: e.message, data: null };
  }
}
