import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { sql } from '$lib/server/db';
import { getCached, setCache, invalidateCache } from '$lib/server/cache';
import { mapPayrollRow, generateEntityId } from '$lib/server/api-helpers';
import { requireAdmin, isValidId, sanitizeInput } from '$lib/server/security';

export const GET: RequestHandler = async ({ cookies }) => {
  try {
    const auth = requireAdmin(cookies);
    if (!auth.allowed) {
      return auth.error || json({ error: true, statusCode: 401, message: 'Unauthorized', data: null }, { status: 401 });
    }

    const cached = getCached('payroll');
    if (cached) return json({ error: false, statusCode: 200, data: cached });
    const rows = await sql`SELECT * FROM payroll_claims WHERE deleted_at IS NULL ORDER BY created_at DESC`;
    const list = rows.map(mapPayrollRow);
    setCache('payroll', list);
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

    const body = (await request.json()) as Record<string, string | number | boolean | string[] | null | undefined>;
    const now = new Date().toISOString();

    if (body.id) {
      const claimId = String(body.id);
      if (!isValidId(claimId)) return json({ error: true, statusCode: 400, message: 'ID tidak valid.', data: null }, { status: 400 });

      await sql`UPDATE payroll_claims SET
        status=${body.status ?? 'REQUESTED'},
        paid_at=${body.paidAt},
        transfer_proof_url=${body.transferProofUrl},
        rejection_reason=${sanitizeInput(String(body.rejectionReason ?? ''))},
        updated_at=${now}
      WHERE id=${claimId}`;

      const rows = await sql`SELECT * FROM payroll_claims WHERE id=${claimId}`;
      invalidateCache();
      return json({ error: false, statusCode: 200, message: 'Klaim diperbarui.', data: rows[0] ? mapPayrollRow(rows[0]) : null });
    } else {
      const id = generateEntityId('pay');
      await sql`INSERT INTO payroll_claims (id,tentor_id,claim_number,period_start,period_end,period_month,period_year,total_amount,attendance_ids,status,created_at,updated_at)
        VALUES (${id},${body.tentorId},${body.claimNumber},${body.periodStart},${body.periodEnd},${Number(body.periodMonth) || 1},${Number(body.periodYear) || 2026},${Number(body.totalAmount) || 0},${body.attendanceIds ?? []},${body.status ?? 'REQUESTED'},${now},${now})`;

      const rows = await sql`SELECT * FROM payroll_claims WHERE id=${id}`;
      invalidateCache();
      return json({ error: false, statusCode: 201, message: 'Klaim dibuat.', data: rows[0] ? mapPayrollRow(rows[0]) : null });
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
    await sql`UPDATE payroll_claims SET deleted_at=${now},updated_at=${now} WHERE id=${id}`;
    invalidateCache();
    return json({ error: false, statusCode: 200, message: 'Klaim dihapus.', data: null });
  } catch (err_raw) {
    const err = err_raw as Error;
    return json({ error: true, statusCode: 500, message: err.message, data: null }, { status: 500 });
  }
};
