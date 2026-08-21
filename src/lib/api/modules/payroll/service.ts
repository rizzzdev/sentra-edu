/**
 * Service layer for PayrollClaim
 * Business logic + Zod validation + cache + ApiResponse envelope.
 */

import { payrollRepository } from './repository';
import { getCached, setCache, invalidateCache } from '../../cache';
import { successResponse, errorResponse, calculatePagination } from '../../types';
import type { ApiResponse } from '../../types';
import { validateCreatePayrollClaim, validateUpdatePayrollClaim, getFieldErrors } from './domain';
import type { PayrollClaimEntity } from './domain';

const CACHE_KEY = 'payroll';

export const payrollService = {
  async findAll(page: number = 1, limit: number = 50): Promise<ApiResponse<PayrollClaimEntity[]>> {
    try {
      const allData = await payrollRepository.findAll();
      const totalData = allData.length;
      const start = (page - 1) * limit;
      const paginatedData = allData.slice(start, start + limit);
      return {
        error: false, statusCode: 200,
        message: 'PayrollClaim retrieved successfully.',
        data: paginatedData,
        pagination: calculatePagination(totalData, page, limit)
      };
    } catch {
      return errorResponse('Failed to retrieve PayrollClaim data.', 500);
    }
  },
  async findById(id: string): Promise<ApiResponse<PayrollClaimEntity>> {
    try {
      const item = await payrollRepository.findById(id);
      if (!item) return errorResponse('PayrollClaim not found.', 404);
      return successResponse(item, 'PayrollClaim retrieved successfully.');
    } catch {
      return errorResponse('Failed to retrieve PayrollClaim.', 500);
    }
  },
  async create(data: any): Promise<ApiResponse<PayrollClaimEntity>> {
    const parsed = validateCreatePayrollClaim(data);
    if (!parsed.success) {
      return { error: true, statusCode: 400, message: 'Validasi gagal.', data: null, fieldErrors: getFieldErrors(parsed.error) } as any;
    }
    try {
      const created = await payrollRepository.create(parsed.data);
      invalidateCache([CACHE_KEY]);
      return successResponse(created, 'PayrollClaim created successfully.', 201);
    } catch {
      return errorResponse('Failed to create PayrollClaim.', 500);
    }
  },
  async update(id: string, data: any): Promise<ApiResponse<PayrollClaimEntity>> {
    const parsed = validateUpdatePayrollClaim(data);
    if (!parsed.success) {
      return { error: true, statusCode: 400, message: 'Validasi gagal.', data: null, fieldErrors: getFieldErrors(parsed.error) } as any;
    }
    try {
      const existing = await payrollRepository.findById(id);
      if (!existing) return errorResponse('PayrollClaim not found.', 404);
      const updated = await payrollRepository.update(id, parsed.data);
      invalidateCache([CACHE_KEY]);
      return successResponse(updated, 'PayrollClaim updated successfully.');
    } catch {
      return errorResponse('Failed to update PayrollClaim.', 500);
    }
  },
  async softDelete(id: string): Promise<ApiResponse<{ id: string }>> {
    try {
      const existing = await payrollRepository.findById(id);
      if (!existing) return errorResponse('PayrollClaim not found.', 404);
      await payrollRepository.softDelete(id);
      invalidateCache([CACHE_KEY]);
      return successResponse({ id }, 'PayrollClaim deleted successfully.');
    } catch {
      return errorResponse('Failed to delete PayrollClaim.', 500);
    }
  }
};
