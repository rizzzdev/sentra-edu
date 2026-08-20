import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { sql } from '$lib/server/db';
import { getCached, setCache, invalidateCache } from '$lib/server/cache';
import { mapMagicLinkRow, generateEntityId } from '$lib/server/api-helpers';
import { requireAdmin, isValidId, sanitizeInput } from '$lib/server/security';

export const GET: RequestHandler = async ({ url, cookies }) => {
  try {
    const token = url.searchParams.get('token');
    if (token) {
      const sanitizedToken = sanitizeInput(token.trim());
      const rows = await sql`SELECT * FROM magic_links WHERE token = ${sanitizedToken} AND deleted_at IS NULL LIMIT 1`;
      if (rows.length === 0) {
        return json({ error: true, statusCode: 404, message: 'Magic link tidak ditemukan.', data: null }, { status: 404 });
      }
      const link = mapMagicLinkRow(rows[0]);
      if (!link.active) {
        return json({ error: true, statusCode: 410, message: 'Magic link telah dinonaktifkan oleh admin.', data: link }, { status: 410 });
      }
      if (link.expiresAt && new Date() > new Date(link.expiresAt)) {
        return json({ error: true, statusCode: 410, message: 'Magic link telah kadaluarsa.', data: link }, { status: 410 });
      }
      return json({ error: false, statusCode: 200, message: 'Magic link valid.', data: link });
    }

    // Listing all magic links requires admin privileges
    const auth = requireAdmin(cookies);
    if (!auth.allowed) {
      return auth.error || json({ error: true, statusCode: 401, message: 'Unauthorized', data: null }, { status: 401 });
    }

    const cached = getCached('magic-links');
    if (cached) return json({ error: false, statusCode: 200, data: cached });
    const rows = await sql`SELECT * FROM magic_links WHERE deleted_at IS NULL ORDER BY created_at DESC`;
    const list = rows.map(mapMagicLinkRow);
    setCache('magic-links', list);
    return json({ error: false, statusCode: 200, data: list });
  } catch (err_raw) {
    const err = err_raw as Error;
    return json({ error: true, statusCode: 500, message: err.message, data: null }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request, cookies }) => {
  try {
    const auth = requireAdmin(cookies);
    if (!auth.allowed) {
      return auth.error || json({ error: true, statusCode: 401, message: 'Unauthorized', data: null }, { status: 401 });
    }

    const body = (await request.json()) as Record<string, string | number | boolean | null | undefined>;
    const now = new Date().toISOString();
    const id = body.id ? String(body.id) : generateEntityId('ml');

    const existingRows = await sql`SELECT id FROM magic_links WHERE id = ${id} AND deleted_at IS NULL LIMIT 1`;
    if (existingRows.length > 0) {
      await sql`UPDATE magic_links SET
        active = ${body.active ?? true},
        used_count = ${Number(body.usedCount ?? body.used_count) || 0},
        title = ${sanitizeInput(String(body.title ?? ''))},
        days_valid = ${Number(body.daysValid ?? body.days_valid) || 7},
        expires_at = ${body.expiresAt ?? body.expires_at},
        target_role = ${body.targetRole ?? body.target_role ?? 'STUDENT'},
        class_id = ${body.classId ?? body.class_id ?? null},
        package_id = ${body.packageId ?? body.package_id ?? null},
        updated_at = ${now}
      WHERE id = ${id}`;

      const rows = await sql`SELECT * FROM magic_links WHERE id = ${id}`;
      invalidateCache();
      return json({ error: false, statusCode: 200, message: 'Magic link diperbarui.', data: rows[0] ? mapMagicLinkRow(rows[0]) : null });
    } else {
      await sql`INSERT INTO magic_links (id, token, title, days_valid, expires_at, used_count, active, target_role, class_id, package_id, created_by, created_at, updated_at)
        VALUES (${id}, ${body.token}, ${sanitizeInput(String(body.title ?? ''))}, ${Number(body.daysValid ?? body.days_valid) || 7}, ${body.expiresAt ?? body.expires_at}, ${Number(body.usedCount ?? body.used_count) || 0}, ${body.active ?? true}, ${body.targetRole ?? body.target_role ?? 'STUDENT'}, ${body.classId ?? body.class_id ?? null}, ${body.packageId ?? body.package_id ?? null}, ${body.createdBy ?? body.created_by ?? null}, ${now}, ${now})`;

      const rows = await sql`SELECT * FROM magic_links WHERE id = ${id}`;
      invalidateCache();
      return json({ error: false, statusCode: 201, message: 'Magic link dibuat.', data: rows[0] ? mapMagicLinkRow(rows[0]) : null });
    }
  } catch (err_raw) {
    const err = err_raw as Error;
    return json({ error: true, statusCode: 500, message: err.message, data: null }, { status: 500 });
  }
};

export const DELETE: RequestHandler = async ({ url, cookies }) => {
  try {
    const auth = requireAdmin(cookies);
    if (!auth.allowed) {
      return auth.error || json({ error: true, statusCode: 401, message: 'Unauthorized', data: null }, { status: 401 });
    }

    const id = url.searchParams.get('id');
    if (!id || !isValidId(id)) return json({ error: true, statusCode: 400, message: 'ID wajib dan harus valid.', data: null }, { status: 400 });
    const now = new Date().toISOString();
    await sql`UPDATE magic_links SET deleted_at = ${now}, updated_at = ${now} WHERE id = ${id}`;
    invalidateCache();
    return json({ error: false, statusCode: 200, message: 'Magic link dihapus.', data: null });
  } catch (err_raw) {
    const err = err_raw as Error;
    return json({ error: true, statusCode: 500, message: err.message, data: null }, { status: 500 });
  }
};
