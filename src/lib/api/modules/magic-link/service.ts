/**
 * Service layer for MagicLink
 * Business logic + Zod validation + cache + ApiResponse envelope.
 */

import { magicLinkRepository } from './repository';
import { getCached, setCache, invalidateCache } from '../../cache';
import { successResponse, errorResponse, calculatePagination } from '../../types';
import type { ApiResponse } from '../../types';
import { validateCreateMagicLink, validateUpdateMagicLink, getFieldErrors } from './domain';
import type { MagicLinkEntity } from './domain';

const CACHE_KEY = 'magic-links';

export const magicLinkService = {
  async findAll(page: number = 1, limit: number = 50): Promise<ApiResponse<MagicLinkEntity[]>> {
    try {
      const allData = await magicLinkRepository.findAll();
      const totalData = allData.length;
      const start = (page - 1) * limit;
      const paginatedData = allData.slice(start, start + limit);
      return {
        error: false, statusCode: 200,
        message: 'MagicLink retrieved successfully.',
        data: paginatedData,
        pagination: calculatePagination(totalData, page, limit)
      };
    } catch {
      return errorResponse('Failed to retrieve MagicLink data.', 500);
    }
  },
  async findById(id: string): Promise<ApiResponse<MagicLinkEntity>> {
    try {
      const item = await magicLinkRepository.findById(id);
      if (!item) return errorResponse('MagicLink not found.', 404);
      return successResponse(item, 'MagicLink retrieved successfully.');
    } catch {
      return errorResponse('Failed to retrieve MagicLink.', 500);
    }
  },
  async create(data: any): Promise<ApiResponse<MagicLinkEntity>> {
    const parsed = validateCreateMagicLink(data);
    if (!parsed.success) {
      return { error: true, statusCode: 400, message: 'Validasi gagal.', data: null, fieldErrors: getFieldErrors(parsed.error) } as any;
    }
    try {
      const created = await magicLinkRepository.create(parsed.data);
      invalidateCache([CACHE_KEY]);
      return successResponse(created, 'MagicLink created successfully.', 201);
    } catch {
      return errorResponse('Failed to create MagicLink.', 500);
    }
  },
  async update(id: string, data: any): Promise<ApiResponse<MagicLinkEntity>> {
    const parsed = validateUpdateMagicLink(data);
    if (!parsed.success) {
      return { error: true, statusCode: 400, message: 'Validasi gagal.', data: null, fieldErrors: getFieldErrors(parsed.error) } as any;
    }
    try {
      const existing = await magicLinkRepository.findById(id);
      if (!existing) return errorResponse('MagicLink not found.', 404);
      const updated = await magicLinkRepository.update(id, parsed.data);
      invalidateCache([CACHE_KEY]);
      return successResponse(updated, 'MagicLink updated successfully.');
    } catch {
      return errorResponse('Failed to update MagicLink.', 500);
    }
  },
  async softDelete(id: string): Promise<ApiResponse<{ id: string }>> {
    try {
      const existing = await magicLinkRepository.findById(id);
      if (!existing) return errorResponse('MagicLink not found.', 404);
      await magicLinkRepository.softDelete(id);
      invalidateCache([CACHE_KEY]);
      return successResponse({ id }, 'MagicLink deleted successfully.');
    } catch {
      return errorResponse('Failed to delete MagicLink.', 500);
    }
  },
  async findByToken(token: string): Promise<ApiResponse<MagicLinkEntity>> {
    try {
      const link = await magicLinkRepository.findByToken(token);
      if (!link) return errorResponse('Magic link not found.', 404);
      return successResponse(link, 'Magic link retrieved successfully.');
    } catch {
      return errorResponse('Failed to find magic link.', 500);
    }
  }
};
