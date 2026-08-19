import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { sql } from '$lib/server/db';
import { mapInvoiceRow, generateEntityId } from '$lib/server/api-helpers';

export const GET: RequestHandler = async () => {
  try {
    const rows = await sql`SELECT * FROM invoices WHERE deleted_at IS NULL ORDER BY created_at DESC`;
    return json({ error: false, statusCode: 200, data: rows.map(mapInvoiceRow) });
  } catch (err_raw) { const err = err_raw as Error;
    return json({ error: true, statusCode: 500, message: err.message, data: null }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();
    const now = new Date().toISOString();
    if (body.id) {
      await sql`UPDATE invoices SET status=${body.status},paid_at=${body.paidAt},payment_proof_url=${body.paymentProofUrl},updated_at=${now} WHERE id=${body.id}`;
      const rows = await sql`SELECT * FROM invoices WHERE id=${body.id}`;
      return json({ error: false, statusCode: 200, message: 'Invoice diperbarui.', data: rows[0] ? mapInvoiceRow(rows[0]) : null });
    } else {
      const id = generateEntityId('inv');
      await sql`INSERT INTO invoices (id,enrollment_id,invoice_number,amount,due_date,status,period_month,period_year,notes,created_at,updated_at) VALUES (${id},${body.enrollmentId},${body.invoiceNumber},${body.amount},${body.dueDate},${body.status??'UNPAID'},${body.periodMonth},${body.periodYear},${body.notes??''},${now},${now})`;
      const rows = await sql`SELECT * FROM invoices WHERE id=${id}`;
      return json({ error: false, statusCode: 201, message: 'Invoice dibuat.', data: rows[0] ? mapInvoiceRow(rows[0]) : null });
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
    await sql`UPDATE invoices SET deleted_at=${now},updated_at=${now} WHERE id=${id}`;
    return json({ error: false, statusCode: 200, message: 'Invoice dihapus.', data: null });
  } catch (err_raw) { const err = err_raw as Error;
    return json({ error: true, statusCode: 500, message: err.message, data: null }, { status: 500 });
  }
};
