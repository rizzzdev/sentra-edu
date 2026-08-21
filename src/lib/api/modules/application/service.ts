/**
 * Service layer for JobApplication
 * Business logic + Zod validation + cache + ApiResponse envelope.
 */

import { applicationRepository } from './repository';
import { getCached, setCache, invalidateCache } from '../../cache';
import { successResponse, errorResponse, calculatePagination } from '../../types';
import type { ApiResponse } from '../../types';
import { validateCreateJobApplication, validateUpdateJobApplication, getFieldErrors } from './domain';
import type { JobApplicationEntity } from './domain';

const CACHE_KEY = 'applications';

export const applicationService = {
  async findAll(page: number = 1, limit: number = 50): Promise<ApiResponse<JobApplicationEntity[]>> {
    try {
      const allData = await applicationRepository.findAll();
      const totalData = allData.length;
      const start = (page - 1) * limit;
      const paginatedData = allData.slice(start, start + limit);
      return {
        error: false, statusCode: 200,
        message: 'JobApplication retrieved successfully.',
        data: paginatedData,
        pagination: calculatePagination(totalData, page, limit)
      };
    } catch {
      return errorResponse('Failed to retrieve JobApplication data.', 500);
    }
  },
  async findById(id: string): Promise<ApiResponse<JobApplicationEntity>> {
    try {
      const item = await applicationRepository.findById(id);
      if (!item) return errorResponse('JobApplication not found.', 404);
      return successResponse(item, 'JobApplication retrieved successfully.');
    } catch {
      return errorResponse('Failed to retrieve JobApplication.', 500);
    }
  },
  async create(data: any): Promise<ApiResponse<JobApplicationEntity>> {
    const parsed = validateCreateJobApplication(data);
    if (!parsed.success) {
      return { error: true, statusCode: 400, message: 'Validasi gagal.', data: null, fieldErrors: getFieldErrors(parsed.error) } as any;
    }
    try {
      const created = await applicationRepository.create(parsed.data);
      invalidateCache([CACHE_KEY]);
      return successResponse(created, 'JobApplication created successfully.', 201);
    } catch {
      return errorResponse('Failed to create JobApplication.', 500);
    }
  },
  async update(id: string, data: any): Promise<ApiResponse<JobApplicationEntity>> {
    const parsed = validateUpdateJobApplication(data);
    if (!parsed.success) {
      return { error: true, statusCode: 400, message: 'Validasi gagal.', data: null, fieldErrors: getFieldErrors(parsed.error) } as any;
    }
    try {
      const existing = await applicationRepository.findById(id);
      if (!existing) return errorResponse('JobApplication not found.', 404);
      const updated = await applicationRepository.update(id, parsed.data);
      invalidateCache([CACHE_KEY]);
      return successResponse(updated, 'JobApplication updated successfully.');
    } catch {
      return errorResponse('Failed to update JobApplication.', 500);
    }
  },
  async softDelete(id: string): Promise<ApiResponse<{ id: string }>> {
    try {
      const existing = await applicationRepository.findById(id);
      if (!existing) return errorResponse('JobApplication not found.', 404);
      await applicationRepository.softDelete(id);
      invalidateCache([CACHE_KEY]);
      return successResponse({ id }, 'JobApplication deleted successfully.');
    } catch {
      return errorResponse('Failed to delete JobApplication.', 500);
    }
  }
};
