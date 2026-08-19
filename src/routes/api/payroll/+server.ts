import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { sql } from '$lib/server/db';
import { mapPayrollRow, generateEntityId } from '$lib/server/api-helpers';

export const GET: RequestHandler = async () => {
  try {
    const rows = await sql`SELECT * FROM payroll_claims WHERE deleted_at IS NULL ORDER BY created_at DESC`;
    return json({ error: false, statusCode: 200, data: rows.map(mapPayrollRow) });
  } catch (err_raw) { const err = err_raw as Error;
    return json({ error: true, statusCode: 500, message: err.message, data: null }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();
    const now = new Date().toISOString();
    if (body.id) {
      await sql`UPDATE payroll_claims SET status=${body.status},paid_at=${body.paidAt},transfer_proof_url=${body.transferProofUrl},rejection_reason=${body.rejectionReason},updated_at=${now} WHERE id=${body.id}`;
      const rows = await sql`SELECT * FROM payroll_claims WHERE id=${body.id}`;
      return json({ error: false, statusCode: 200, message: 'Klaim diperbarui.', data: rows[0] ? mapPayrollRow(rows[0]) : null });
    } else {
      const id = generateEntityId('pay');
      await sql`INSERT INTO payroll_claims (id,tentor_id,claim_number,period_start,period_end,period_month,period_year,total_amount,attendance_ids,status,created_at,updated_at) VALUES (${id},${body.tentorId},${body.claimNumber},${body.periodStart},${body.periodEnd},${body.periodMonth},${body.periodYear},${body.totalAmount},${body.attendanceIds??[]},${body.status??'REQUESTED'},${now},${now})`;
      const rows = await sql`SELECT * FROM payroll_claims WHERE id=${id}`;
      return json({ error: false, statusCode: 201, message: 'Klaim dibuat.', data: rows[0] ? mapPayrollRow(rows[0]) : null });
    }
  } catch (err_raw) { const err = err_raw as Error;
    return json({ error: true, statusCode: 500, message: err.message, data: null }, { status: 500 });
  }
};

export const DELETE: RequestHandler = async ({ url }) => {
  try {
    const id = url.searchParams.get('id');
    if (!id) return json({ error: true, statusCode: 400, message: 'ID wajib.', data: null }, { status: 400 });
    const now = new Date().toISOString();
    await sql`UPDATE payroll_claims SET deleted_at=${now},updated_at=${now} WHERE id=${id}`;
    return json({ error: false, statusCode: 200, message: 'Klaim dihapus.', data: null });
  } catch (err_raw) { const err = err_raw as Error;
    return json({ error: true, statusCode: 500, message: err.message, data: null }, { status: 500 });
  }
};
