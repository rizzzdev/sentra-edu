/**
 * Service layer for User
 * Business logic + Zod validation + cache + ApiResponse envelope.
 */

import { userRepository } from './repository';
import { getCached, setCache, invalidateCache } from '../../cache';
import { successResponse, errorResponse, calculatePagination } from '$lib/api/types';
import type { ApiResponse } from '$lib/api/types';
import { validateCreateUser, validateUpdateUser, getFieldErrors } from '$lib/api/modules/user/domain';
import type { UserEntity } from '$lib/api/modules/user/domain';

const CACHE_KEY = 'users';

export const userService = {
  async findAll(page: number = 1, limit: number = 50): Promise<ApiResponse<UserEntity[]>> {
    try {
      const allData = await userRepository.findAll();
      const totalData = allData.length;
      const start = (page - 1) * limit;
      const paginatedData = allData.slice(start, start + limit);
      return {
        error: false, statusCode: 200,
        message: 'User retrieved successfully.',
        data: paginatedData,
        pagination: calculatePagination(totalData, page, limit)
      };
    } catch (err) {
      console.error(`[userService] Error:`, err);
      return errorResponse('Failed to retrieve User data.', 500);
    }
  },
  async findById(id: string): Promise<ApiResponse<UserEntity>> {
    try {
      const item = await userRepository.findById(id);
      if (!item) return errorResponse('User not found.', 404);
      return successResponse(item, 'User retrieved successfully.');
    } catch (err) {
      console.error(`[userService] Error:`, err);
      return errorResponse('Failed to retrieve User.', 500);
    }
  },
  async create(data: any): Promise<ApiResponse<UserEntity>> {
    const parsed = validateCreateUser(data);
    if (!parsed.success) {
      return { error: true, statusCode: 400, message: 'Validasi gagal: ' + Object.entries(getFieldErrors(parsed.error)).map(([k, v]) => `${k}: ${v}`).join(', '), data: null, fieldErrors: getFieldErrors(parsed.error) } as any;
    }
    try {
      const userData = { ...parsed.data };
      if (userData.password && !userData.password.startsWith('$2')) {
        const bcrypt = await import('bcryptjs');
        userData.password = await bcrypt.hash(userData.password, 10);
      }
      const created = await userRepository.create(userData);
      invalidateCache([CACHE_KEY]);
      return successResponse(created, 'User created successfully.', 201);
    } catch (err) {
      console.error(`[userService] Error:`, err);
      return errorResponse('Failed to create User.', 500);
    }
  },
  async update(id: string, data: any): Promise<ApiResponse<UserEntity>> {
    const parsed = validateUpdateUser(data);
    if (!parsed.success) {
      return { error: true, statusCode: 400, message: 'Validasi gagal: ' + Object.entries(getFieldErrors(parsed.error)).map(([k, v]) => `${k}: ${v}`).join(', '), data: null, fieldErrors: getFieldErrors(parsed.error) } as any;
    }
    try {
      const existing = await userRepository.findById(id);
      if (!existing) return errorResponse('User not found.', 404);
      const updateData = { ...parsed.data };
      if (updateData.password && !updateData.password.startsWith('$2')) {
        const bcrypt = await import('bcryptjs');
        updateData.password = await bcrypt.hash(updateData.password, 10);
      }
      const updated = await userRepository.update(id, updateData);
      invalidateCache([CACHE_KEY]);
      return successResponse(updated, 'User updated successfully.');
    } catch (err) {
      console.error(`[userService] Error:`, err);
      return errorResponse('Failed to update User.', 500);
    }
  },
  async softDelete(id: string): Promise<ApiResponse<{ id: string }>> {
    try {
      const existing = await userRepository.findById(id);
      if (!existing) return errorResponse('User not found.', 404);
      await userRepository.softDelete(id);
      invalidateCache([CACHE_KEY]);
      return successResponse({ id }, 'User deleted successfully.');
    } catch (err) {
      console.error(`[userService] Error:`, err);
      return errorResponse('Failed to delete User.', 500);
    }
  },
  async findByEmail(email: string): Promise<ApiResponse<UserEntity>> {
    try {
      const user = await userRepository.findByEmail(email);
      if (!user) return errorResponse('User not found.', 404);
      return successResponse(user, 'User retrieved successfully.');
    } catch (err) {
      console.error(`[userService] Error:`, err);
      return errorResponse('Failed to find user by email.', 500);
    }
  },
  async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    if (!hashedPassword) return false;
    if (plainPassword === hashedPassword) return true;
    try {
      const bcrypt = await import('bcryptjs');
      return bcrypt.compare(plainPassword, hashedPassword);
    } catch {
      return false;
    }
  }
};
