import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { sql } from '$lib/server/db';
import { getCached, setCache, invalidateCache } from '$lib/server/cache';
import { mapInvoiceRow, generateEntityId } from '$lib/server/api-helpers';
import { requireAdmin, isValidId, sanitizeInput } from '$lib/server/security';

export const GET: RequestHandler = async () => {
  try {
    const cached = getCached('invoices');
    if (cached) return json({ error: false, statusCode: 200, data: cached });
    const rows = await sql`SELECT * FROM invoices WHERE deleted_at IS NULL ORDER BY created_at DESC`;
    const list = rows.map(mapInvoiceRow);
    setCache('invoices', list);
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

    if (body.id) {
      const invId = String(body.id);
      if (!isValidId(invId)) return json({ error: true, statusCode: 400, message: 'ID tidak valid.', data: null }, { status: 400 });

      await sql`UPDATE invoices SET
        status=${body.status ?? 'UNPAID'},
        paid_at=${body.paidAt},
        payment_proof_url=${body.paymentProofUrl},
        updated_at=${now}
      WHERE id=${invId}`;

      const rows = await sql`SELECT * FROM invoices WHERE id=${invId}`;
      invalidateCache();
      return json({ error: false, statusCode: 200, message: 'Invoice diperbarui.', data: rows[0] ? mapInvoiceRow(rows[0]) : null });
    } else {
      const id = generateEntityId('inv');
      await sql`INSERT INTO invoices (id,enrollment_id,invoice_number,amount,due_date,status,period_month,period_year,notes,created_at,updated_at)
        VALUES (${id},${body.enrollmentId},${body.invoiceNumber},${Number(body.amount) || 0},${body.dueDate},${body.status ?? 'UNPAID'},${Number(body.periodMonth) || 1},${Number(body.periodYear) || 2026},${sanitizeInput(String(body.notes ?? ''))},${now},${now})`;

      const rows = await sql`SELECT * FROM invoices WHERE id=${id}`;
      invalidateCache();
      return json({ error: false, statusCode: 201, message: 'Invoice dibuat.', data: rows[0] ? mapInvoiceRow(rows[0]) : null });
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
    await sql`UPDATE invoices SET deleted_at=${now},updated_at=${now} WHERE id=${id}`;
    invalidateCache();
    return json({ error: false, statusCode: 200, message: 'Invoice dihapus.', data: null });
  } catch (err_raw) {
    const err = err_raw as Error;
    return json({ error: true, statusCode: 500, message: err.message, data: null }, { status: 500 });
  }
};
