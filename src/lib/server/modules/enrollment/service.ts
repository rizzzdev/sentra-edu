/**
 * Service layer for Enrollment
 * Business logic + Zod validation + cache + ApiResponse envelope.
 */

import { enrollmentRepository } from './repository';
import { getCached, setCache, invalidateCache } from '../../cache';
import { successResponse, errorResponse, calculatePagination } from '$lib/api/types';
import type { ApiResponse } from '$lib/api/types';
import { validateCreateEnrollment, validateUpdateEnrollment, getFieldErrors } from '$lib/api/modules/enrollment/domain';
import type { EnrollmentEntity } from '$lib/api/modules/enrollment/domain';

const CACHE_KEY = 'enrollments';

export const enrollmentService = {
  async findAll(page: number = 1, limit: number = 50): Promise<ApiResponse<EnrollmentEntity[]>> {
    try {
      const allData = await enrollmentRepository.findAll();
      const totalData = allData.length;
      const start = (page - 1) * limit;
      const paginatedData = allData.slice(start, start + limit);
      return {
        error: false, statusCode: 200,
        message: 'Enrollment retrieved successfully.',
        data: paginatedData,
        pagination: calculatePagination(totalData, page, limit)
      };
    } catch (err) {
      console.error(`[enrollmentService] Error:`, err);
      return errorResponse('Failed to retrieve Enrollment data.', 500);
    }
  },
  async findById(id: string): Promise<ApiResponse<EnrollmentEntity>> {
    try {
      const item = await enrollmentRepository.findById(id);
      if (!item) return errorResponse('Enrollment not found.', 404);
      return successResponse(item, 'Enrollment retrieved successfully.');
    } catch (err) {
      console.error(`[enrollmentService] Error:`, err);
      return errorResponse('Failed to retrieve Enrollment.', 500);
    }
  },
  async create(data: any): Promise<ApiResponse<EnrollmentEntity>> {
    const parsed = validateCreateEnrollment(data);
    if (!parsed.success) {
      return { error: true, statusCode: 400, message: 'Validasi gagal: ' + Object.entries(getFieldErrors(parsed.error)).map(([k, v]) => `${k}: ${v}`).join(', '), data: null, fieldErrors: getFieldErrors(parsed.error) } as any;
    }
    try {
      const created = await enrollmentRepository.create(parsed.data);
      invalidateCache([CACHE_KEY]);
      return successResponse(created, 'Enrollment created successfully.', 201);
    } catch (err) {
      console.error(`[enrollmentService] Error:`, err);
      return errorResponse('Failed to create Enrollment.', 500);
    }
  },
  async update(id: string, data: any): Promise<ApiResponse<EnrollmentEntity>> {
    const parsed = validateUpdateEnrollment(data);
    if (!parsed.success) {
      return { error: true, statusCode: 400, message: 'Validasi gagal: ' + Object.entries(getFieldErrors(parsed.error)).map(([k, v]) => `${k}: ${v}`).join(', '), data: null, fieldErrors: getFieldErrors(parsed.error) } as any;
    }
    try {
      const existing = await enrollmentRepository.findById(id);
      if (!existing) return errorResponse('Enrollment not found.', 404);
      const updated = await enrollmentRepository.update(id, parsed.data);
      invalidateCache([CACHE_KEY]);
      return successResponse(updated, 'Enrollment updated successfully.');
    } catch (err) {
      console.error(`[enrollmentService] Error:`, err);
      return errorResponse('Failed to update Enrollment.', 500);
    }
  },
  async softDelete(id: string): Promise<ApiResponse<{ id: string }>> {
    try {
      const existing = await enrollmentRepository.findById(id);
      if (!existing) return errorResponse('Enrollment not found.', 404);
      await enrollmentRepository.softDelete(id);
      invalidateCache([CACHE_KEY]);
      return successResponse({ id }, 'Enrollment deleted successfully.');
    } catch (err) {
      console.error(`[enrollmentService] Error:`, err);
      return errorResponse('Failed to delete Enrollment.', 500);
    }
  }
};
