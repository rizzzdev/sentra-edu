/**
 * Service layer for Notification
 * Business logic + Zod validation + cache + ApiResponse envelope.
 */

import { notificationRepository } from './repository';

import { successResponse, errorResponse, calculatePagination } from '../../types';
import type { ApiResponse } from '../../types';
import { validateCreateNotification, validateUpdateNotification, getFieldErrors } from './domain';
import type { NotificationEntity } from './domain';

export const notificationService = {
  async findAll(page: number = 1, limit: number = 50): Promise<ApiResponse<NotificationEntity[]>> {
    try {
      const allData = await notificationRepository.findAll();
      const totalData = allData.length;
      const start = (page - 1) * limit;
      const paginatedData = allData.slice(start, start + limit);
      return {
        error: false, statusCode: 200,
        message: 'Notification retrieved successfully.',
        data: paginatedData,
        pagination: calculatePagination(totalData, page, limit)
      };
    } catch {
      return errorResponse('Failed to retrieve Notification data.', 500);
    }
  },
  async create(data: any): Promise<ApiResponse<NotificationEntity>> {
    const parsed = validateCreateNotification(data);
    if (!parsed.success) {
      return { error: true, statusCode: 400, message: 'Validasi gagal.', data: null, fieldErrors: getFieldErrors(parsed.error) } as any;
    }
    try {
      const created = await notificationRepository.create(parsed.data);
      
      return successResponse(created, 'Notification created successfully.', 201);
    } catch {
      return errorResponse('Failed to create Notification.', 500);
    }
  },
  async findByUser(userId: string): Promise<ApiResponse<NotificationEntity[]>> {
    try {
      const items = await notificationRepository.findByUser(userId);
      return successResponse(items, 'Notifications retrieved successfully.');
    } catch {
      return errorResponse('Failed to retrieve notifications.', 500);
    }
  },
  async markAsRead(id: string): Promise<ApiResponse<{ id: string }>> {
    try {
      await notificationRepository.markAsRead(id);
      return successResponse({ id }, 'Notification marked as read.');
    } catch {
      return errorResponse('Failed to mark notification as read.', 500);
    }
  },
  async markAllAsRead(userId: string): Promise<ApiResponse<null>> {
    try {
      await notificationRepository.markAllAsRead(userId);
      return successResponse(null, 'All notifications marked as read.');
    } catch {
      return errorResponse('Failed to mark all notifications as read.', 500);
    }
  }
};
