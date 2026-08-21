/**
 * Service layer for ClassLevel
 * Business logic + Zod validation + cache + ApiResponse envelope.
 */

import { classRepository } from './repository';
import { getCached, setCache, invalidateCache } from '../../cache';
import { successResponse, errorResponse, calculatePagination } from '../../types';
import type { ApiResponse } from '../../types';
import { validateCreateClassLevel, validateUpdateClassLevel, getFieldErrors } from './domain';
import type { ClassLevelEntity } from './domain';

const CACHE_KEY = 'classes';

export const classService = {
  async findAll(page: number = 1, limit: number = 50): Promise<ApiResponse<ClassLevelEntity[]>> {
    try {
      const allData = await classRepository.findAll();
      const totalData = allData.length;
      const start = (page - 1) * limit;
      const paginatedData = allData.slice(start, start + limit);
      return {
        error: false, statusCode: 200,
        message: 'ClassLevel retrieved successfully.',
        data: paginatedData,
        pagination: calculatePagination(totalData, page, limit)
      };
    } catch {
      return errorResponse('Failed to retrieve ClassLevel data.', 500);
    }
  },
  async findById(id: string): Promise<ApiResponse<ClassLevelEntity>> {
    try {
      const item = await classRepository.findById(id);
      if (!item) return errorResponse('ClassLevel not found.', 404);
      return successResponse(item, 'ClassLevel retrieved successfully.');
    } catch {
      return errorResponse('Failed to retrieve ClassLevel.', 500);
    }
  },
  async create(data: any): Promise<ApiResponse<ClassLevelEntity>> {
    const parsed = validateCreateClassLevel(data);
    if (!parsed.success) {
      return { error: true, statusCode: 400, message: 'Validasi gagal.', data: null, fieldErrors: getFieldErrors(parsed.error) } as any;
    }
    try {
      const created = await classRepository.create(parsed.data);
      invalidateCache([CACHE_KEY]);
      return successResponse(created, 'ClassLevel created successfully.', 201);
    } catch {
      return errorResponse('Failed to create ClassLevel.', 500);
    }
  },
  async update(id: string, data: any): Promise<ApiResponse<ClassLevelEntity>> {
    const parsed = validateUpdateClassLevel(data);
    if (!parsed.success) {
      return { error: true, statusCode: 400, message: 'Validasi gagal.', data: null, fieldErrors: getFieldErrors(parsed.error) } as any;
    }
    try {
      const existing = await classRepository.findById(id);
      if (!existing) return errorResponse('ClassLevel not found.', 404);
      const updated = await classRepository.update(id, parsed.data);
      invalidateCache([CACHE_KEY]);
      return successResponse(updated, 'ClassLevel updated successfully.');
    } catch {
      return errorResponse('Failed to update ClassLevel.', 500);
    }
  },
  async softDelete(id: string): Promise<ApiResponse<{ id: string }>> {
    try {
      const existing = await classRepository.findById(id);
      if (!existing) return errorResponse('ClassLevel not found.', 404);
      await classRepository.softDelete(id);
      invalidateCache([CACHE_KEY]);
      return successResponse({ id }, 'ClassLevel deleted successfully.');
    } catch {
      return errorResponse('Failed to delete ClassLevel.', 500);
    }
  }
};
