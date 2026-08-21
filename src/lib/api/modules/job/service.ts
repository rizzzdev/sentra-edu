/**
 * Service layer for Job
 * Business logic + Zod validation + cache + ApiResponse envelope.
 */

import { jobRepository } from './repository';
import { getCached, setCache, invalidateCache } from '../../cache';
import { successResponse, errorResponse, calculatePagination } from '../../types';
import type { ApiResponse } from '../../types';
import { validateCreateJob, validateUpdateJob, getFieldErrors } from './domain';
import type { JobEntity } from './domain';

const CACHE_KEY = 'jobs';

export const jobService = {
  async findAll(page: number = 1, limit: number = 50): Promise<ApiResponse<JobEntity[]>> {
    try {
      const allData = await jobRepository.findAll();
      const totalData = allData.length;
      const start = (page - 1) * limit;
      const paginatedData = allData.slice(start, start + limit);
      return {
        error: false, statusCode: 200,
        message: 'Job retrieved successfully.',
        data: paginatedData,
        pagination: calculatePagination(totalData, page, limit)
      };
    } catch {
      return errorResponse('Failed to retrieve Job data.', 500);
    }
  },
  async findById(id: string): Promise<ApiResponse<JobEntity>> {
    try {
      const item = await jobRepository.findById(id);
      if (!item) return errorResponse('Job not found.', 404);
      return successResponse(item, 'Job retrieved successfully.');
    } catch {
      return errorResponse('Failed to retrieve Job.', 500);
    }
  },
  async create(data: any): Promise<ApiResponse<JobEntity>> {
    const parsed = validateCreateJob(data);
    if (!parsed.success) {
      return { error: true, statusCode: 400, message: 'Validasi gagal.', data: null, fieldErrors: getFieldErrors(parsed.error) } as any;
    }
    try {
      const created = await jobRepository.create(parsed.data);
      invalidateCache([CACHE_KEY]);
      return successResponse(created, 'Job created successfully.', 201);
    } catch {
      return errorResponse('Failed to create Job.', 500);
    }
  },
  async update(id: string, data: any): Promise<ApiResponse<JobEntity>> {
    const parsed = validateUpdateJob(data);
    if (!parsed.success) {
      return { error: true, statusCode: 400, message: 'Validasi gagal.', data: null, fieldErrors: getFieldErrors(parsed.error) } as any;
    }
    try {
      const existing = await jobRepository.findById(id);
      if (!existing) return errorResponse('Job not found.', 404);
      const updated = await jobRepository.update(id, parsed.data);
      invalidateCache([CACHE_KEY]);
      return successResponse(updated, 'Job updated successfully.');
    } catch {
      return errorResponse('Failed to update Job.', 500);
    }
  },
  async softDelete(id: string): Promise<ApiResponse<{ id: string }>> {
    try {
      const existing = await jobRepository.findById(id);
      if (!existing) return errorResponse('Job not found.', 404);
      await jobRepository.softDelete(id);
      invalidateCache([CACHE_KEY]);
      return successResponse({ id }, 'Job deleted successfully.');
    } catch {
      return errorResponse('Failed to delete Job.', 500);
    }
  }
};
