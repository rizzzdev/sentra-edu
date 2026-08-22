/**
 * Service layer for Attendance
 * Business logic + Zod validation + cache + ApiResponse envelope.
 */

import { attendanceRepository } from './repository';
import { getCached, setCache, invalidateCache } from '../../cache';
import { successResponse, errorResponse, calculatePagination } from '$lib/api/types';
import type { ApiResponse } from '$lib/api/types';
import { validateCreateAttendance, validateUpdateAttendance, getFieldErrors } from '$lib/api/modules/attendance/domain';
import type { AttendanceEntity } from '$lib/api/modules/attendance/domain';

const CACHE_KEY = 'attendances';

export const attendanceService = {
  async findAll(page: number = 1, limit: number = 50): Promise<ApiResponse<AttendanceEntity[]>> {
    try {
      const allData = await attendanceRepository.findAll();
      const totalData = allData.length;
      const start = (page - 1) * limit;
      const paginatedData = allData.slice(start, start + limit);
      return {
        error: false, statusCode: 200,
        message: 'Attendance retrieved successfully.',
        data: paginatedData,
        pagination: calculatePagination(totalData, page, limit)
      };
    } catch (err) {
      console.error(`[attendanceService] Error:`, err);
      return errorResponse('Failed to retrieve Attendance data.', 500);
    }
  },
  async findById(id: string): Promise<ApiResponse<AttendanceEntity>> {
    try {
      const item = await attendanceRepository.findById(id);
      if (!item) return errorResponse('Attendance not found.', 404);
      return successResponse(item, 'Attendance retrieved successfully.');
    } catch (err) {
      console.error(`[attendanceService] Error:`, err);
      return errorResponse('Failed to retrieve Attendance.', 500);
    }
  },
  async create(data: any): Promise<ApiResponse<AttendanceEntity>> {
    const parsed = validateCreateAttendance(data);
    if (!parsed.success) {
      return { error: true, statusCode: 400, message: 'Validasi gagal: ' + Object.entries(getFieldErrors(parsed.error)).map(([k, v]) => `${k}: ${v}`).join(', '), data: null, fieldErrors: getFieldErrors(parsed.error) } as any;
    }
    try {
      const created = await attendanceRepository.create(parsed.data);
      invalidateCache([CACHE_KEY]);
      return successResponse(created, 'Attendance created successfully.', 201);
    } catch (err) {
      console.error(`[attendanceService] Error:`, err);
      return errorResponse('Failed to create Attendance.', 500);
    }
  },
  async update(id: string, data: any): Promise<ApiResponse<AttendanceEntity>> {
    const parsed = validateUpdateAttendance(data);
    if (!parsed.success) {
      return { error: true, statusCode: 400, message: 'Validasi gagal: ' + Object.entries(getFieldErrors(parsed.error)).map(([k, v]) => `${k}: ${v}`).join(', '), data: null, fieldErrors: getFieldErrors(parsed.error) } as any;
    }
    try {
      const existing = await attendanceRepository.findById(id);
      if (!existing) return errorResponse('Attendance not found.', 404);
      const updated = await attendanceRepository.update(id, parsed.data);
      invalidateCache([CACHE_KEY]);
      return successResponse(updated, 'Attendance updated successfully.');
    } catch (err) {
      console.error(`[attendanceService] Error:`, err);
      return errorResponse('Failed to update Attendance.', 500);
    }
  },
  async softDelete(id: string): Promise<ApiResponse<{ id: string }>> {
    try {
      const existing = await attendanceRepository.findById(id);
      if (!existing) return errorResponse('Attendance not found.', 404);
      await attendanceRepository.softDelete(id);
      invalidateCache([CACHE_KEY]);
      return successResponse({ id }, 'Attendance deleted successfully.');
    } catch (err) {
      console.error(`[attendanceService] Error:`, err);
      return errorResponse('Failed to delete Attendance.', 500);
    }
  }
};
