/**
 * Service layer for Subject
 * Business logic + Zod validation + cache + ApiResponse envelope.
 */

import { subjectRepository } from './repository';
import { getCached, setCache, invalidateCache } from '../../cache';
import { successResponse, errorResponse, calculatePagination } from '../../types';
import type { ApiResponse } from '../../types';
import { validateCreateSubject, validateUpdateSubject, getFieldErrors } from './domain';
import type { SubjectEntity } from './domain';

const CACHE_KEY = 'subjects';

export const subjectService = {
  async findAll(page: number = 1, limit: number = 50): Promise<ApiResponse<SubjectEntity[]>> {
    try {
      const allData = await subjectRepository.findAll();
      const totalData = allData.length;
      const start = (page - 1) * limit;
      const paginatedData = allData.slice(start, start + limit);
      return {
        error: false, statusCode: 200,
        message: 'Subject retrieved successfully.',
        data: paginatedData,
        pagination: calculatePagination(totalData, page, limit)
      };
    } catch {
      return errorResponse('Failed to retrieve Subject data.', 500);
    }
  },
  async findById(id: string): Promise<ApiResponse<SubjectEntity>> {
    try {
      const item = await subjectRepository.findById(id);
      if (!item) return errorResponse('Subject not found.', 404);
      return successResponse(item, 'Subject retrieved successfully.');
    } catch {
      return errorResponse('Failed to retrieve Subject.', 500);
    }
  },
  async create(data: any): Promise<ApiResponse<SubjectEntity>> {
    const parsed = validateCreateSubject(data);
    if (!parsed.success) {
      return { error: true, statusCode: 400, message: 'Validasi gagal.', data: null, fieldErrors: getFieldErrors(parsed.error) } as any;
    }
    try {
      const created = await subjectRepository.create(parsed.data);
      invalidateCache([CACHE_KEY]);
      return successResponse(created, 'Subject created successfully.', 201);
    } catch {
      return errorResponse('Failed to create Subject.', 500);
    }
  },
  async update(id: string, data: any): Promise<ApiResponse<SubjectEntity>> {
    const parsed = validateUpdateSubject(data);
    if (!parsed.success) {
      return { error: true, statusCode: 400, message: 'Validasi gagal.', data: null, fieldErrors: getFieldErrors(parsed.error) } as any;
    }
    try {
      const existing = await subjectRepository.findById(id);
      if (!existing) return errorResponse('Subject not found.', 404);
      const updated = await subjectRepository.update(id, parsed.data);
      invalidateCache([CACHE_KEY]);
      return successResponse(updated, 'Subject updated successfully.');
    } catch {
      return errorResponse('Failed to update Subject.', 500);
    }
  },
  async softDelete(id: string): Promise<ApiResponse<{ id: string }>> {
    try {
      const existing = await subjectRepository.findById(id);
      if (!existing) return errorResponse('Subject not found.', 404);
      await subjectRepository.softDelete(id);
      invalidateCache([CACHE_KEY]);
      return successResponse({ id }, 'Subject deleted successfully.');
    } catch {
      return errorResponse('Failed to delete Subject.', 500);
    }
  }
};
