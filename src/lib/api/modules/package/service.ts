/**
 * Service layer for Package
 * Business logic + Zod validation + cache + ApiResponse envelope.
 */

import { packageRepository } from './repository';
import { getCached, setCache, invalidateCache } from '../../cache';
import { successResponse, errorResponse, calculatePagination } from '../../types';
import type { ApiResponse } from '../../types';
import { validateCreatePackage, validateUpdatePackage, getFieldErrors } from './domain';
import type { PackageEntity } from './domain';

const CACHE_KEY = 'packages';

export const packageService = {
  async findAll(page: number = 1, limit: number = 50): Promise<ApiResponse<PackageEntity[]>> {
    try {
      const allData = await packageRepository.findAll();
      const totalData = allData.length;
      const start = (page - 1) * limit;
      const paginatedData = allData.slice(start, start + limit);
      return {
        error: false, statusCode: 200,
        message: 'Package retrieved successfully.',
        data: paginatedData,
        pagination: calculatePagination(totalData, page, limit)
      };
    } catch {
      return errorResponse('Failed to retrieve Package data.', 500);
    }
  },
  async findById(id: string): Promise<ApiResponse<PackageEntity>> {
    try {
      const item = await packageRepository.findById(id);
      if (!item) return errorResponse('Package not found.', 404);
      return successResponse(item, 'Package retrieved successfully.');
    } catch {
      return errorResponse('Failed to retrieve Package.', 500);
    }
  },
  async create(data: any): Promise<ApiResponse<PackageEntity>> {
    const parsed = validateCreatePackage(data);
    if (!parsed.success) {
      return { error: true, statusCode: 400, message: 'Validasi gagal.', data: null, fieldErrors: getFieldErrors(parsed.error) } as any;
    }
    try {
      const created = await packageRepository.create(parsed.data);
      invalidateCache([CACHE_KEY]);
      return successResponse(created, 'Package created successfully.', 201);
    } catch {
      return errorResponse('Failed to create Package.', 500);
    }
  },
  async update(id: string, data: any): Promise<ApiResponse<PackageEntity>> {
    const parsed = validateUpdatePackage(data);
    if (!parsed.success) {
      return { error: true, statusCode: 400, message: 'Validasi gagal.', data: null, fieldErrors: getFieldErrors(parsed.error) } as any;
    }
    try {
      const existing = await packageRepository.findById(id);
      if (!existing) return errorResponse('Package not found.', 404);
      const updated = await packageRepository.update(id, parsed.data);
      invalidateCache([CACHE_KEY]);
      return successResponse(updated, 'Package updated successfully.');
    } catch {
      return errorResponse('Failed to update Package.', 500);
    }
  },
  async softDelete(id: string): Promise<ApiResponse<{ id: string }>> {
    try {
      const existing = await packageRepository.findById(id);
      if (!existing) return errorResponse('Package not found.', 404);
      await packageRepository.softDelete(id);
      invalidateCache([CACHE_KEY]);
      return successResponse({ id }, 'Package deleted successfully.');
    } catch {
      return errorResponse('Failed to delete Package.', 500);
    }
  }
};
