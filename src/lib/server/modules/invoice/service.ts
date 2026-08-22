/**
 * Service layer for Invoice
 * Business logic + Zod validation + cache + ApiResponse envelope.
 */

import { invoiceRepository } from './repository';
import { getCached, setCache, invalidateCache } from '../../cache';
import { successResponse, errorResponse, calculatePagination } from '$lib/api/types';
import type { ApiResponse } from '$lib/api/types';
import { validateCreateInvoice, validateUpdateInvoice, getFieldErrors } from '$lib/api/modules/invoice/domain';
import type { InvoiceEntity } from '$lib/api/modules/invoice/domain';

const CACHE_KEY = 'invoices';

export const invoiceService = {
  async findAll(page: number = 1, limit: number = 50): Promise<ApiResponse<InvoiceEntity[]>> {
    try {
      const allData = await invoiceRepository.findAll();
      const totalData = allData.length;
      const start = (page - 1) * limit;
      const paginatedData = allData.slice(start, start + limit);
      return {
        error: false, statusCode: 200,
        message: 'Invoice retrieved successfully.',
        data: paginatedData,
        pagination: calculatePagination(totalData, page, limit)
      };
    } catch (err) {
      console.error(`[invoiceService] Error:`, err);
      return errorResponse('Failed to retrieve Invoice data.', 500);
    }
  },
  async findById(id: string): Promise<ApiResponse<InvoiceEntity>> {
    try {
      const item = await invoiceRepository.findById(id);
      if (!item) return errorResponse('Invoice not found.', 404);
      return successResponse(item, 'Invoice retrieved successfully.');
    } catch (err) {
      console.error(`[invoiceService] Error:`, err);
      return errorResponse('Failed to retrieve Invoice.', 500);
    }
  },
  async create(data: any): Promise<ApiResponse<InvoiceEntity>> {
    const parsed = validateCreateInvoice(data);
    if (!parsed.success) {
      return { error: true, statusCode: 400, message: 'Validasi gagal: ' + Object.entries(getFieldErrors(parsed.error)).map(([k, v]) => `${k}: ${v}`).join(', '), data: null, fieldErrors: getFieldErrors(parsed.error) } as any;
    }
    try {
      const created = await invoiceRepository.create(parsed.data);
      invalidateCache([CACHE_KEY]);
      return successResponse(created, 'Invoice created successfully.', 201);
    } catch (err) {
      console.error(`[invoiceService] Error:`, err);
      return errorResponse('Failed to create Invoice.', 500);
    }
  },
  async update(id: string, data: any): Promise<ApiResponse<InvoiceEntity>> {
    const parsed = validateUpdateInvoice(data);
    if (!parsed.success) {
      return { error: true, statusCode: 400, message: 'Validasi gagal: ' + Object.entries(getFieldErrors(parsed.error)).map(([k, v]) => `${k}: ${v}`).join(', '), data: null, fieldErrors: getFieldErrors(parsed.error) } as any;
    }
    try {
      const existing = await invoiceRepository.findById(id);
      if (!existing) return errorResponse('Invoice not found.', 404);
      const updated = await invoiceRepository.update(id, parsed.data);
      invalidateCache([CACHE_KEY]);
      return successResponse(updated, 'Invoice updated successfully.');
    } catch (err) {
      console.error(`[invoiceService] Error:`, err);
      return errorResponse('Failed to update Invoice.', 500);
    }
  },
  async softDelete(id: string): Promise<ApiResponse<{ id: string }>> {
    try {
      const existing = await invoiceRepository.findById(id);
      if (!existing) return errorResponse('Invoice not found.', 404);
      await invoiceRepository.softDelete(id);
      invalidateCache([CACHE_KEY]);
      return successResponse({ id }, 'Invoice deleted successfully.');
    } catch (err) {
      console.error(`[invoiceService] Error:`, err);
      return errorResponse('Failed to delete Invoice.', 500);
    }
  }
};
