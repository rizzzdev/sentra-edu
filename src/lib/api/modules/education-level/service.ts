/**
 * Service layer for EducationLevel
 * Business logic + Zod validation + cache + ApiResponse envelope.
 */

import { educationLevelRepository } from './repository';
import { getCached, setCache, invalidateCache } from '../../cache';
import { successResponse, errorResponse, calculatePagination } from '../../types';
import type { ApiResponse } from '../../types';
import { validateCreateEducationLevel, validateUpdateEducationLevel, getFieldErrors } from './domain';
import type { EducationLevelEntity } from './domain';

const CACHE_KEY = 'education-levels';

export const educationLevelService = {
  async findAll(page: number = 1, limit: number = 50): Promise<ApiResponse<EducationLevelEntity[]>> {
    try {
      const allData = await educationLevelRepository.findAll();
      const totalData = allData.length;
      const start = (page - 1) * limit;
      const paginatedData = allData.slice(start, start + limit);
      return {
        error: false, statusCode: 200,
        message: 'EducationLevel retrieved successfully.',
        data: paginatedData,
        pagination: calculatePagination(totalData, page, limit)
      };
    } catch {
      return errorResponse('Failed to retrieve EducationLevel data.', 500);
    }
  },
  async findById(id: string): Promise<ApiResponse<EducationLevelEntity>> {
    try {
      const item = await educationLevelRepository.findById(id);
      if (!item) return errorResponse('EducationLevel not found.', 404);
      return successResponse(item, 'EducationLevel retrieved successfully.');
    } catch {
      return errorResponse('Failed to retrieve EducationLevel.', 500);
    }
  },
  async create(data: any): Promise<ApiResponse<EducationLevelEntity>> {
    const parsed = validateCreateEducationLevel(data);
    if (!parsed.success) {
      return { error: true, statusCode: 400, message: 'Validasi gagal.', data: null, fieldErrors: getFieldErrors(parsed.error) } as any;
    }
    try {
      const created = await educationLevelRepository.create(parsed.data);
      invalidateCache([CACHE_KEY]);
      return successResponse(created, 'EducationLevel created successfully.', 201);
    } catch {
      return errorResponse('Failed to create EducationLevel.', 500);
    }
  },
  async update(id: string, data: any): Promise<ApiResponse<EducationLevelEntity>> {
    const parsed = validateUpdateEducationLevel(data);
    if (!parsed.success) {
      return { error: true, statusCode: 400, message: 'Validasi gagal.', data: null, fieldErrors: getFieldErrors(parsed.error) } as any;
    }
    try {
      const existing = await educationLevelRepository.findById(id);
      if (!existing) return errorResponse('EducationLevel not found.', 404);
      const updated = await educationLevelRepository.update(id, parsed.data);
      invalidateCache([CACHE_KEY]);
      return successResponse(updated, 'EducationLevel updated successfully.');
    } catch {
      return errorResponse('Failed to update EducationLevel.', 500);
    }
  },
  async softDelete(id: string): Promise<ApiResponse<{ id: string }>> {
    try {
      const existing = await educationLevelRepository.findById(id);
      if (!existing) return errorResponse('EducationLevel not found.', 404);
      await educationLevelRepository.softDelete(id);
      invalidateCache([CACHE_KEY]);
      return successResponse({ id }, 'EducationLevel deleted successfully.');
    } catch {
      return errorResponse('Failed to delete EducationLevel.', 500);
    }
  }
};
