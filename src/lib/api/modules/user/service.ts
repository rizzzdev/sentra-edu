/**
 * Service layer for User
 * Business logic + Zod validation + cache + ApiResponse envelope.
 */

import { userRepository } from './repository';
import { getCached, setCache, invalidateCache } from '../../cache';
import { successResponse, errorResponse, calculatePagination } from '../../types';
import type { ApiResponse } from '../../types';
import { validateCreateUser, validateUpdateUser, getFieldErrors } from './domain';
import type { UserEntity } from './domain';

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
    } catch {
      return errorResponse('Failed to retrieve User data.', 500);
    }
  },
  async findById(id: string): Promise<ApiResponse<UserEntity>> {
    try {
      const item = await userRepository.findById(id);
      if (!item) return errorResponse('User not found.', 404);
      return successResponse(item, 'User retrieved successfully.');
    } catch {
      return errorResponse('Failed to retrieve User.', 500);
    }
  },
  async create(data: any): Promise<ApiResponse<UserEntity>> {
    const parsed = validateCreateUser(data);
    if (!parsed.success) {
      return { error: true, statusCode: 400, message: 'Validasi gagal.', data: null, fieldErrors: getFieldErrors(parsed.error) } as any;
    }
    try {
      const created = await userRepository.create(parsed.data);
      invalidateCache([CACHE_KEY]);
      return successResponse(created, 'User created successfully.', 201);
    } catch {
      return errorResponse('Failed to create User.', 500);
    }
  },
  async update(id: string, data: any): Promise<ApiResponse<UserEntity>> {
    const parsed = validateUpdateUser(data);
    if (!parsed.success) {
      return { error: true, statusCode: 400, message: 'Validasi gagal.', data: null, fieldErrors: getFieldErrors(parsed.error) } as any;
    }
    try {
      const existing = await userRepository.findById(id);
      if (!existing) return errorResponse('User not found.', 404);
      const updated = await userRepository.update(id, parsed.data);
      invalidateCache([CACHE_KEY]);
      return successResponse(updated, 'User updated successfully.');
    } catch {
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
    } catch {
      return errorResponse('Failed to delete User.', 500);
    }
  },
  async findByEmail(email: string): Promise<ApiResponse<UserEntity>> {
    try {
      const user = await userRepository.findByEmail(email);
      if (!user) return errorResponse('User not found.', 404);
      return successResponse(user, 'User retrieved successfully.');
    } catch {
      return errorResponse('Failed to find user by email.', 500);
    }
  },
  async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    const bcrypt = await import('bcryptjs');
    return bcrypt.compare(plainPassword, hashedPassword);
  }
};
